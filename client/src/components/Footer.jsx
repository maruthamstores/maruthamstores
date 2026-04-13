import React from "react";
import {
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-green-950 text-gray-300 pt-4 md:pt-6">
      {/* Top Grid */}
      <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-4 mid:gap-6 gap-2 md:gap-10">

        {/* Brand Info */}
        <div>
          <div className="flex items-center gap-2   md:mb-3">
            <img
              src="/loginlogo.jpeg"
              alt="Marutham Stores Logo"
              className="w-18 h-auto md:w-36 "
            />
            <h2 className="font-bold text-lg md:text-xl text-white"></h2>
          </div>
          <p className="text-xs md:text-sm leading-5 md:leading-6">
            Your one-stop destination for premium  Food items, skincare, and wellness
            products.
          </p>

          {/* Social */}
          <div className="flex gap-3 mt-1 md:mt-4">
            <a href="https://www.instagram.com/_maruthamstores_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-600">
              <FaInstagram />
            </a>
            <a href="https://wa.me/9750530288?text=Hello%20I%20want%20to%20know%20more
" className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-600">
              <FaWhatsapp />
            </a>
          </div> 
        </div>

        {/* Quick Links */}
        <div className="md:pb-3">
          <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Quick Links</h3>
          <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
            <li>
              <Link to="/" className="hover:underline">Home</Link>
            </li>
            <li>
              <Link to="/category" className="hover:underline">Categories</Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">About Us</Link>
            </li>
            <li>
              <Link to="/logout" className="hover:underline">Logout</Link>
            </li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-3">Customer Service</h3>
          <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
            <li><a href="#">Wishlist</a></li>
            <li><a href="mailto:Maruthamstoresinternational@gmail.com" className="text-white font-medium">Order Tracking</a></li>
               <li className="mt-1 flex items-center gap-2 text-xs md:text-sm">
              <FaEnvelope className="text-[#d19a74]" /> Maruthamstoresindia@gmail.com
            </li>
            <li className="mt-1 flex items-center gap-2 text-xs md:text-sm">
              <FaEnvelope className="text-[#d19a74]" /> Maruthamstoresinternational@gmail.com
            </li>
         
            <li className="mt-1 flex items-center gap-2 text-xs md:text-sm">
              <FaPhoneAlt className="text-[#d19a74]" /> 9150015901
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Marutham Stores</h3>
          <p className="text-xs md:text-sm leading-5 md:leading-6">
            1/4, East street, 
palamedu ,
vadipatti taluk, 
madurai -625 503

          </p>
          <p className="mt-1 md:mt-2 text-xs md:text-sm pb-1 md:pb-2">
            Founder: Mr Karthick Arumugam
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black py-2 md:py-3 text-center text-xs md:text-sm text-gray-400">
        <p>© 2026 Marutham Stores. All rights reserved.</p>
        <p>Made By Procols.</p>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
