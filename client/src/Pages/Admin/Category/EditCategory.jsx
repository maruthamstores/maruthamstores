import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditCategory = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Fetch category on mount
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories/${id}`);
        setName(res.data.name);
          setCurrentImage(res.data.image?.url || null); // 👈 assume backend returns { image: { url, public_id } }
      } catch (err) {
        console.error("Failed to fetch category:", err);
      }
    };
    fetchCategory();
  }, [id]);

  // ✅ Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      await axios.put(`${API_URL}/api/categories/${id}`, formData);
      navigate("/admin/categories");
    } catch (err) {
      console.error("Failed to update category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Handle delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_URL}/api/categories/${id}`);
        navigate("/admin/categories");
      } catch (err) {
        console.error("Failed to delete category:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6 font-['Inter'] text-lg">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-8 flex flex-col lg:flex-row relative">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 pr-0 lg:pr-6">
          {/* Name Field */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Current Image */}
          {currentImage && (
            <div className="text-base text-gray-700">
              <p className="mb-2">Current Image:</p>
              <img
                src={currentImage}
                alt="Current category"
                className="w-32 h-32 object-cover border rounded"
              />
            </div>
          )}

          {/* Change File */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Change Image
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
        </form>

        {/* Right-side Buttons */}
        <div className="w-full lg:w-64 mt-6 lg:mt-0 lg:ml-6 flex flex-col space-y-3 sticky top-8">
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full flex justify-center py-3 px-4 rounded-md text-white bg-green-600 hover:bg-green-700 text-base font-medium shadow ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
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

export default EditCategory;
