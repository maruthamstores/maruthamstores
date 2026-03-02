import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { transformCloudinaryUrl } from "../../utils/cloudinary";

const ProductCard = React.memo(
  ({ product, isWished, inCart, toggleWishlist, toggleCart }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden relative transition-transform duration-300 hover:-translate-y-1">
        {product.is_bestsell && (
          <div className="absolute top-2 left-0 bg-green-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold rounded-r">
            Best Sell
          </div>
        )}

        <Link to={`/productdetails/${product._id}`}>
          <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
            <img
              src={transformCloudinaryUrl(product.images?.[0]?.url, 400) || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="p-3 sm:p-4">
          <span className="text-xs sm:text-sm text-gray-500 uppercase font-bold">
            {product.category?.name || "Skin And Hair"}
          </span>
          <h4 className="my-2 sm:my-3 text-sm sm:text-base">
            <Link
              to={`/productdetails/${product._id}`}
              className="text-gray-800 no-underline hover:text-green-600 transition-colors"
            >
              {product.name}
            </Link>
          </h4>
          {product.offer_line && (
            <div className="text-green-600 font-semibold text-xs sm:text-sm mb-2">
              {product.offer_line}% Launch Offer
            </div>
          )}
          <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2 overflow-hidden line-clamp-1">
            {product.description}
          </p>

          <div className="flex justify-between items-center">
            <div className="text-base sm:text-lg text-green-600 font-bold">
              {product.old_price && (
                <small className="text-xs sm:text-sm text-gray-500 line-through mr-1 sm:mr-2">
                  ₹{product.old_price}
                </small>
              )}
              ₹{product.new_price}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => toggleWishlist(product._id)}
                className="bg-transparent border-none cursor-pointer"
              >
                {isWished ? (
                  <FaHeart className="text-green-800 text-xl sm:text-lg" />
                ) : (
                  <FaRegHeart className="text-gray-400 text-xl sm:text-lg hover:text-green-800 transition" />
                )}
              </button>
              <button
                onClick={() => toggleCart(product._id)}
                className="bg-transparent border-none cursor-pointer"
              >
                <FaShoppingCart
                  className={`text-xl sm:text-lg ${inCart
                    ? "text-green-800"
                    : "text-gray-400 hover:text-green-800 transition"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default ProductCard;