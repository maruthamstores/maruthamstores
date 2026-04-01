import React from "react";
import { Link } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiList,
  FiShoppingCart,
  FiEdit,
  FiImage,
  FiVideo,
  FiUsers,
  FiStar,
  FiHeart,
  FiCode, // Icon for Procols (representing development)
  FiGlobe, // Icon for Marutham Stores (representing global reach)
} from "react-icons/fi";

const Sidebar = () => {
  return (
    <aside className="w-65 bg-gray-900 text-white flex flex-col h-screen  shadow-lg sticky right-0 top-0 ">
      {/* Header Section */}
      <div className="mb-3 px-4">
        {/* Admin Page: Marutham Stores */}
        <div className="flex items-center justify-start gap-2 mt-2">
          <FiGlobe className="text-white text-xl" />
          <h1 className="text-lg font-bold text-white">Marutham Stores</h1>
        </div>
        <p className="text-sm text-gray-400 mt-1 pl-7">Super Admin</p>
        <div className=" border-b-1 text-gray-500 w-57 mt-3  "></div>

      </div>
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {[
            { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
            { to: "/admin/products", icon: FiBox, label: "Products" },
            { to: "/admin/categories", icon: FiList, label: "Categories" },
            { to: "/admin/orders", icon: FiShoppingCart, label: "Orders" },
            { to: "/admin/manageorders", icon: FiEdit, label: "Manage Orders" },
            { to: "/admin/hero", icon: FiImage, label: "Hero" },
            // { to: "/admin/reels", icon: FiVideo, label: "Reels" },
            // { to: "/admin/customers", icon: FiUsers, label: "Customers" },
            { to: "/admin/reviews", icon: FiStar, label: "Reviews" },
            { to: "/admin/wishlistadmin", icon: FiHeart, label: "Wishlist" },
            { to: "/admin/offers", icon: FiList, label: "Offers" },
            { to: "/admin/contacts", icon: FiBox, label: "Contact Requst" },
          ].map((item, index) => (
            <li key={index}>
              <Link
                to={item.to}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-200 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 "
              >
                <item.icon className="text-lg" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className=" border-b-1 text-gray-500 w-65  "></div>
        <div className="flex pl-10 pt-3 text-xs  ">
          <span className="text-grey-600">Developed By Procols.</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;