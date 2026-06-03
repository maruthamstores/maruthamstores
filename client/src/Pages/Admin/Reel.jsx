import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const EditReelsSection = () => {
  const [reels, setReels] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const newReelRef = useRef();

  // Fetch reels from server
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/reels`);
        setReels(
          data.map((r) => ({
            _id: r._id,
            media: r.media[0] || null,
            video: r.media[0]?.url || null,
            product: r.product?._id || "",
            status: r.is_active ? "Active" : "Inactive",
            videoError: false,
            productError: false,
            uploadProgress: 0,
            isNew: false, // old reels
          }))
        );
      } catch (err) {
        console.error("Failed to fetch reels:", err);
      }
    };
    fetchReels();
  }, []);

  // Fetch products from server
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProductsList(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Add new reel
  const handleAddReel = () => {
    setReels([
      {
        video: null,
        product: "",
        status: "Active",
        media: null,
        videoError: false,
        productError: false,
        uploadProgress: 0,
        isNew: true, // mark new reel
      },
      ...reels,
    ]);
  };

  // Scroll to new reel
  useEffect(() => {
    if (newReelRef.current) newReelRef.current.scrollIntoView({ behavior: "smooth" });
  }, [reels]);

  // Handle video upload
  const handleVideoChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("video/")) {
      alert("Only video files are allowed");
      return;
    }

    const updated = [...reels];
    updated[index].videoError = false;

    // Revoke old object URL if exists to allow same file upload
    if (updated[index].video) URL.revokeObjectURL(updated[index].video);

    updated[index].video = URL.createObjectURL(file);
    setReels(updated);

    try {
      const sigRes = await axios.get(`${API_URL}/api/reels/signature`);
      const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            const temp = [...reels];
            temp[index].uploadProgress = progress;
            setReels(temp);
          },
        }
      );

      updated[index].media = {
        url: cloudRes.data.secure_url,
        public_id: cloudRes.data.public_id,
        type: "video",
      };
      setReels(updated);
    } catch (err) {
      console.error("Video upload failed:", err);
      alert("Video upload failed. Try again.");
    }
  };

  // Handle input changes
  const handleFieldChange = (index, field, value) => {
    const updated = [...reels];
    updated[index][field] = value;
    if (field === "product") updated[index].productError = false;
    setReels(updated);
  };

  // Delete reel
  const handleDelete = async (index) => {
    const reel = reels[index];
    if (!reel._id) {
      setReels(reels.filter((_, i) => i !== index));
      return;
    }

    if (window.confirm("Delete this reel?")) {
      try {
        await axios.delete(`${API_URL}/api/reels/${reel._id}`);
        setReels(reels.filter((_, i) => i !== index));
      } catch (err) {
        console.error("Failed to delete reel:", err);
      }
    }
  };

  // Save only new reels
  const handleSave = async () => {
    const newReels = reels.filter(r => r.isNew);

    let isValid = true;
    newReels.forEach((r) => {
      if (!r.media?.url) r.videoError = true;
      if (!r.product) r.productError = true;
      if (!r.media?.url || !r.product) isValid = false;
    });

    setReels([...reels]);
    if (!isValid) {
      alert("Please fill all required fields (video and product).");
      return;
    }

    if (newReels.length === 0) {
      alert("No new reels to save.");
      return;
    }

    setIsSubmitting(true);
    try {
      for (let reel of newReels) {
        const payload = {
          product: reel.product,
          media: reel.media,
          is_active: reel.status === "Active",
        };

        await axios.post(`${API_URL}/api/reels`, payload); // POST only
        reel.isNew = false;
      }

      alert("New reels saved successfully!");
      setReels([...reels]);
    } catch (err) {
      console.error(err);
      alert("Error saving new reels.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave = reels.some(r => r.isNew && r.media?.url && r.product);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-['Inter']">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6 relative">
        <h1 className="text-3xl font-bold mb-6">Edit Reels Section</h1>

        <button
          onClick={handleAddReel}
          className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <i className="fas fa-plus"></i> Add Reel
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {reels.map((item, idx) => (
            <div key={item._id || idx} ref={idx === 0 ? newReelRef : null} className="border rounded-md p-3 relative group">
              <button
                onClick={() => handleDelete(idx)}
                className="absolute text-sm top-2 right-2 bg-red-700 text-white px-3 rounded-full opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video <span className="text-red-500">*</span>
                </label>
                <label
                  className={`flex items-center justify-center border-2 border-dashed rounded-md h-24 cursor-pointer hover:bg-gray-50 ${
                    item.videoError ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <input type="file" accept="video/*" onChange={(e) => handleVideoChange(e, idx)} className="hidden" />
                  {item.video ? (
                    <div className="relative w-full h-full">
                      <video src={item.video} controls className="h-24 w-full object-cover rounded-md" />
                      {item.uploadProgress > 0 && item.uploadProgress < 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center text-white font-bold">
                          {item.uploadProgress}%
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-2xl font-bold">+</div>
                  )}
                </label>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={item.product}
                  onChange={(e) => handleFieldChange(idx, "product", e.target.value)}
                  className={`block w-full px-2 py-1 border rounded-md shadow-sm text-sm ${
                    item.productError ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a product</option>
                  {productsList.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={item.status}
                  onChange={(e) => handleFieldChange(idx, "status", e.target.value)}
                  className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSave}
            disabled={isSubmitting || !canSave}
            className={`flex items-center justify-center px-6 py-3 rounded-md text-white bg-green-600 hover:bg-green-700 shadow-lg ${
              isSubmitting || !canSave ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReelsSection;
