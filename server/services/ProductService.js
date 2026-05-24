const Product = require("../models/product");
const {
  uploadSingleFile,
  uploadMultipleFiles,
  formatSingleResponse,
  formatMultipleResponse,
  deleteFile,
} = require("../services/UploadService");

// Get all products
const getProducts = async () => {
  try {
    return await Product.find().populate("category").sort({ createdAt: -1 });
  } catch (error) {
    throw new Error("Failed to fetch products: " + error.message);
  }
};

// Create a product
const createProduct = async (data, files = []) => {
  try {
    let imagePaths = [];

    // Upload files to Cloudinary
    if (files.length > 0) {
      const uploadedFiles = await uploadMultipleFiles(files);
      imagePaths = formatMultipleResponse(uploadedFiles);
    }

    const product = new Product({ ...data, images: imagePaths });
    return await product.save();
  } catch (error) {
    throw new Error("Failed to create product: " + error.message);
  }
};


// Update product by ID
const updateProduct = async (id, data, files = []) => {
  try {
    // currentImages are already parsed {url, public_id} objects from controller
    let mergedImages = Array.isArray(data.currentImages) ? [...data.currentImages] : [];

    // Upload any new files to Cloudinary and append
    if (files && files.length > 0) {
      const uploadedFiles = await uploadMultipleFiles(files);
      const newImages = formatMultipleResponse(uploadedFiles);
      mergedImages = [...mergedImages, ...newImages];
    }

    // Build the update payload — remove the raw `currentImages` field
    const { currentImages, ...updateFields } = data;
    updateFields.images = mergedImages;

    // Update product in DB
    return await Product.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
  } catch (error) {
    throw new Error("Failed to update product: " + error.message);
  }
};

// Optional: delete old image from Cloudinary
const removeOldImage = async (public_id) => {
  if (!public_id) return;
  await deleteFile(public_id);
};




// Delete product by ID
const deleteProduct = async (id) => {
  try {
    const product = await Product.findById(id);
    if (product && product.images) {
      // Delete all associated images from Cloudinary
      for (const img of product.images) {
        await deleteFile(img.public_id);
      }
    }
    return await Product.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Failed to delete product: " + error.message);
  }
};
// Get single product by ID
const getProductById = async (id) => {
  try {
    return await Product.findById(id).populate("category");
  } catch (error) {
    throw new Error("Failed to fetch product: " + error.message);
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  removeOldImage // add here
};
