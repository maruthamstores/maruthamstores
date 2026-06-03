import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const Offers = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [offerLine, setOfferLine] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroImage, setHeroImage] = useState(null); // Store the File object
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch products, categories, and offers from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes, offersRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`, { withCredentials: true }),
          axios.get(`${API_URL}/api/categories`, { withCredentials: true }),
          axios.get(`${API_URL}/api/offers`, { withCredentials: true }),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setOffers(offersRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  // Handle image selection (store the file)
  const handleImageChange = (e) => {
    const image = e.target.files[0];
    if (image) {
      setHeroImage(image); // Store the File object
      Toastify({
        text: "Image selected successfully!",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #22c55e, #16a34a)",
      }).showToast();
    }
  };

  // Filter products based on search, category, and stock
  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(
      (p) => selectedCategory === "all" || p.category.name === selectedCategory
    )
    .filter(
      (p) =>
        stockFilter === "all" ||
        (stockFilter === "inStock" ? p.stock > 0 : p.stock === 0)
    );

  // Toggle select all products
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p._id));
    }
  };

  // Toggle individual product selection
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle offer creation
  const handleAddOffer = async () => {
    if (!offerLine.trim()) {
      Toastify({
        text: "Offer line is required",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #ef4444, #dc2626)",
      }).showToast();
      return;
    }
    if (!selectedIds.length) {
      Toastify({
        text: "At least one product must be selected",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #ef4444, #dc2626)",
      }).showToast();
      return;
    }
    if (!heroImage) {
      Toastify({
        text: "Please upload an image for the offer",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #ef4444, #dc2626)",
      }).showToast();
      return;
    }

    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append("offerLine", offerLine);
      formData.append("products", JSON.stringify(selectedIds)); // Stringify the products array
      formData.append("image", heroImage); // Append the File object

      const response = await axios.post(`${API_URL}/api/offers`, formData, {
        withCredentials: true,
      });

      setOffers([response.data, ...offers]); // Prepend new offer to show it first
      setOfferLine("");
      setSelectedIds([]);
      setHeroImage(null); // Reset image after submission
      Toastify({
        text: "Offer created successfully!",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #22c55e, #16a34a)",
      }).showToast();
    } catch (err) {
      console.error(err);
      Toastify({
        text: err.response?.data?.message || "Failed to create offer",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #ef4444, #dc2626)",
      }).showToast();
    } finally {
      setImageUploading(false);
    }
  };

  // Handle offer deletion
  const handleDeleteOffer = async (offerId) => {
    try {
      await axios.delete(`${API_URL}/api/offers/${offerId}`, {
        withCredentials: true,
      });
      setOffers(offers.filter((offer) => offer._id !== offerId));
      Toastify({
        text: "Offer deleted successfully!",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #22c55e, #16a34a)",
      }).showToast();
    } catch (err) {
      console.error(err);
      Toastify({
        text: err.response?.data?.message || "Failed to delete offer",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #ef4444, #dc2626)",
      }).showToast();
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-['Inter'] text-lg">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Create Offer</h1>
        </div>

        {/* Filters and Offer Input */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Stock</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
          </select>
        </div>

        {/* Hero Image Upload + Select All + Add Offer */}
        <div className="flex flex-col gap-4 mb-4">
          <div className="relative flex-grow">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange} // Updated to handleImageChange
              disabled={imageUploading}
              className="flex w-1/2 py-3 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
            />
            {imageUploading && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Uploading...
              </span>
            )}
            {heroImage && (
              <img
                src={URL.createObjectURL(heroImage)} // Preview the selected file
                alt="Hero Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md border border-gray-200"
              />
            )}
          </div>
          <div className="relative flex w-1/2">
            <input
              type="text"
              placeholder=" Enter offer description..."
              value={offerLine}
              onChange={(e) => setOfferLine(e.target.value)}
              className="block w-full pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <div className="flex items-center justify-between text-base">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={
                  selectedIds.length === filteredProducts.length &&
                  filteredProducts.length > 0
                }
                onChange={toggleSelectAll}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 font-medium text-gray-700">Select All</span>
            </div>
            <button
              onClick={handleAddOffer}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                offerLine.trim() && selectedIds.length && heroImage
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!offerLine.trim() || !selectedIds.length || !heroImage || imageUploading}
            >
              <i className="fas fa-plus"></i> Add Offer
            </button>
          </div>
        </div>

        {/* Product Table */}
        <div className="border border-gray-200 rounded-md overflow-hidden text-base">
          {filteredProducts.length > 0 ? (
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Select</th>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="p-3">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="text-blue-600 font-medium hover:text-blue-800"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-3">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center">
              <i className="fas fa-box-open text-gray-300 text-5xl mb-2"></i>
              <p className="text-gray-500 text-lg">{error || "No products found"}</p>
            </div>
          )}
        </div>

        {/* Offer List (only shown if offers exist) */}
        {offers.length > 0 && (
          <div className="mt-8 p-4 bg-white shadow rounded">
            <h2 className="text-xl font-semibold mb-4">Existing Offers</h2>
            <ul className="divide-y divide-gray-200">
              {offers.map((offer) => (
                <li key={offer._id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{offer.offerLine}</p>
                    <p className="text-sm text-gray-500">
                      Products:{" "}
                      {offer.products
                        .map((product) => product.name || "Unknown")
                        .join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(offer.createdAt).toLocaleString()}
                    </p>
                    {offer.image && (
                      <img
                        src={offer.image.url}
                        alt="Offer Image"
                        className="mt-2 w-24 h-24 object-cover rounded-md border border-gray-200"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteOffer(offer._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    <i className="fas fa-trash mr-2"></i> Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;