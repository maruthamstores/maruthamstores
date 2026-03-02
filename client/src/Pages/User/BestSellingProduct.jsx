
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Simple debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Skeleton loader component
const ProductCardSkeleton = () => (
  <div className="w-full bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col animate-pulse">
    <div className="skeleton-image aspect-square w-full bg-gray-200"></div>
    <div className="p-[15px_18px] sm:p-3 max-sm:p-[10px_12px] flex flex-col flex-grow">
      <div className="skeleton-text h-4 bg-gray-200 rounded mb-2 w-3/5"></div>
      <div className="skeleton-text h-4 bg-gray-200 rounded mb-2"></div>
      <div className="skeleton-description h-12 sm:h-8 max-sm:h-4 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between items-center sm:flex-col sm:items-start max-sm:flex-col max-sm:items-start sm:gap-2 max-sm:gap-1.5 mt-auto">
        <div className="skeleton-price h-4 bg-gray-200 rounded w-2/5"></div>
        <div className="skeleton-button h-[34px] sm:h-[34px] max-sm:h-[30px] w-[100px] sm:w-full max-sm:w-full bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

import { transformCloudinaryUrl } from "../../utils/cloudinary";

// Custom ProductCard component with Tailwind styles from BestSellingProduct.css
const ProductCard = React.memo(({ product, inCart, isCartToggling, handleAddToCart }) => (
  <div
    className={`w-full bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col transition-transform duration-300 ${isCartToggling ? "opacity-50" : ""
      }`}
  >
    <Link to={`/productdetails/${product._id}`}>
      <div
        className="aspect-square bg-white flex items-center justify-center overflow-hidden"
      >
        <img
          src={transformCloudinaryUrl(product.images?.[0]?.url, 260) || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-contain p-2"
          loading="lazy"
          onError={(e) => (e.target.src = "/placeholder.png")}
        />
      </div>
    </Link>

    <div className="product-details p-[15px_18px] sm:p-3 max-sm:p-[10px_12px] flex flex-col flex-grow">
      <span className="text-xs sm:text-sm text-gray-500 uppercase font-bold">
        {product.category?.name || "Uncategorized"}
      </span>
      <h2 className="product-name font-serif text-lg sm:text-base max-sm:text-sm mb-2 whitespace-nowrap overflow-hidden text-ellipsis ">
        {product.name}
      </h2>

      {product.offer_line && (
        <span className="offer-badge text-green-600 font-semibold text-sm sm:text-[0.9rem] max-sm:text-[0.85rem] mb-2 block">
          {product.offer_line} Launch Offer
        </span>
      )}
      <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2 overflow-hidden line-clamp-2">
        {product.description}
      </p>
      <div className="product-footer flex justify-between items-center sm:flex-col sm:items-start max-sm:flex-col max-sm:items-start sm:gap-2 max-sm:gap-1.5 ">
        <div className="price-box flex items-center gap-1.5">
          <span className="old-price text-base sm:text-[0.9rem] max-sm:text-[0.85rem] text-gray-500 line-through">
            ₹{product.old_price}
          </span>
          <span className="current-price text-lg sm:text-base max-sm:text-[0.95rem] font-bold text-green-700">
            ₹{product.new_price}
          </span>
        </div>
        <button
          className={`add-to-cart bg-green-700 text-white border-none px-4 py-2 sm:px-2 sm:py-2 max-sm:px-1.5 max-sm:py-1.5 rounded-full text-sm sm:text-[0.9rem] max-sm:text-[0.85rem] cursor-pointer transition-colors duration-300 sm:w-full max-sm:w-full ${inCart ? "bg-gray-400" : "hover:bg-green-600"
            }`}
          onClick={() => handleAddToCart(product._id)}
          disabled={isCartToggling}
        >
          {inCart ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  </div>
));

const BestSellingProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartToggling, setCartToggling] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories, products, and cart concurrently
        const [catRes, prodRes, cartRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/categories`, { signal: controller.signal }),
          axios.get(`${API_URL}/api/products`, { signal: controller.signal }),
          axios.get(`${API_URL}/api/cart`, {
            withCredentials: true,
            signal: controller.signal,
          }),
        ]);

        // Handle categories
        if (catRes.status === "fulfilled") {
          const allCategories = catRes.value.data.map((c) => ({ _id: c._id, name: c.name }));
          setCategories([{ _id: "all", name: "All Products" }, ...allCategories]);
        } else {
          console.error("Categories fetch failed:", catRes.reason);
        }

        // Handle products
        if (prodRes.status === "fulfilled") {
          const fetchedProducts = prodRes.value.data;
          console.log("API Products Response:", fetchedProducts);
          const bestSellingProducts = Array.isArray(fetchedProducts)
            ? fetchedProducts.filter((p) => p.is_bestsell === true)
            : [];
          console.log("Filtered Best Selling Products:", bestSellingProducts);
          setProducts(bestSellingProducts);
        } else {
          console.error("Products fetch failed:", prodRes.reason);
        }

        // Handle cart
        if (cartRes.status === "fulfilled") {
          const cartData = cartRes.value.data;
          console.log("Cart Response:", cartData);
          setCart(
            Array.isArray(cartData.items)
              ? cartData.items.map((item) => item.product?._id).filter(Boolean)
              : []
          );
        } else {
          console.log("Cart fetch skipped (user not logged in)");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching data:", err.response?.data, err.message);
      } finally {
        setLoading(false);
      }
    };

    // Clear cache to ensure fresh data
    localStorage.removeItem("bestSellingProducts");
    localStorage.removeItem("bestSellingProductsTime");
    fetchData();

    return () => controller.abort();
  }, []);

  // Debounced handleAddToCart
  const handleAddToCart = useCallback(
    debounce(async (productId) => {
      setCartToggling((prev) => ({ ...prev, [productId]: true }));
      const product = products.find((p) => p._id === productId);
      if (product?.stock === 0) {
        Toastify({
          text: "Product is out of stock",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
        setCartToggling((prev) => ({ ...prev, [productId]: false }));
        return;
      }

      if (cart.includes(productId)) {
        Toastify({
          text: "Product already in cart",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#f59e0b",
          className: "toastify-mobile",
        }).showToast();
        setCartToggling((prev) => ({ ...prev, [productId]: false }));
        return;
      }

      const optimistic = [...cart, productId];
      setCart(optimistic);

      try {
        await axios.post(
          `${API_URL}/api/cart`,
          { productId, quantity: 1 },
          { withCredentials: true }
        );
        Toastify({
          text: "Added to Cart",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#16a34a",
          className: "toastify-mobile",
        }).showToast();
      } catch (err) {
        console.error("Error adding to cart:", err);
        setCart(cart); // Revert optimistic update
        Toastify({
          text: "Please login to manage cart",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
      } finally {
        setCartToggling((prev) => ({ ...prev, [productId]: false }));
      }
    }, 300),
    [cart, products]
  );

  // Memoize filtered products
  const filteredProducts = useMemo(
    () =>
      selectedCategory === "all"
        ? products
        : products.filter(
          (p) => p.category && p.category._id === selectedCategory && p.is_bestsell
        ),
    [products, selectedCategory]
  );

  return (
    <main className="max-w-7xl mx-auto px-0 sm:p-5 py-10">
      <div className="text-center mb-5 text-gray-800">
        <h1 className="text-2xl sm:text-[calc(2rem+1vw)] font-bold mb-3 font-[Times]">
          Best Selling Products
        </h1>
        <p className="text-sm sm:text-base opacity-90 max-w-xl mx-auto">
          Transform your self-care routine with our carefully curated selection of skin, hair, and wellness products.
        </p>
      </div>

      <div className="flex flex-wrap justify-start sm:justify-center gap-2 sm:gap-3 mb-5 sm:mb-[30px] px-3 sm:px-0">
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-3 sm:px-[18px] py-1.5 sm:py-2 rounded-full text-[0.85rem] sm:text-[0.95rem] font-medium border transition-all duration-300 ${selectedCategory === cat._id
              ? "bg-green-500 border-green-500 text-white"
              : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-green-500 hover:border-green-500 hover:text-white"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-5 px-3 sm:px-0 mb-10">
        {loading ? (
          [...Array(2)].map((_, index) => (
            <div key={index} className="w-full max-w-[260px] mx-auto">
              <ProductCardSkeleton />
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="w-full max-w-[260px] mx-auto">
              <ProductCard
                product={product}
                inCart={cart.includes(product._id)}
                isCartToggling={cartToggling[product._id] || false}
                handleAddToCart={handleAddToCart}
              />
            </div>
          ))
        ) : (
          <p className="col-span-2 sm:col-span-2 md:col-span-4 text-center text-gray-500 text-base sm:text-lg">
            No Products Available
          </p>
        )}
      </div>
    </main>
  );
};

export default BestSellingProduct;
