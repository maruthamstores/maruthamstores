import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // New state for description
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [oldprice, setOldPrice] = useState("");
  const [newprice, setNewPrice] = useState("");
  const [stock, setStock] = useState("");
  const [offerLine, setOfferLine] = useState("");
  const [bestsell, setBestsell] = useState(false);
  const [status, setStatus] = useState("Active");
  const [currentImages, setCurrentImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product & categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/${id}`, { withCredentials: true }),
          axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
        ]);
        const product = productRes.data;
        setName(product.name);
        setDescription(product.description || ""); // Set description from API
        setCategory(product.category?._id || "");
        setNewPrice(product.new_price);
        setOldPrice(product.old_price);
        setStock(product.stock);
        setOfferLine(product.offer_line || "");
        setBestsell(product.is_bestsell);
        setStatus(product.is_active ? "Active" : "Inactive");
        setCurrentImages(product.images.map(img => ({ url: img.url, public_id: img.public_id })));
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch product data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle adding new images with max 4 limit
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - currentImages.length - newImages.length;

    if (availableSlots <= 0) {
      alert("You can only have up to 4 images. Delete one to add another.");
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);
    setNewImages([...newImages, ...filesToAdd]);

    if (filesToAdd.length < files.length) {
      alert(`You can only add ${availableSlots} more image(s).`);
    }
  };

  const removeCurrentImage = (imgObj) => {
    setCurrentImages(currentImages.filter(img => img.url !== imgObj.url));
  };

  const removeNewImage = (file) => {
    setNewImages(newImages.filter(img => img !== file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description); // Append description
      formData.append("category", category);
      formData.append("new_price", newprice);
      formData.append("old_price", oldprice);
      formData.append("offer_line", offerLine);
      formData.append("stock", stock);
      formData.append("is_bestsell", bestsell);
      formData.append("is_active", status === "Active");

      // Append existing images as JSON
      currentImages.forEach(imgObj =>
        formData.append("currentImages", JSON.stringify({ url: imgObj.url, public_id: imgObj.public_id || null }))
      );

      // Append new images
      newImages.forEach(file => formData.append("images", file));

      await axios.put(`${API_URL}/api/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/api/products/${id}`, { withCredentials: true });
      alert("Product deleted successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6 font-['Inter'] text-lg">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow p-8 flex flex-col lg:flex-row relative">
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 pr-0 lg:pr-6">
          {/* Name */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Enter product description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">OldPrice *</label>
              <input
                type="number"
                value={oldprice}
                onChange={(e) => setOldPrice(e.target.value)}
                onWheel={(e) => e.target.blur()}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">NewPrice *</label>
              <input
                type="number"
                value={newprice}
                onChange={(e) => setNewPrice(e.target.value)}
                onWheel={(e) => e.target.blur()}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Stock *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
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
              value={offerLine}
              onChange={(e) => setOfferLine(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g. 10% Launch Offer"
            />
          </div>

          {/* Bestsell & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Bestsell</label>
              <select
                value={bestsell ? "Yes" : "No"}
                onChange={(e) => setBestsell(e.target.value === "Yes")}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Current Images */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Current Images</label>
            <div className="flex flex-wrap gap-4">
              {currentImages.map((img) => (
                <div key={img.url} className="relative w-32 h-32 border rounded flex items-center justify-center overflow-hidden">
                  <img src={img.url} alt="Current" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeCurrentImage(img)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Images */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Add Images</label>
            <div className="flex flex-wrap gap-4">
              <label className={`w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 text-gray-400 text-4xl font-bold ${currentImages.length + newImages.length >= 4 ? "opacity-50 cursor-not-allowed" : ""}`}>
                +
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddImages}
                  className="hidden"
                  disabled={currentImages.length + newImages.length >= 4}
                />
              </label>

              {newImages.map((file, idx) => (
                <div key={idx} className="relative w-32 h-32 border rounded flex items-center justify-center overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt={file.name} className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(file)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Right-side floating buttons */}
        <div className="w-full lg:w-64 mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3 sticky top-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 text-base font-medium shadow ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex justify-center py-3 px-4 rounded-md text-white bg-red-600 hover:bg-red-700 text-base font-medium shadow"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;