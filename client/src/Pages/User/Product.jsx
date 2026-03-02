
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const API_URL = import.meta.env.VITE_API_URL;

// Simple debounce utility
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = React.memo(
  ({ product, isWished, inCart, isWishlistToggling, isCartToggling, toggleWishlist, toggleCart, handleBuyNow }) => {
    return (
      <div
        className="
          w-[calc(50%-4px)]
          sm:w-[calc(24%-1px)]
          px-1 
          bg-white rounded-lg shadow-md overflow-hidden relative
          transition-transform duration-300 hover:-translate-y-1 mt-2 mb-2
        "
      >
        {product.badge && (
          <div className="absolute top-2 left-0 bg-green-600 text-white px-2 sm:px-3 py-1 text-xs font-bold rounded-r">
            {product.badge}
          </div>
        )}

        <Link to={`/productdetails/${product._id}`}>
          <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
            <img
              src={product.images?.[0]?.url || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-contain p-2"
              loading="eager"
            />
          </div>
        </Link>

        <div className="p-2 sm:p-3 overflow-hidden">
          <span className="text-xs  text-gray-600 uppercase   truncate">
            {product.category?.name || "Unknown"}
          </span>
          <h4 className="my-1 sm:my-2 text-xs sm:text-sm truncate font-semibold">
            <Link
              to={`/productdetails/${product._id}`}
              className="text-gray-800 no-underline hover:text-green-600 transition-colors"
            >
              {product.name}
            </Link>
          </h4>
          {product.offer_line && (
            <div className="text-green-600 font-semibold text-xs sm:text-sm mb-1 sm:mb-2 truncate">
              {product.offer_line} % Launch Offer
            </div>
          )}
          <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="text-xs text-red-600 font-semibold mb-1 sm:mb-2">
            {product.stock === 0 ? "Out of Stock" : `In Stock: ${product.stock} units`}
          </div>

          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <div className="text-sm sm:text-base text-green-600 font-bold">
              {product.old_price && (
                <small className="text-xs text-gray-500 line-through mr-1">
                  ₹{product.old_price}
                </small>
              )}
              ₹{product.new_price}
            </div>
            <div className="flex items-center gap-2 sm:gap-2">
              <button
                onClick={() => toggleWishlist(product._id)}
                className={`bg-transparent border-none cursor-pointer relative transition-opacity duration-200 ${isWishlistToggling ? "opacity-70" : "opacity-100"
                  }`}
                disabled={isWishlistToggling}
              >
                {isWished ? (
                  <FaHeart className="text-green-800 text-xl sm:lg" />
                ) : (
                  <FaRegHeart className="text-gray-400 text-xl sm:lg hover:text-green-600 transition-colors" />
                )}
              </button>
              <button
                onClick={() => toggleCart(product._id)}
                className={`bg-transparent border-none cursor-pointer relative transition-opacity duration-200 ${isCartToggling || product.stock === 0 ? "opacity-70" : "opacity-100"
                  }`}
                disabled={isCartToggling || product.stock === 0}
              >
                <FaShoppingCart
                  className={`text-xl sm:lg ${inCart
                    ? "text-green-800"
                    : product.stock === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-400 hover:text-green-600 transition-colors"
                    }`}
                />
              </button>
            </div>
          </div>

          <button
            className="w-full py-1.5 sm:py-2 bg-green-600 text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-green-700 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={() => handleBuyNow(product._id)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      </div>
    );
  }
);

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selectedCategory = params.get("category") || "All";

  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({ wishlist: {}, cart: {} });

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/products`, {
          signal: controller.signal,
        });
        setProducts(res.data);

        try {
          const wishlistRes = await axios.get(`${API_URL}/api/wishlist`, {
            withCredentials: true,
            signal: controller.signal,
          });
          setWishlist(wishlistRes.data.map((item) => item.product._id));
        } catch {
          console.log("Wishlist fetch skipped");
        }

        try {
          const cartRes = await axios.get(`${API_URL}/api/cart`, {
            withCredentials: true,
            signal: controller.signal,
          });
          setCart(cartRes.data.items.map((item) => item.product._id));
        } catch {
          console.log("Cart fetch skipped");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategory === "All"
      ? products
      : products.filter((product) => product.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  const toggleWishlist = useCallback(
    debounce(async (productId) => {
      setToggling((prev) => ({
        ...prev,
        wishlist: { ...prev.wishlist, [productId]: true },
      }));
      const optimistic = wishlist.includes(productId)
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      setWishlist(optimistic);

      try {
        if (wishlist.includes(productId)) {
          await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
            withCredentials: true,
          });
          Toastify({
            text: "Removed from Wishlist",
            duration: 1200,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
            className: "toastify-mobile",
          }).showToast();
        } else {
          await axios.post(
            `${API_URL}/api/wishlist`,
            { productId },
            { withCredentials: true }
          );
          Toastify({
            text: "Added to Wishlist",
            duration: 1200,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#16a34a",
            className: "toastify-mobile",
          }).showToast();
        }
      } catch {
        setWishlist(wishlist);
        Toastify({
          text: "Please login to manage wishlist",
          duration: 1200,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
      } finally {
        setToggling((prev) => ({
          ...prev,
          wishlist: { ...prev.wishlist, [productId]: false },
        }));
      }
    }, 200),
    [wishlist]
  );

  const toggleCart = useCallback(
    debounce(async (productId) => {
      setToggling((prev) => ({
        ...prev,
        cart: { ...prev.cart, [productId]: true },
      }));
      const product = products.find((p) => p._id === productId);
      if (product.stock === 0) {
        Toastify({
          text: "Product is out of stock",
          duration: 1200,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
        setToggling((prev) => ({
          ...prev,
          cart: { ...prev.cart, [productId]: false },
        }));
        return;
      }

      try {
        if (cart.includes(productId)) {
          await axios.delete(`${API_URL}/api/cart/${productId}`, {
            withCredentials: true,
          });
          setCart((prev) => prev.filter((id) => id !== productId));
          Toastify({
            text: "Removed from Cart",
            duration: 1200,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
            className: "toastify-mobile",
          }).showToast();
        } else {
          await axios.post(
            `${API_URL}/api/cart`,
            { productId, quantity: 1 },
            { withCredentials: true }
          );
          setCart((prev) => [...prev, productId]);
          Toastify({
            text: "Added to Cart",
            duration: 1200,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#16a34a",
            className: "toastify-mobile",
          }).showToast();
        }
      } catch {
        setCart(cart);
        Toastify({
          text: "Please login to manage cart",
          duration: 1200,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
      } finally {
        setToggling((prev) => ({
          ...prev,
          cart: { ...prev.cart, [productId]: false },
        }));
      }
    }, 200),
    [cart, products]
  );

  const handleBuyNow = useCallback(
    async (productId) => {
      const product = products.find((p) => p._id === productId);
      if (product.stock === 0) {
        Toastify({
          text: "Product is out of stock",
          duration: 1200,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
        return;
      }

      try {
        const userRes = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
        const user = userRes.data;

        if (!user || !user._id) {
          Toastify({
            text: "Please login to buy products",
            duration: 1200,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
            className: "toastify-mobile",
          }).showToast();
          navigate("/login");
          return;
        }

        const addrFields = [user.name, user.mobile, user.address, user.city, user.state, user.pincode];
        const hasAddress = addrFields.every((f) => f && f.trim()) && /^[0-9]{10}$/.test(user.mobile);

        if (!hasAddress) {
          Toastify({
            text: !/^[0-9]{10}$/.test(user.mobile)
              ? "Please enter a valid 10-digit phone number"
              : "Please complete your address and phone number before placing the order",
            duration: 1500,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
            className: "toastify-mobile",
          }).showToast();
          navigate("/address", { state: { productId, quantity: 1 } });
          return;
        }

        navigate("/revieworder", {
          state: {
            productId,
            quantity: 1,
            address: {
              name: user.name,
              phone: user.mobile,
              address: user.address,
              city: user.city,
              state: user.state,
              pincode: user.pincode,
            },
          },
        });
      } catch {
        Toastify({
          text: "Please login to buy products",
          duration: 1200,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
          className: "toastify-mobile",
        }).showToast();
        navigate("/login");
      }
    },
    [products, navigate]
  );

  if (loading) return <div className="text-center py-10 text-gray-600 text-lg">Loading products...</div>;

  return (
    <div className="px-1 sm:px-4">
      <h2 className="text-center text-xl sm:text-2xl font-bold mb-8 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-green-600 after:mx-auto after:mt-2 after:rounded">
        {selectedCategory === "All" ? "All Products" : selectedCategory}
      </h2>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 text-base sm:text-lg">
          No products available in this category.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 sm:gap-2">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWished={wishlist.includes(product._id)}
              inCart={cart.includes(product._id)}
              isWishlistToggling={toggling.wishlist[product._id] || false}
              isCartToggling={toggling.cart[product._id] || false}
              toggleWishlist={toggleWishlist}
              toggleCart={toggleCart}
              handleBuyNow={handleBuyNow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Product;
