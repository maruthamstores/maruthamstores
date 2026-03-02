import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import axios from "axios";
import { transformCloudinaryUrl } from "../../utils/cloudinary";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories`); // your API endpoint
        // Map response to match your existing data structure
        const mapped = response.data.map((cat) => ({
          id: cat._id,
          title: cat.name,       // assuming API has 'name'
          cat: cat.name,         // same for query param
          image: transformCloudinaryUrl(cat.image?.url, 320), // 320px for high quality on retina
        }));
        setCategories(mapped);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, [API_URL]);

  return (
    <div className="px-4 md:px-8 lg:px-16 py-12 bg-white">
      <div className="text-center mb-10">
        <h1 className="text-[#2e5939] text-3xl md:text-4xl font-[times] font-bold leading-[1.08] mb-3 capitalize">
          All Categories
        </h1>
        <p className="text-gray-600 mt-2">
          Explore all our product categories and find what suits your needs.
        </p>
      </div>

      {isMobile ? (
        <div className="grid grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/product?category=${category.cat}`}
              className="group cursor-pointer block text-center pt-1"
            >
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border shadow-md transition-transform duration-300 group-hover:scale-105">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-800 mt-3 transition-colors duration-300 group-hover:text-green-600">
                {category.title}
              </h3>
            </Link>
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Autoplay]}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 5 },
          }}
          navigation
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <Link
                to={`/product?category=${category.cat}`}
                className="group cursor-pointer block text-center pt-1"
              >
                <div className="w-20 h-20 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border shadow-md transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-md font-medium text-gray-800 mt-4 transition-colors duration-300 group-hover:text-green-600">
                  {category.title}
                </h3>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default Categories;
