import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AddCategory = () => {
  const API_URL = import.meta.env.VITE_API_URL; // your backend URL
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image); // optional

      const res = await axios.post(`${API_URL}/api/categories`, formData, {
        withCredentials: true, // if your backend needs cookies/auth
      });

      alert("Category added successfully!");
      console.log("Category created:", res.data);

      // Reset form
      setName("");
      setImage(null);
    } catch (err) {
      console.error(err);
      setError("Failed to add category. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-['Inter'] text-lg">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Add New Category</h1>
          <Link to="/admin/categories" className="text-gray-500 hover:text-gray-700 text-2xl">
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
          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="e.g. Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Category Image */}
          <div>
            <label htmlFor="image" className="block text-base font-medium text-gray-700 mb-2">
              Category Image (Optional)
            </label>
            <div className="mt-1 flex items-center">
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-white py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <i className="fas fa-upload mr-2"></i> Choose File
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="sr-only"
              />
              <span className="ml-3 text-base text-gray-500">
                {image ? image.name : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-base ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i> Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i> Add Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
