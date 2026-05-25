const productService = require('../services/ProductService');
const mongoose = require("mongoose");

/**
 * Safely parse a numeric value from FormData string.
 * Returns the number if valid, or null/undefined to signal "not provided".
 */
const parseNumber = (val) => {
  if (val === undefined || val === null || val === "" || val === "null" || val === "undefined") {
    return undefined; // will be excluded from the update
  }
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

/**
 * Parse boolean from FormData string ("true"/"false"/true/false)
 */
const parseBoolean = (val, defaultVal = false) => {
  if (val === "true" || val === true) return true;
  if (val === "false" || val === false) return false;
  return defaultVal;
};

/**
 * Sanitize string fields — treat "null"/"undefined" as empty string.
 */
const parseString = (val) => {
  if (val === "null" || val === "undefined" || val === undefined) return "";
  return String(val).trim();
};

// ─── GET /api/products ──────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/products/:id ──────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/products ─────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    // ── Validate required fields ──
    if (!req.body.name || String(req.body.name).trim() === "") {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!req.body.category || req.body.category === "") {
      return res.status(400).json({ message: "Category is required" });
    }
    if (req.body.new_price === "" || req.body.new_price === undefined || req.body.new_price === null) {
      return res.status(400).json({ message: "New price is required" });
    }

    // ── Convert category string to ObjectId ──
    let categoryId;
    try {
      categoryId = new mongoose.Types.ObjectId(req.body.category);
    } catch (e) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // ── Safely parse numeric fields ──
    const new_price = parseNumber(req.body.new_price);
    const old_price = parseNumber(req.body.old_price);
    const stock = parseNumber(req.body.stock);

    if (new_price === undefined || isNaN(new_price)) {
      return res.status(400).json({ message: "New price must be a valid number" });
    }

    // ── Build clean product data object ──
    const productData = {
      name: String(req.body.name).trim(),
      category: categoryId,
      description: parseString(req.body.description),
      offer_line: parseString(req.body.offer_line),
      new_price,
      is_bestsell: parseBoolean(req.body.is_bestsell, false),
    };

    if (old_price !== undefined) productData.old_price = old_price;
    if (stock !== undefined) productData.stock = stock;

    const product = await productService.createProduct(productData, files);
    return res.status(201).json(product);
  } catch (error) {
    // Surface Mongoose validation errors clearly
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message: messages });
    }
    next(error);
  }
};

// ─── PUT /api/products/:id ──────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const { currentImages } = req.body;

    // ── Validate product ID ──
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // ── Parse currentImages (sent as JSON strings from FormData) ──
    let parsedCurrentImages = [];
    if (currentImages) {
      const rawArr = Array.isArray(currentImages) ? currentImages : [currentImages];
      parsedCurrentImages = rawArr.map(img => {
        try {
          const parsed = typeof img === "string" ? JSON.parse(img) : img;
          return {
            url: parsed.url,
            public_id: parsed.public_id || parsed.url, // fallback for legacy data
          };
        } catch (parseErr) {
          console.warn("Failed to parse currentImage entry:", img);
          return null;
        }
      }).filter(Boolean); // remove nulls from failed parses
    }

    // ── Convert category to ObjectId if provided ──
    let categoryId;
    if (req.body.category && req.body.category !== "") {
      try {
        categoryId = new mongoose.Types.ObjectId(req.body.category);
      } catch (e) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    // ── Safely parse numeric fields ──
    const new_price = parseNumber(req.body.new_price);
    const old_price = parseNumber(req.body.old_price);
    const stock = parseNumber(req.body.stock);

    if (new_price === undefined) {
      return res.status(400).json({ message: "New price is required" });
    }

    // ── Build clean update payload ──
    const productData = {
      name: req.body.name ? String(req.body.name).trim() : undefined,
      description: parseString(req.body.description),
      offer_line: parseString(req.body.offer_line),
      new_price,
      is_bestsell: parseBoolean(req.body.is_bestsell, false),
      is_active: parseBoolean(req.body.is_active, true),
      currentImages: parsedCurrentImages,
    };

    // Only set optional fields if they were actually provided
    if (old_price !== undefined) productData.old_price = old_price;
    if (stock !== undefined) productData.stock = stock;
    if (categoryId) productData.category = categoryId;

    const product = await productService.updateProduct(req.params.id, productData, files);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.json(product);
  } catch (error) {
    // Surface Mongoose validation errors clearly
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message).join(", ");
      return res.status(400).json({ message: messages });
    }
    next(error);
  }
};

// ─── DELETE /api/products/:id ────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    await productService.deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
