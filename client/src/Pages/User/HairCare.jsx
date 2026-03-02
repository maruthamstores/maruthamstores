import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import axios from "axios";
import Toastify from "toastify-js";
import "swiper/css";
import "swiper/css/navigation";
import "toastify-js/src/toastify.css";
import ProductCard from "./ProductCard";

const API_URL = import.meta.env.VITE_API_URL;

// Debounce (unchanged)
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Skeleton Loader (unchanged)
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

const HairCare = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [toggling, setToggling] = useState({ wishlist: {}, cart: {} });

  // NEW: Client + Mobile detection (SSR-safe)
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef(null);

  // Detect client & mobile → forces Swiper remount via `key`
  useEffect(() => {
    setIsClient(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    const debounced = debounce(check, 100);
    window.addEventListener("resize", debounced);
    return () => window.removeEventListener("resize", debounced);
  }, []);

  // Fetch data (unchanged)
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

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

        if (productsRes.status === "fulfilled") {
          const fetchedProducts = productsRes.value.data;
          const hairCareProducts = Array.isArray(fetchedProducts)
            ? fetchedProducts.filter((p) => p.category?.name?.toLowerCase() === "skin and hair")
            : [];
          setProducts(hairCareProducts);
        }

        if (wishlistRes.status === "fulfilled") {
          setWishlist(
            Array.isArray(wishlistRes.value.data)
              ? wishlistRes.value.data
                .map((item) => item.product?._id)
                .filter(Boolean)
              : []
          );
        }

        if (cartRes.status === "fulfilled") {
          const cartData = cartRes.value.data;
          setCart(
            Array.isArray(cartData.items)
              ? cartData.items.map((item) => item.product?._id).filter(Boolean)
              : []
          );
        }
      } catch (err) {
        if (err.name !== "AbortError")
          console.error("Fetch Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // Wishlist toggle (unchanged)
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
            position: "center",
            gravity: "bottom",
            backgroundColor: "#dc2626",
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
            position: "center",
            gravity: "bottom",
            backgroundColor: "#16a34a",
          }).showToast();
        }
      } catch {
        setWishlist(wishlist);
        Toastify({
          text: "Please login to manage wishlist",
          duration: 2000,
          position: "center",
          gravity: "bottom",
          backgroundColor: "#dc2626",
        }).showToast();
      } finally {
        setToggling((prev) => ({
          ...prev,
          wishlist: { ...prev.wishlist, [productId]: false },
        }));
      }
    }, 300),
    [wishlist]
  );

  // Cart toggle (unchanged)
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
          position: "center",
          gravity: "bottom",
          backgroundColor: "#dc2626",
        }).showToast();
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
            position: "center",
            gravity: "bottom",
            backgroundColor: "#dc2626",
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
            position: "center",
            gravity: "bottom",
            backgroundColor: "#16a34a",
          }).showToast();
        }
      } catch {
        setCart(cart);
        Toastify({
          text: "Please login to manage cart",
          duration: 2000,
          position: "center",
          gravity: "bottom",
          backgroundColor: "#dc2626",
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

  // Loading UI (unchanged)
  if (loading) {
    return (
      <div className="px-4 py-10">
        <h1 className="text-center text-2xl font-bold mb-8 text-green-900">
          Recommended Skin and Hair Solutions
        </h1>
        <Swiper
          modules={[Navigation]}
          spaceBetween={8}
          slidesPerView={2}
          loop={true}
          grabCursor={true}
        >
          {[...Array(2)].map((_, i) => (
            <SwiperSlide key={i}>
              <ProductCardSkeleton />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  if (!memoizedProducts.length) {
    return (
      <div className="text-center py-10 text-gray-500 text-lg">
        No Skin and Hair Products Available
      </div>
    );
  }

  // MAIN RENDER (only autoplay fixed)
  return (
    <div className="px-4 py-10">
      <h2 className="text-center text-2xl font-bold mb-8 text-green-900">
        Recommended Skin and Hair Solutions
      </h2>

      {/* KEY FORCES FULL REMOUNT AFTER CLIENT DETECTION */}
      <Swiper
        key={isClient && isMobile ? "mobile" : "desktop"}
        modules={[Navigation, Autoplay]}
        spaceBetween={8}
        slidesPerView={2}
        loop={true}
        grabCursor={true}
        autoplay={
          isClient && isMobile
            ? { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: false }
            : false
        }
        breakpoints={{
          1280: { slidesPerView: 5, spaceBetween: 20, autoplay: false },
          1024: { slidesPerView: 5, spaceBetween: 20, autoplay: false },
          640: { slidesPerView: 5, spaceBetween: 20, autoplay: false },
          0: { slidesPerView: 2, spaceBetween: 10 },
        }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        className="swiper-container"
      >
        {memoizedProducts.map((product) => (
          <SwiperSlide
            key={product._id}
            className="flex items-center justify-center"
          >
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

export default HairCare;