import React, { useState, useEffect, useMemo } from "react";
import Slider from "react-slick";
import axios from "axios";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { PrevArrow, NextArrow } from "../../components/ui/Arrow";
import { transformCloudinaryUrl } from "../../utils/cloudinary";

const API_URL = import.meta.env.VITE_API_URL;

const Hero = () => {
  // 1️⃣ Hardcode a first slide so user sees something immediately
  const initialSlide = {
    productId: "default",
    productName: "Welcome to Our Store",
    image: "/Foodcat.png", // Make sure you have a placeholder image
  };

  const [slides, setSlides] = useState([initialSlide]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/hero`, {
          headers: { "Cache-Control": "no-cache" },
        });

        const data = response.data
          .map((hero) => ({
            productId: hero.product?._id,
            productName: hero.product?.name || "Hero Slide",
            image: transformCloudinaryUrl(hero.images?.[0]?.url, 1200),
          }))
          .filter((slide) => slide.image);

        if (data.length > 0) {
          setSlides([initialSlide, ...data]); // Keep initial slide first, then API slides
        }
      } catch (err) {
        console.error("Failed to fetch slides:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const settings = useMemo(
    () => ({
      dots: false,
      infinite: true,
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2200,
      arrows: true,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      lazyLoad: "ondemand",
    }),
    []
  );

  return (
    <section className="w-full">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className="outline-none w-full flex flex-col items-center"
          >
            <Link
              to={slide.productId === "default" ? "#" : `/productdetails/${slide.productId}`}
              className="w-full"
            >
              {/* Replace <img> with wrapper div */}
              <div className="w-full h-[200px] sm:h-[200px] md:h-[400px] lg:h-[410px] overflow-hidden rounded-lg">
                <img
                  src={slide.image}
                  alt={slide.productName}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Hero;
