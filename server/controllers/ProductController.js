const productService = require('../services/ProductService');
const mongoose = require("mongoose");

// GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    // Validate category
    if (!req.body.category || req.body.category === "") {
      return res.status(400).json({ message: "Category is required" });
    }

    // Convert category string to ObjectId
    let categoryId;
    try {
      categoryId = new mongoose.Types.ObjectId(req.body.category);
    } catch (e) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Convert string booleans from FormData to actual booleans
    const productData = {
      ...req.body,
      category: categoryId,
      is_bestsell: req.body.is_bestsell === "true" || req.body.is_bestsell === true,
    };

    if (productData.old_price === "" || productData.old_price === "null" || productData.old_price === "undefined") delete productData.old_price;
    if (productData.new_price === "" || productData.new_price === "null" || productData.new_price === "undefined") delete productData.new_price;
    if (productData.stock === "" || productData.stock === "null" || productData.stock === "undefined") delete productData.stock;

    const product = await productService.createProduct(productData, files);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const { currentImages } = req.body;

    // Parse currentImages JSON if sent as strings
    let parsedCurrentImages = [];
    if (currentImages) {
      const rawArr = Array.isArray(currentImages) ? currentImages : [currentImages];
      parsedCurrentImages = rawArr.map(img => {
        const parsed = typeof img === 'string' ? JSON.parse(img) : img;
        return {
          url: parsed.url,
          public_id: parsed.public_id || parsed.url, // fallback so schema required field is satisfied
        };
      });
    }

    // Convert category to ObjectId if provided
    let categoryId;
    if (req.body.category && req.body.category !== "") {
      try {
        categoryId = new mongoose.Types.ObjectId(req.body.category);
      } catch (e) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
    }

    // Convert string booleans from FormData to actual booleans
    const productData = {
      ...req.body,
      currentImages: parsedCurrentImages,
      is_bestsell: req.body.is_bestsell === "true" || req.body.is_bestsell === true,
      is_active: req.body.is_active === "true" || req.body.is_active === true,
    };

    if (categoryId) productData.category = categoryId;

    if (productData.old_price === "" || productData.old_price === "null" || productData.old_price === "undefined") delete productData.old_price;
    if (productData.new_price === "" || productData.new_price === "null" || productData.new_price === "undefined") delete productData.new_price;
    if (productData.stock === "" || productData.stock === "null" || productData.stock === "undefined") delete productData.stock;

    const product = await productService.updateProduct(req.params.id, productData, files);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};




// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
// GET /api/products/:id
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

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById, // add here
};
