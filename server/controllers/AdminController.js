  const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "supersecretadmin";

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // ✅ Strict exact-case check for the Admin Username from seedAdmin.js
    // Mongoose transforms it to lowercase automatically, so we enforce exact case matching manually here before querying.
    if (email !== "MARUTHAMSTORES") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // ✅ 10 YEARS JWT TOKEN
    const token = jwt.sign(
      {
        adminId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: 'admin'
      },
      ADMIN_JWT_SECRET,
      {
        expiresIn: "10y" // ✅ 10 YEARS JWT expiry
      }
    );

    // ✅ 10 YEARS COOKIE - 3650 DAYS
    res.cookie("admin_jwt", token, {
      httpOnly: true,                    // ✅ Prevent XSS
      secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in prod
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ Dynamic sameSite
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // ✅ 10 YEARS (3650 days)
      path: '/',                         // ✅ Explicit path
    });

    // ✅ Set CORS headers for credentials
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.status(200).json({
      message: "Admin login successful - 10 year session",
      admin: { id: user._id, name: user.name, email: user.email },
      tokenSet: true,
      expiresIn: "10 years" // ✅ Debug info
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- GET ADMIN PROFILE -------------------
const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin; // set by JWT middleware
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized - No admin token" });
    }

    // ✅ Get cookie token for verification
    const token = req.cookies?.admin_jwt;
    if (!token) {
      return res.status(401).json({ message: "No admin token found" });
    }

    // ✅ Verify token and get expiry
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    // ✅ Fetch fresh admin data
    const user = await Admin.findById(decoded.adminId).select('name email role createdAt');
    if (!user) {
      return res.status(403).json({ message: "Admin access revoked" });
    }

    // ✅ Calculate remaining time
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    const yearsLeft = Math.floor(expiresIn / (365.25 * 24 * 60 * 60));

    res.status(200).json({
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        is_superuser: user.is_superuser
      },
      sessionActive: true,
      expiresInYears: yearsLeft,
      totalExpiry: "10 years"
    });
  } catch (err) {
    console.error('Get admin profile error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- LOGOUT ADMIN -------------------
const logoutAdmin = async (req, res) => {
  try {
    // ✅ Clear 10-year cookie with EXACT SAME CONFIG
    res.clearCookie("admin_jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: '/',
      maxAge: 0 // ✅ Immediate expiry
    });

    // ✅ Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.status(200).json({
      message: "Admin logged out successfully - 10 year session cleared",
      tokenCleared: true
    });
  } catch (err) {
    console.error('Logout admin error:', err);
    res.status(500).json({ message: "Logout failed" });
  }
};

// ------------------- CHECK ADMIN STATUS (10 YEARS) -------------------
const checkAdminStatus = async (req, res) => {
  try {
    const token = req.cookies?.admin_jwt;
    if (!token) {
      return res.status(401).json({
        isAdmin: false,
        message: "No token",
        expiresIn: "0 years"
      });
    }

    // ✅ Verify 10-year token
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    const user = await Admin.findById(decoded.adminId).select('role');
    if (!user) {
      return res.status(401).json({ isAdmin: false, message: "Not an admin", expiresIn: "0 years" });
    }

    // ✅ Calculate remaining years
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    const yearsLeft = Math.floor(expiresIn / (365.25 * 24 * 60 * 60));

    res.status(200).json({
      isAdmin: true,
      admin: { id: decoded.adminId, email: decoded.email },
      expiresInYears: yearsLeft,
      totalExpiry: "10 years",
      expiresInSeconds: expiresIn
    });
  } catch (err) {
    console.error('Check admin status error:', err);
    res.status(401).json({
      isAdmin: false,
      message: "Invalid/expired token - please login again",
      expiresIn: "0 years"
    });
  }
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  checkAdminStatus,
};