import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import Toastify from "toastify-js";
import "swiper/css";
import "swiper/css/navigation";
import "toastify-js/src/toastify.css";
import ProductCard from "../Pages/User/ProductCard";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

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

const CollectionSection = ({ title, subtext, categoryName, isBestseller = false }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          swiperInstance?.autoplay?.start();
        } else {
          swiperInstance?.autoplay?.stop();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [swiperInstance]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, wishlistRes, cartRes] = await Promise.allSettled([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/wishlist`, { withCredentials: true }),
          axios.get(`${API_URL}/api/cart`, { withCredentials: true }),
        ]);

        if (productsRes.status === "fulfilled") {
          let filtered = productsRes.value.data;
          if (categoryName) {
            filtered = filtered.filter(p => p.category?.name?.toLowerCase().includes(categoryName.toLowerCase()));
          }
          if (isBestseller) {
            filtered = filtered.filter(p => p.is_bestsell);
          }
          setProducts(filtered.slice(0, 10)); // Top 10
        }

        if (wishlistRes.status === "fulfilled") {
          setWishlist(Array.isArray(wishlistRes.value.data) ? wishlistRes.value.data.map(i => i.product?._id) : []);
        }

        if (cartRes.status === "fulfilled") {
          const cartData = cartRes.value.data;
          setCart(Array.isArray(cartData.items) ? cartData.items.map(item => item.product?._id) : []);
        }
      } catch (err) {
        console.error("Collection fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryName, isBestseller]);

  const toggleWishlist = useCallback(async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`, { withCredentials: true });
        setWishlist(prev => prev.filter(id => id !== productId));
        Toastify({ text: "Removed from Wishlist", backgroundColor: "#dc2626", gravity: "bottom", position: "center" }).showToast();
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { productId }, { withCredentials: true });
        setWishlist(prev => [...prev, productId]);
        Toastify({ text: "Added to Wishlist", backgroundColor: "#2e5939", gravity: "bottom", position: "center" }).showToast();
      }
    } catch (err) {
      Toastify({ text: "Please login to manage wishlist", backgroundColor: "#dc2626", gravity: "bottom", position: "center" }).showToast();
    }
  }, [wishlist]);

  const toggleCart = useCallback(async (productId) => {
    try {
      if (cart.includes(productId)) {
        await axios.delete(`${API_URL}/api/cart/${productId}`, { withCredentials: true });
        setCart(prev => prev.filter(id => id !== productId));
        Toastify({ text: "Removed from Cart", backgroundColor: "#dc2626", gravity: "bottom", position: "center" }).showToast();
      } else {
        await axios.post(`${API_URL}/api/cart`, { productId, quantity: 1 }, { withCredentials: true });
        setCart(prev => [...prev, productId]);
        Toastify({ text: "Added to Cart", backgroundColor: "#2e5939", gravity: "bottom", position: "center" }).showToast();
      }
    } catch (err) {
      Toastify({ text: "Please login to manage cart", backgroundColor: "#dc2626", gravity: "bottom", position: "center" }).showToast();
    }
  }, [cart]);

  if (loading) {
    return (
      <div ref={sectionRef} className="px-4 md:px-8 lg:px-16 py-10 md:py-16 border-b border-[#f0e4d4]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4">
          <div>
            <h2 className="text-[#2e5939] text-2xl sm:text-3xl md:text-5xl font-serif font-bold tracking-tight mb-2">
              {title}
            </h2>
            <p className="text-gray-500 font-serif italic text-lg max-w-xl">
              {subtext}
            </p>
          </div>
        </div>
        <div className="relative group px-0 md:px-4">
          <Swiper
            modules={[Navigation]}
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 25 },
              1024: { slidesPerView: 4, spaceBetween: 30 },
              1280: { slidesPerView: 5, spaceBetween: 30 },
            }}
            className="product-swiper"
          >
            {[...Array(5)].map((_, i) => (
              <SwiperSlide key={`skeleton-${i}`} className="pb-8 px-1">
                <ProductCardSkeleton />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div ref={sectionRef} className="px-4 md:px-8 lg:px-16 py-10 md:py-16 border-b border-[#f0e4d4]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-10 gap-4">
        <div>
          <h2 className="text-[#2e5939] text-2xl sm:text-3xl md:text-5xl font-serif font-bold tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-gray-500 font-serif italic text-lg max-w-xl">
            {subtext}
          </p>
        </div>
        <Link
          to={categoryName ? `/product?category=${categoryName}` : "/product"}
          className="w-fit self-end text-[#2e5939] font-serif font-bold border-b-2 border-[#d4af37] pb-1 hover:text-[#d4af37] transition-colors"
        >
          View All Collection
        </Link>
      </div>

      <div className="relative group px-0 md:px-4">
        {/* Custom Navigation Buttons */}
        <button className="custom-swiper-prev hidden md:!flex absolute left-[-20px] lg:left-[-40px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-black hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={24} />
        </button>
        <button className="custom-swiper-next hidden md:!flex absolute right-[-20px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg border border-gray-200 text-black hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={24} />
        </button>

        <Swiper
          key={products.length}
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => {
            swiper.autoplay.stop();
            setSwiperInstance(swiper);
          }}
          spaceBetween={12}
          slidesPerView={2}
          observer={true}
          observeParents={true}
          autoplay={{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          loop={true}
          navigation={{
            prevEl: ".custom-swiper-prev",
            nextEl: ".custom-swiper-next",
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 25 },
            1024: { slidesPerView: 4, spaceBetween: 30 },
            1280: { slidesPerView: 5, spaceBetween: 30 },
          }}
          className="product-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id} className="pb-8 px-1">
              <ProductCard
                product={product}
                isWished={wishlist.includes(product._id)}
                inCart={cart.includes(product._id)}
                toggleWishlist={toggleWishlist}
                toggleCart={toggleCart}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default React.memo(CollectionSection);
