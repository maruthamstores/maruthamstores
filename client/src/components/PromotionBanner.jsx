import React from 'react';
import { Link } from 'react-router-dom';

const PromotionBanner = ({ image, link = "/product", alt = "Promotion Banner" }) => {
  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 py-4 md:py-12">
      <Link to={link} className="block group">
        <div className="relative w-full aspect-[4/1] overflow-hidden  shadow-lg border border-gray-100">
          <img
            src={image}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-700"
            loading="lazy"
          />
          {/* Subtle overlay for better contrast if needed, though Pothys often bakes text into images */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
        </div>
      </Link>
    </div>
  );
};

export default PromotionBanner;
