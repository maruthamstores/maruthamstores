const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const appRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 3000;

const isProd = process.env.NODE_ENV === "production";

// ------------------- Trust Proxy for Vercel -------------------
app.set('trust proxy', 1); // Add this line

// ------------------- CORS -------------------
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : [];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ------------------- Middleware -------------------
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// ------------------- User Session -------------------
const userSession = session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET || "SecretKey",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    httpOnly: true,
  },
});

app.use(userSession);

// ------------------- Routes -------------------
appRoutes(app);

app.get("/", (req, res) => res.json({ message: "Backend running!" }));

// ------------------- Error Handling -------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ------------------- DB Connect -------------------
connectDB()
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("Failed to connect to DB:", err));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
module.exports = app;