import React, { useEffect, useState } from "react";
import axios from "axios";
import Toastify from "toastify-js";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import "toastify-js/src/toastify.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Thumbs } from "swiper/modules";
import { useParams, useNavigate } from "react-router-dom";
import { transformCloudinaryUrl } from "../../utils/cloudinary";

const API_URL = import.meta.env.VITE_API_URL;

const ProductDetail = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);

  // Fetch product & reviews
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/reviews`, {
          params: { productId: id },
          withCredentials: true,
        });
        setReviews(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  // Add to cart
  const handleAddToCart = async () => {
    if (product.stock === 0) {
      Toastify({
        text: "Product is out of stock",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart`,
        { productId: product._id, quantity: qty },
        { withCredentials: true }
      );
      setInCart(true);
      Toastify({
        text: "Product added to cart 🛒",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#16a34a",
      }).showToast();
    } catch (error) {
      Toastify({
        text: "Failed to add product to cart",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
    }
  };

  // Buy Now → Check login, address (including name and phone), and stock
  const handleBuyNow = async () => {
    if (product.stock === 0) {
      Toastify({
        text: "Product is out of stock",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
      return;
    }

    try {
      const userRes = await axios.get(`${API_URL}/api/user`, {
        withCredentials: true,
      });
      const user = userRes.data;

      if (!user || !user._id) {
        Toastify({
          text: "Please login to buy products",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();
        navigate("/login");
        return;
      }

      const addrFields = [user.name, user.mobile, user.address, user.city, user.state, user.pincode];
      const hasAddress = addrFields.every((f) => f && f.trim());

      if (!hasAddress || !/^[0-9]{10}$/.test(user.mobile)) {
        Toastify({
          text: !hasAddress ? "Please complete your address and phone number before placing the order" : "Please enter a valid 10-digit phone number",
          duration: 2500,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();

        navigate("/address", { state: { productId: product._id, quantity: qty } });
        return;
      }

      navigate("/revieworder", {
        state: {
          productId: product._id,
          quantity: qty,
          address: {
            name: user.name,
            phone: user.mobile,
            address: user.address,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
          }
        }
      });
    } catch (err) {
      Toastify({
        text: "Please login to buy products",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
      navigate("/login");
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      Toastify({
        text: "Please provide rating and comment",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#facc15",
      }).showToast();
      return;
    }

    const userReview = reviews.find((r) => r.user?._id === currentUser?._id);

    if (userReview) {
      Toastify({
        text: "You already submitted a review for this product",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#facc15",
      }).showToast();
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/reviews/product`,
        { productId: id, rating, comment },
        { withCredentials: true }
      );

      Toastify({
        text: "Review submitted ✅",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#16a34a",
      }).showToast();

      setRating(0);
      setHoverRating(0);
      setComment("");

      const res = await axios.get(`${API_URL}/api/reviews`, {
        params: { productId: id },
        withCredentials: true,
      });
      setReviews(res.data.data || []);
    } catch (err) {
      Toastify({
        text: err.response?.data?.message || "Failed to submit review",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (loading) return <div className="text-center py-10">Loading product...</div>;
  if (!product) return <div className="text-center py-10 text-red-500">Product not found.</div>;

  return (
    <div className="py-5 font-poppins">
      <div className="max-w-5xl mx-auto px-3">
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-[28px] md:text-4xl font-medium py-2">
            {product.name}
          </h2>
        </div>

        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <Swiper
              loop
              thumbs={{ swiper: thumbsSwiper }}
              modules={[FreeMode, Thumbs]}
              className="mb-10"
            >
              {product.images?.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="aspect-square bg-white flex items-center justify-center overflow-hidden border border-gray-100 rounded">
                    <img
                      src={transformCloudinaryUrl(img.url, 800)}
                      alt={`${product.name} ${i}`}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={4}
              slidesPerView={4}
              freeMode
              watchSlidesProgress
              modules={[FreeMode, Thumbs]}
              className="w-full"
            >
              {product.images?.map((img, i) => (
                <SwiperSlide key={i}>
                  <div className="aspect-square bg-white flex items-center justify-center overflow-hidden border border-gray-200 rounded cursor-pointer">
                    <img
                      src={transformCloudinaryUrl(img.url, 150)}
                      alt={`Thumb ${i}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="w-full md:w-1/2 px-2">
            <div className="py-4">
              <div className="mb-4">
                <div className="text-lg sm:text-xl md:text-2xl font-medium mb-1">
                  {product.name}
                </div>
                {product.offer_line && (
                  <div className="text-green-600 font-semibold text-sm sm:text-base mb-2">
                    {product.offer_line}% Launch Offer
                  </div>
                )}
                <div className="text-xs sm:text-sm mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={i <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1">({reviews.length} Reviews)</span>
                </div>
                <div className="text-lg sm:text-xl md:text-2xl py-2">
                  <span>₹{product.new_price}</span>
                  {product.old_price && (
                    <span className="line-through text-sm sm:text-base ml-2 text-gray-400">
                      ₹{product.old_price}
                    </span>
                  )}
                </div>
                <div className="text-sm sm:text-base text-red-600 font-semibold">
                  {product.stock === 0 ? "Out of Stock" : `In Stock: ${product.stock} units`}
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 leading-6">
                {product.description}
              </p>
              <div className="mt-3">
                <label htmlFor="quantity" className="text-sm sm:text-base text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    className="w-8 h-8 flex justify-center items-center bg-green-600 text-white text-base sm:text-lg rounded-l-sm cursor-pointer select-none"
                    onClick={() => setQty(qty > 1 ? qty - 1 : 1)}
                    disabled={product.stock === 0}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="w-12 h-8 text-center border border-gray-300 text-sm sm:text-base"
                    value={qty}
                    readOnly
                  />
                  <button
                    className="w-8 h-8 flex justify-center items-center bg-green-600 text-white text-base sm:text-lg rounded-r-sm cursor-pointer select-none"
                    onClick={() => setQty(qty + 1)}
                    disabled={product.stock === 0 || qty >= product.stock}
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-row sm:flex-row gap-1 mt-4">
                  <button
                    className="w-1/2 sm:w-auto px-3 py-2 text-[13px] sm:text-base sm:px-8 sm:py-2 bg-green-600 text-white font-semibold rounded border-2 border-green-600 hover:bg-transparent hover:text-green-600 transition disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
                    onClick={handleAddToCart}
                    disabled={inCart || product.stock === 0}
                  >
                    {inCart ? "In Cart" : "Add to Cart"}
                  </button>
                  <button
                    className="w-1/2 sm:w-auto px-3 py-2 text-[13px] sm:text-base sm:px-8 sm:py-2 bg-green-600 text-white font-semibold rounded border-2 border-green-600 hover:bg-transparent hover:text-green-600 transition disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <img
                      src="https://img.icons8.com/ios-filled/24/000000/shipped.png"
                      alt="Free Shipping"
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 sm:mr-2"
                    />
                    <span className="text-sm sm:text-base text-gray-700">
                      Free shipping on orders over ₹499
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <img
                      src="https://img.icons8.com/ios-filled/24/000000/checked.png"
                      alt="Authentic Products"
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 sm:mr-2"
                    />
                    <span className="text-sm sm:text-base text-gray-700">
                      100% Authentic Products
                    </span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="https://img.icons8.com/ios-filled/24/000000/customer-support.png"
                      alt="Customer Support"
                      className="w-5 h-5 sm:w-6 sm:h-6 mr-1.5 sm:mr-2"
                    />
                    <span className="text-sm sm:text-base text-gray-700">
                      24/7 Customer Support
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex border-b-2 border-gray-300 gap-2">
            <button
              className={`px-4 py-2 text-sm sm:text-base text-gray-500 hover:text-black ${activeTab === "description" ? "font-bold text-black border-b-2 border-gray-300" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`px-4 py-2 text-sm sm:text-base text-gray-500 hover:text-black ${activeTab === "reviews" ? "font-bold text-black border-b-2 border-gray-300" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviews.length})
            </button>
          </div>
          <div className="p-4 sm:p-5 text-sm sm:text-base text-gray-600 leading-6">
            {activeTab === "description" ? (
              <p>{product.description}</p>
            ) : (
              <div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-semibold uppercase mb-2">
                  REVIEWS
                </h4>
                {reviews.length > 0 ? (
                  reviews.map((r) => (
                    <div key={r._id} className="mb-4">
                      <div className="text-base sm:text-lg">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={i <= r.rating ? "text-yellow-400" : "text-gray-300"}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="line-clamp-4">{r.comment}</p>
                      <small className="text-xs sm:text-sm text-gray-500">
                        By: {r.user?.name || "User"} |{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-sm sm:text-base text-gray-600">
                    There are no reviews yet.
                  </p>
                )}
                <div className="mt-4">
                  <div className="mb-3">
                    <label className="text-sm sm:text-base text-gray-700">Your rating</label>
                    <div className="text-base sm:text-lg">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`cursor-pointer ${i <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}`}
                          onMouseEnter={() => setHoverRating(i)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(i)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="w-full p-1.5 border border-gray-300 rounded text-sm sm:text-base focus:outline-none focus:border-green-600"
                      rows="4"
                      placeholder="Write your review..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button
                    className="px-8 py-2 bg-green-600 text-white text-sm sm:text-base font-semibold rounded border-2 border-green-600 hover:bg-transparent hover:text-green-600 transition"
                    onClick={handleSubmitReview}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;