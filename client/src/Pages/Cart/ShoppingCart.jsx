import React, { useEffect, useState } from "react";
import "./ShoppingCart.css";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import EmptyCart from "./EmptyCart";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const getProduct = (item) =>
  item?.product && typeof item.product === "object" ? item.product : null;

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [updatingQty, setUpdatingQty] = useState({}); // Per-item loading state
  const [user, setUser] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`${API_URL}/api/user`, {
          withCredentials: true,
        });
        setUser(userRes.data);

        const cartRes = await axios.get(`${API_URL}/api/cart`, {
          withCredentials: true,
        });
        setCartItems(cartRes.data.items || []);
      } catch (err) {
        console.error("Error fetching cart/user:", err);
        if (err.response?.status === 401) {
          Toastify({
            text: "Please log in to view cart",
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#16a34a",
          }).showToast();
          navigate("/login");
        } else {
          Toastify({
            text: "Failed to fetch cart/user data",
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
          }).showToast();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const updateQty = async (productId, delta) => {
    const item = cartItems.find((i) => getProduct(i)?._id === productId);
    const product = getProduct(item);
    if (!item || !product || product.stock === 0) {
      Toastify({
        text: "Cannot update quantity for out-of-stock product",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
      return;
    }

    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > product.stock) {
      Toastify({
        text: newQty < 1 ? "Quantity cannot be less than 1" : "Quantity exceeds available stock",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
      return;
    }

    // Optimistic update
    const prevCartItems = [...cartItems]; // Store previous state for rollback
    setCartItems((prev) =>
      prev.map((i) =>
        getProduct(i)?._id === productId ? { ...i, quantity: newQty } : i
      )
    );
    setUpdatingQty((prev) => ({ ...prev, [productId]: true }));

    try {
      const res = await axios.put(
        `${API_URL}/api/cart/${productId}`,
        { quantity: newQty },
        { withCredentials: true }
      );
      setCartItems(res.data.items || []);
      Toastify({
        text: "Quantity updated",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#16a34a",
      }).showToast();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setCartItems(prevCartItems); // Revert on failure
      Toastify({
        text: "Failed to update quantity",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
    } finally {
      setUpdatingQty((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleDelete = async (productId) => {
    setRemovingItemId(productId);
    try {
      await axios.delete(`${API_URL}/api/cart/${productId}`, {
        withCredentials: true,
      });
      setCartItems((prev) => prev.filter((i) => getProduct(i)?._id !== productId));
      Toastify({
        text: "Item removed from cart",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#16a34a",
      }).showToast();
    } catch (err) {
      console.error("Failed to remove item:", err);
      Toastify({
        text: "Failed to remove item",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleCheckout = async () => {
    if (!user || !user._id) {
      Toastify({
        text: "Please log in to proceed",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#facc15",
      }).showToast();
      navigate("/login");
      return;
    }

    const inStockItems = cartItems.filter((item) => getProduct(item)?.stock > 0);
    if (inStockItems.length === 0) {
      Toastify({
        text: "No available items to checkout",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#f87171",
      }).showToast();
      return;
    }

    setCheckoutLoading(true);
    try {
      const subtotal = inStockItems.reduce(
        (sum, item) => sum + getProduct(item).new_price * item.quantity,
        0
      );

      const hasAddress =
        user.address?.trim() &&
        user.city?.trim() &&
        user.state?.trim() &&
        user.pincode?.trim() &&
        user.mobile?.trim();

      if (!hasAddress) {
        navigate("/address", {
          state: { cartItems: inStockItems, subtotal, total: subtotal },
        });
      } else {
        navigate("/revieworder", {
          state: {
            cartItems: inStockItems,
            subtotal,
            total: subtotal,
            address: {
              name: user.name || "",
              phone: user.mobile || "",
              address: user.address || "",
              city: user.city || "",
              state: user.state || "",
              pincode: user.pincode || "",
            },
          },
        });
      }
    } catch (err) {
      console.error("Checkout error:", err);
      Toastify({
        text: "Error during checkout",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <p className="text-center py-6">Loading cart...</p>;
  if (cartItems.length === 0) return <EmptyCart />;

  const visibleCartItems = cartItems.filter((item) => getProduct(item));
  if (visibleCartItems.length === 0) return <EmptyCart />;

  const inStockItems = visibleCartItems.filter((item) => getProduct(item).stock > 0);
  const subtotal = inStockItems.reduce(
    (sum, item) => sum + getProduct(item).new_price * item.quantity,
    0
  );

  return (
    <div className="cart-page">
      <h1>
        Marutham Stores <br />
        Your Shopping Bag
      </h1>

      <div className="cart-items">
        {visibleCartItems.map((item) => {
          const product = getProduct(item);

          return (
          <div
            className={`cart-item ${removingItemId === product._id ? "removing" : product.stock === 0 ? "out-of-stock" : ""
              }`}
            key={product._id}
          >
            <div className="item-info">
              <img
                src={product.images?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className={product.stock === 0 ? "grayscale" : ""}
              />
              <div className="item-details">
                <span>{product.name}</span>
                <span className="item-price font-semibold">
                  {item.product.old_price && (
                    <small className="line-through">₹{item.product.old_price}</small>
                  )}{" "}
                  ₹{item.product.new_price}
                </span>
                <span
                  className={`stock-status ${item.product.stock > 0 ? "in-stock" : "out-stock"
                    }`}
                >
                  {item.product.stock > 0 ? `In Stock` : "Out of Stock"}
                </span>
              </div>
            </div>

            <div className="qty-controls">
              <div
                className={`qty-control ${item.product.stock === 0 || updatingQty[item.product._id] ? "disabled" : ""}`}
              >
                <button
                  onClick={() => updateQty(item.product._id, -1)}
                  disabled={item.product.stock === 0 || item.quantity <= 1 || updatingQty[item.product._id]}
                >
                  -
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.product._id, 1)}
                  disabled={item.product.stock === 0 || item.quantity >= item.product.stock || updatingQty[item.product._id]}
                >
                  +
                </button>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.product._id)}
                disabled={removingItemId === item.product._id}
              >
                <MdDelete size={28} />
              </button>
            </div>
          </div>
          );
        })}
      </div>

      <div className="summary-card">
        <h2>Order Summary</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="summary-row total">
          <span>Total (excl. shipping)</span>
          <span>₹{subtotal}</span>
        </div>

        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={checkoutLoading || subtotal === 0}
        >
          {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
