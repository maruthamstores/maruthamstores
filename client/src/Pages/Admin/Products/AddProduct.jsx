import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AddProduct = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [category, setCategory] = useState(""); // ObjectId
  const [description, setDescription] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [offerLine, setOfferLine] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [stock, setStock] = useState(0);
  const [isBestsell, setIsBestsell] = useState(false);
  const [categories, setCategories] = useState([]); // fetched categories
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);
        setCategories(res.data); // expect array of {_id, name}
      } catch (err) {
        console.error(err);
        setError("Failed to fetch categories");
      }
    };
    fetchCategories();
  }, []);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(src => URL.revokeObjectURL(src));
    };
  }, [imagePreviews]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category); // ObjectId
      formData.append("description", description);
      formData.append("old_price", oldPrice);
      formData.append("new_price", newPrice);
      formData.append("offer_line", offerLine);
      formData.append("stock", stock);
      formData.append("is_bestsell", isBestsell);

      images.forEach((image) => formData.append("images", image));

      const res = await axios.post(`${API_URL}/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("Product added successfully!");
      console.log(res.data);

      // reset form
      setName("");
      setCategory("");
      setDescription("");
      setOldPrice("");
      setNewPrice("");
      setOfferLine("");
      setImages([]);
      setImagePreviews([]);
      setStock(0);
      setIsBestsell(false);
    } catch (err) {
      console.error(err);
      setError("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Inter'] text-lg">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
          <Link to="/admin/products" className="text-gray-500 hover:text-gray-700 text-2xl">
            <i className="fas fa-times"></i>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Old & New Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Old Price</label>
              <input
                type="number"
                placeholder="Old Price"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                onWheel={(e) => e.target.blur()}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">New Price *</label>
              <input
                type="number"
                placeholder="New Price"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onWheel={(e) => e.target.blur()}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </div>

          {/* Offer Line */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Offer Line</label>
            <input
              type="text"
              placeholder="Offer Line"
              value={offerLine}
              onChange={(e) => setOfferLine(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Product Images</label>
            <div className="mt-1 flex items-center gap-2">
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-white py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-upload mr-2"></i> Choose Files
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="sr-only"
              />
            </div>

            {/* Image Previews */}
            <div className="mt-2 flex gap-2 flex-wrap">
              {imagePreviews.length > 0 ? (
                imagePreviews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Preview ${index}`}
                    className="w-20 h-20 object-cover rounded-md border border-gray-200"
                  />
                ))
              ) : (
                <span className="text-gray-500">No files chosen</span>
              )}
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Stock</label>
            <input
              type="number"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              onWheel={(e) => e.target.blur()}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Best Seller */}
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isBestsell}
                onChange={(e) => setIsBestsell(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-gray-700 text-base">Best Seller</span>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-base ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i> Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
