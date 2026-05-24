import React, { useState, useEffect } from "react";
import axios from "axios";

const EditHeroSection = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [heroes, setHeroes] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHeroes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hero`, { withCredentials: true });
      setHeroes(
        res.data.map((h) => ({
          _id: h._id,
          imageUrl: h.images?.[0]?.url || null,
          public_id: h.images?.[0]?.public_id || null,
          product: h.product?._id || "",
          status: h.is_active ? "Active" : "Inactive",
          file: null,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHeroes();
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/products`, { withCredentials: true });
        setProductsList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddHero = () => {
    setHeroes((prev) => [
      { _id: null, imageUrl: null, public_id: null, product: "", status: "Active", file: null },
      ...prev,
    ]);
  };

  const handleHeroChange = (index, field, value) => {
    setHeroes((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const handleHeroImageChange = (index, file) => {
    setHeroes((prev) => {
      const copy = [...prev];
      copy[index].file = file;
      copy[index].imageUrl = URL.createObjectURL(file);
      return copy;
    });
  };

  const handleSaveHero = async (index) => {
    const hero = heroes[index];
    if (!hero.imageUrl && !hero.file) return alert("Please upload an image.");
    if (!hero.product) return alert("Please select a product.");

    setIsSubmitting(true);
    const formData = new FormData();
    if (hero.file) formData.append("image", hero.file);
    formData.append("product", hero.product);
    formData.append("status", hero.status);
    if (hero.public_id) formData.append("public_ids", hero.public_id);

    try {
      if (hero._id) {
        await axios.put(`${API_URL}/api/hero/${hero._id}`, formData, {
          withCredentials: true,
        });
      } else {
        await axios.post(`${API_URL}/api/hero`, formData, {
          withCredentials: true,
        });
      }
      alert("Hero saved successfully!");
      await fetchHeroes();
    } catch (err) {
      console.error(err);
      alert("Failed to save hero");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHero = async (index) => {
    const hero = heroes[index];
    if (!hero._id) {
      setHeroes((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    if (window.confirm("Delete this hero?")) {
      try {
        await axios.delete(`${API_URL}/api/hero/${hero._id}`, { withCredentials: true });
        alert("Hero deleted successfully!");
        await fetchHeroes();
      } catch (err) {
        console.error(err);
        alert("Failed to delete hero");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-['Inter']">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Edit Hero Section</h1>
          <button
            onClick={handleAddHero}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Hero
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {heroes.map((hero, index) => (
            <div key={index} className="p-4 bg-white border rounded-md relative shadow">
              {/* Delete button */}
              <button
                onClick={() => handleDeleteHero(index)}
                className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                X
              </button>

              {/* Image */}
              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer hover:bg-gray-50 mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHeroImageChange(index, e.target.files[0])}
                  className="hidden"
                />
                {hero.imageUrl ? (
                  <img
                    src={hero.imageUrl}
                    alt="hero"
                    className="h-40 w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="text-gray-400 text-3xl font-bold">+</div>
                )}
              </label>

              {/* Product */}
              <select
                value={hero.product}
                onChange={(e) => handleHeroChange(index, "product", e.target.value)}
                className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm mb-2"
              >
                <option value="">Select product</option>
                {productsList.map((prod) => (
                  <option key={prod._id} value={prod._id}>
                    {prod.name}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={hero.status}
                onChange={(e) => handleHeroChange(index, "status", e.target.value)}
                className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm mb-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Save */}
            {/* Save button only for new heroes */}
{!hero._id && (
  <button
    onClick={() => handleSaveHero(index)}
    disabled={isSubmitting}
    className={`w-full px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 ${
      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
    }`}
  >
    {isSubmitting ? "Saving..." : "Save"}
  </button>
)}

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditHeroSection;
