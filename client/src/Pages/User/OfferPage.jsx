import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const OffersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImage, setHeroImage] = useState("/placeholder.jpg");

  const showLoginPromptToast = (type = "wishlist") => {
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/offers`);
        const sortedOffers = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestOffer = sortedOffers.length > 0 ? [sortedOffers[0]] : [];
        setOffers(latestOffer);

        const offerId = searchParams.get("offerId");
        if (offerId) {
          const targetOffer = sortedOffers.find((offer) => offer._id === offerId);
          setHeroImage(targetOffer?.image?.url || sortedOffers.find((offer) => offer.image?.url)?.image.url || "/placeholder.jpg");
        } else {
          setHeroImage(sortedOffers.find((offer) => offer.image?.url)?.image.url || "/placeholder.jpg");
        }
      } catch (err) {
        console.error("Failed to fetch offers:", err);
        setHeroImage("/placeholder.jpg");
      } finally {
        setLoading(false);
      }

      try {
        const wishlistRes = await axios.get(`${API_URL}/api/wishlist`, { withCredentials: true });
        setWishlist(wishlistRes.data.map((item) => item.product._id));
      } catch (error) {
        console.error(error);
      }
      try {
        const cartRes = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
        setCart(cartRes.data.items.map((item) => item.product._id));
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [searchParams]);

  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await axios.delete(`${API_URL}/api/wishlist/${productId}`, { withCredentials: true });
        setWishlist((prev) => prev.filter((id) => id !== productId));
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { productId }, { withCredentials: true });
        setWishlist((prev) => [...prev, productId]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showLoginPromptToast("wishlist");
      } else {
        Toastify({
          text: "Failed to manage wishlist",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();
      }
    }
  };

  const toggleCart = async (productId) => {
    const product = offers.flatMap((offer) => offer.products).find((p) => p._id === productId);
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
      if (cart.includes(productId)) {
        await axios.delete(`${API_URL}/api/cart/${productId}`, { withCredentials: true });
        setCart((prev) => prev.filter((id) => id !== productId));
        Toastify({
          text: "Removed from Cart",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();
      } else {
        await axios.post(`${API_URL}/api/cart`, { productId, quantity: 1 }, { withCredentials: true });
        setCart((prev) => [...prev, productId]);
        Toastify({
          text: "Added to Cart",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#16a34a",
        }).showToast();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showLoginPromptToast("cart");
      } else {
        Toastify({
          text: "Failed to manage cart",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();
      }
    }
  };

  const handleBuyNow = async (productId) => {
    const product = offers.flatMap((offer) => offer.products).find((p) => p._id === productId);
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
      const userRes = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
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
      const hasAddress = addrFields.every((f) => f && f.trim()) && /^[0-9]{10}$/.test(user.mobile);

      if (!hasAddress) {
        Toastify({
          text: !/^[0-9]{10}$/.test(user.mobile) ? "Please enter a valid 10-digit phone number" : "Please complete your address and phone number before placing the order",
          duration: 2500,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();
        navigate("/address", { state: { productId, quantity: 1 } });
        return;
      }

      navigate("/revieworder", {
        state: {
          productId,
          quantity: 1,
          address: {
            name: user.name,
            phone: user.mobile,
            address: user.address,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
          },
        },
      });
    } catch {
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

  if (loading) return <div className="text-center py-10 text-gray-600 text-lg">Loading offers...</div>;

  return (
    <div className="px-3">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="relative w-full h-32 sm:h-64 bg-gray-100 rounded-lg overflow-hidden">
          <img src={heroImage} alt="Offer Hero" className="w-full h-full object-cover" />
        </div>
      </div>

      <h1 className="text-center text-xl sm:text-2xl font-bold mb-8 relative after:content-[''] after:block after:w-16 after:h-1 after:bg-green-600 after:mx-auto after:mt-2 after:rounded">
        Special Offers
      </h1>

      {offers.length === 0 ? (
        <p className="text-center text-gray-500 text-base sm:text-lg">No offers available at the moment.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {offers.map((offer) => (
            <div key={offer._id} className="w-full">
              <div className="flex flex-wrap gap-3">
                {offer.products.map((product) => {
                  const isWished = wishlist.includes(product._id);
                  const inCart = cart.includes(product._id);

                  return (
                    <div
                      key={product._id}
                      className="w-1/2 max-[400px]:w-full max-w-[calc(50%-0.75rem)] sm:w-1/5 bg-white rounded-lg shadow-md overflow-hidden relative transition-transform duration-300 hover:-translate-y-1"
                    >
                      {product.badge && (
                        <div className="absolute top-2 left-0 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded-r">
                          {product.badge}
                        </div>
                      )}

                      <Link to={`/productdetails/${product._id}`}>
                        <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
                          <img
                            src={product.images?.[0]?.url || "/placeholder.jpg"}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </Link>

                      <div className="p-3">
                        <h4 className="my-2 text-sm truncate">
                          <Link
                            to={`/productdetails/${product._id}`}
                            className="text-gray-800 no-underline hover:text-green-600 transition-colors"
                          >
                            {product.name}
                          </Link>
                        </h4>
                        {product.offer_line && (
                          <div className="text-green-600 font-semibold text-xs mb-2">{product.offer_line} Launch Offer</div>
                        )}
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className={`text-xs font-semibold mb-2 ${product.stock === 0 ? "text-red-600" : "text-gray-600"}`}>
                          {product.stock === 0 ? "Out of Stock" : `In Stock: ${product.stock} units`}
                        </div>

                        <div className="flex justify-between items-center mb-2">
                          <div className="text-base text-green-600 font-bold">
                            {product.old_price && (
                              <small className="text-xs text-gray-500 line-through mr-1">₹{product.old_price}</small>
                            )}
                            ₹{product.new_price}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleWishlist(product._id)}
                              className="bg-transparent border-none cursor-pointer p-1.5"
                            >
                              {isWished ? (
                                <FaHeart className="text-green-800 text-lg" />
                              ) : (
                                <FaRegHeart className="text-gray-400 text-lg hover:text-green-600 transition" />
                              )}
                            </button>
                            <button
                              onClick={() => toggleCart(product._id)}
                              className="bg-transparent border-none cursor-pointer p-1.5"
                              disabled={product.stock === 0}
                            >
                              <FaShoppingCart
                                className={`text-lg ${inCart
                                    ? "text-green-800"
                                    : product.stock === 0
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-gray-400 hover:text-green-600 transition"
                                  }`}
                              />
                            </button>
                          </div>
                        </div>

                        <button
                          className="w-full py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                          onClick={() => handleBuyNow(product._id)}
                          disabled={product.stock === 0}
                        >
                          {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
