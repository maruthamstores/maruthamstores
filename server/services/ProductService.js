const Product = require("../models/product");
const Cart = require("../models/cart");
const {
  uploadMultipleFiles,
  formatMultipleResponse,
  deleteFile,
} = require("../services/UploadService");

// ─── Get all products ────────────────────────────────────────────────────────
const getProducts = async () => {
  return await Product.find().populate("category").sort({ createdAt: -1 });
};

// ─── Get product by ID ───────────────────────────────────────────────────────
const getProductById = async (id) => {
  return await Product.findById(id).populate("category");
};

// ─── Create a product ────────────────────────────────────────────────────────
const createProduct = async (data, files = []) => {
  let imagePaths = [];

  // Upload new files to Cloudinary
  if (files.length > 0) {
    const uploadedFiles = await uploadMultipleFiles(files, "products");
    imagePaths = formatMultipleResponse(uploadedFiles);
  }

  const product = new Product({ ...data, images: imagePaths });
  return await product.save();
};

// ─── Update product by ID ────────────────────────────────────────────────────
const updateProduct = async (id, data, files = []) => {
  // Fetch existing product to compute which images were removed
  const existingProduct = await Product.findById(id);
  if (!existingProduct) return null;

  // currentImages are already parsed {url, public_id} objects from controller
  const keptImages = Array.isArray(data.currentImages) ? data.currentImages : [];

  // Delete images from Cloudinary that were removed by the admin
  const removedImages = existingProduct.images.filter(
    (img) => !keptImages.some((kept) => kept.url === img.url)
  );
  for (const img of removedImages) {
    if (img.public_id) {
      try {
        await deleteFile(img.public_id);
      } catch (err) {
        console.warn(`Failed to delete image from Cloudinary: ${img.public_id}`, err.message);
        // Do not crash — just warn. The DB update should still proceed.
      }
    }
  }

  // Upload any new image files to Cloudinary
  let newUploadedImages = [];
  if (files && files.length > 0) {
    const uploadedFiles = await uploadMultipleFiles(files, "products");
    newUploadedImages = formatMultipleResponse(uploadedFiles);
  }

  // Merge kept images with newly uploaded images
  const mergedImages = [...keptImages, ...newUploadedImages];

  // Build the update payload — strip out raw `currentImages` field
  const { currentImages, ...updateFields } = data;
  updateFields.images = mergedImages;

  return await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
};

// ─── Delete product by ID ────────────────────────────────────────────────────
const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  // Delete all associated images from Cloudinary
  for (const img of product.images) {
    if (img.public_id) {
      try {
        await deleteFile(img.public_id);
      } catch (err) {
        console.warn(`Failed to delete image from Cloudinary: ${img.public_id}`, err.message);
      }
    }
  }

  const deletedProduct = await Product.findByIdAndDelete(id);
  await Cart.updateMany(
    { "items.product": id },
    { $pull: { items: { product: id } } }
  );

  return deletedProduct;
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
