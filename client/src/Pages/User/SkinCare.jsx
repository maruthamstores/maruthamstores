import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import axios from "axios";
import Toastify from "toastify-js";
import "swiper/css";
import "swiper/css/navigation";
import "toastify-js/src/toastify.css";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

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
// Skeleton loader component
const ProductCardSkeleton = () => (
  <div className="w-full bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex flex-col h-[420px] sm:h-[360px] max-sm:h-[280px] animate-pulse">
    <div className="skeleton-image h-[200px] sm:h-[140px] max-sm:h-[100px] w-full bg-white border-b border-gray-100"></div>
    <div className="p-[15px_18px] sm:p-3 max-sm:p-[10px_12px] flex flex-col flex-grow h-[220px] sm:h-[220px] max-sm:h-[180px]">
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
const SkinCare = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [toggling, setToggling] = useState({ wishlist: {}, cart: {} });

  const showLoginPromptToast = useCallback((type = "wishlist") => {
    const toastNode = document.createElement("div");
    toastNode.className = "flex flex-col gap-2 text-sm";

    const message = document.createElement("span");
    message.textContent = `You're not logged in. Can't manage ${type}. Login now?`;

    const actions = document.createElement("div");
    actions.className = "flex justify-center gap-2";

    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.className = "rounded bg-white px-3 py-1 font-semibold text-red-600";

    const noButton = document.createElement("button");
    noButton.textContent = "No";
    noButton.className = "rounded border border-white px-3 py-1 font-semibold text-white";

    actions.appendChild(yesButton);
    actions.appendChild(noButton);
    toastNode.appendChild(message);
    toastNode.appendChild(actions);

    const toast = Toastify({
      node: toastNode,
      duration: -1,
      gravity: "bottom",
      position: "center",
      backgroundColor: "#dc2626",
      close: false,
    });

    yesButton.onclick = () => {
      toast.hideToast();
      navigate("/login");
    };

    noButton.onclick = () => {
      toast.hideToast();
    };

    toast.showToast();
  }, [navigate]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products, wishlist, and cart concurrently
        const [productsRes, wishlistRes, cartRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/products`, { signal: controller.signal }),
          axios.get(`${API_URL}/api/wishlist`, {
            withCredentials: true,
            signal: controller.signal,
          }),
          axios.get(`${API_URL}/api/cart`, {
            withCredentials: true,
            signal: controller.signal,
          }),
        ]);

        // Handle products
        if (productsRes.status === "fulfilled") {
          const fetchedProducts = productsRes.value.data;
          console.log("API Products Response:", fetchedProducts);
          const faceCareProducts = Array.isArray(fetchedProducts)
            ? fetchedProducts.filter((p) => p.category?.name === "Face Care")
            : [];
          console.log("Filtered Face Care Products:", faceCareProducts);
          setProducts(faceCareProducts);
          // Optional: Cache products (commented out to avoid caching issues)
          // localStorage.setItem("faceCareProducts", JSON.stringify(faceCareProducts));
          // localStorage.setItem("faceCareProductsTime", Date.now().toString());
        } else {
          console.error("Products fetch failed:", productsRes.reason);
        }

        // Handle wishlist
        if (wishlistRes.status === "fulfilled") {
          const wishlistData = wishlistRes.value.data;
          console.log("Wishlist Response:", wishlistData);
          setWishlist(
            Array.isArray(wishlistData)
              ? wishlistData.map((item) => item.product?._id).filter(Boolean)
              : []
          );
        } else {
          console.log("Wishlist fetch skipped (user not logged in)");
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
        console.error("Fetch error:", err.response?.data, err.message);
      } finally {
        setLoading(false);
      }
    };

    // Clear cache to ensure fresh data
    localStorage.removeItem("faceCareProducts");
    localStorage.removeItem("faceCareProductsTime");
    fetchData();

    return () => controller.abort();
  }, []);

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
            duration: 2000,
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
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#16a34a",
            className: "toastify-mobile",
          }).showToast();
        }
      } catch (err) {
        console.error("Wishlist error:", err);
        setWishlist(wishlist); // Revert optimistic update
        if (err.response?.status === 401) {
          showLoginPromptToast("wishlist");
        } else {
          Toastify({
            text: "Failed to manage wishlist",
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
            className: "toastify-mobile",
          }).showToast();
        }
      } finally {
        setToggling((prev) => ({
          ...prev,
          wishlist: { ...prev.wishlist, [productId]: false },
        }));
      }
    }, 300),
    [wishlist, showLoginPromptToast]
  );

  const toggleCart = useCallback(
    debounce(async (productId) => {
      setToggling((prev) => ({
        ...prev,
        cart: { ...prev.cart, [productId]: true },
      }));
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
        setToggling((prev) => ({
          ...prev,
          cart: { ...prev.cart, [productId]: false },
        }));
        return;
      }

      const optimistic = cart.includes(productId)
        ? cart.filter((id) => id !== productId)
        : [...cart, productId];
      setCart(optimistic);

      try {
        if (cart.includes(productId)) {
          await axios.delete(`${API_URL}/api/cart/${productId}`, {
            withCredentials: true,
          });
          Toastify({
            text: "Removed from Cart",
            duration: 2000,
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
          Toastify({
            text: "Added to Cart",
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#16a34a",
            className: "toastify-mobile",
          }).showToast();
        }
      } catch (err) {
        console.error("Cart error:", err);
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
        setToggling((prev) => ({
          ...prev,
          cart: { ...prev.cart, [productId]: false },
        }));
      }
    }, 300),
    [cart, products]
  );

  const memoizedProducts = useMemo(() => products, [products]);

  if (loading) {
    return (
      <div className="px-4 py-10">
        <h1 className="text-center text-2xl font-bold mb-8 text-green-900 font-[times]">
          Recommended Face Care Solutions
        </h1>
        <Swiper
          modules={[Navigation]}
          spaceBetween={8}
          slidesPerView={2}
          loop={true}
          grabCursor={true}
          breakpoints={{
            1280: { slidesPerView: 5, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
            640: { slidesPerView: 5, spaceBetween: 20 },
            320: { slidesPerView: 2, spaceBetween: 10 },
          }}
          className="swiper-container"
        >
          {[...Array(2)].map((_, index) => (
            <SwiperSlide key={index} className="flex items-center justify-center">
              <ProductCardSkeleton />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  if (!memoizedProducts.length) {
    console.log("No products to display, products array:", memoizedProducts);
    return (
      <div className="text-center py-10 text-gray-500 text-lg sm:text-xl">
        No Face Care Products Available
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <h2 className="text-center text-2xl font-bold mb-8 text-green-900 font-[times]">
        Recommended Face Care Solutions
      </h2>
      <Swiper
        modules={[Navigation]}
        spaceBetween={8}
        slidesPerView={2}
        loop={true}
        grabCursor={true}
        breakpoints={{
          1280: { slidesPerView: 5, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          640: { slidesPerView: 5, spaceBetween: 20 },
          320: { slidesPerView: 2, spaceBetween: 10 },
        }}
        className="swiper-container"
      >
        {memoizedProducts.map((product) => (
          <SwiperSlide key={product._id} className="flex items-center justify-center">
            <ProductCard
              product={product}
              isWished={wishlist.includes(product._id)}
              inCart={cart.includes(product._id)}
              isWishlistToggling={toggling.wishlist[product._id] || false}
              isCartToggling={toggling.cart[product._id] || false}
              toggleWishlist={toggleWishlist}
              toggleCart={toggleCart}
              className="min-w-[150px]"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SkinCare;
