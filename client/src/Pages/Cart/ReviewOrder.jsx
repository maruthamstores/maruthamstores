import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "./ReviewOrder.css";

const API_URL = import.meta.env.VITE_API_URL;

const ReviewOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    productId,
    quantity,
    cartItems: passedCartItems = [],
    address: passedAddress,
  } = location.state || {};

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(0);
  const hasFetched = useRef(false);

  const calculateShipping = (state, subtotal) => {
    if (!state) return 140;
    if (state.toLowerCase() === "tamil nadu") return subtotal < 1000 ? 70 : 0;
    return 140;
  };
 
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get logged-in user
        const userRes = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
        const user = userRes.data;
        if (!user || !user._id) {
          Toastify({
            text: "Please log in to proceed",
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#facc15",
          }).showToast();
          navigate("/login", { replace: true });
          return;
        }
        setUserId(user._id);

        // Get address
        const addrData = passedAddress || {
          name: user.name || "",
          phone: user.mobile || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
        };

        if (!addrData.name || !addrData.phone || !addrData.address || !addrData.city || !addrData.state || !addrData.pincode) {
          Toastify({
            text: "Please complete your address before placing an order",
            duration: 2500,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
          }).showToast();
          navigate("/address", { state: { cartItems: passedCartItems }, replace: true });
          return;
        }

        // Phone validation
        if (!/^[0-9]{10}$/.test(addrData.phone)) {
          Toastify({
            text: "Please enter a valid 10-digit phone number",
            duration: 2500,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
          }).showToast();
          navigate("/address", { state: { cartItems: passedCartItems }, replace: true });
          return;
        }

        setAddress(addrData);

        // Get products
        let items = [];
        if (productId) {
          const res = await axios.get(`${API_URL}/api/products/${productId}`);
          const product = res.data;
          if (product.stock === 0 || product.stock < quantity) {
            Toastify({
              text: "Selected product is out of stock or insufficient quantity",
              duration: 2000,
              gravity: "bottom",
              position: "center",
              backgroundColor: "#dc2626",
            }).showToast();
            navigate("/cart", { replace: true });
            return;
          }
          items = [{ product, quantity }];
        } else if (passedCartItems.length > 0) {
          items = passedCartItems.filter(item => item.product.stock > 0 && item.product.stock >= item.quantity);
        } else {
          const res = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
          items = (res.data.items || []).filter(item => item.product.stock > 0 && item.product.stock >= item.quantity);
        }

        if (!items.length) {
          Toastify({
            text: "No available products to checkout",
            duration: 2000,
            gravity: "bottom",
            position: "center",
            backgroundColor: "#dc2626",
          }).showToast();
          navigate("/cart", { replace: true });
          return;
        }

        setCartItems(items);

        const subtotal = items.reduce((sum, item) => sum + item.product.new_price * item.quantity, 0);
        setShipping(calculateShipping(addrData.state, subtotal));
      } catch (err) {
        console.error("Error fetching order details:", err);
        Toastify({
          text: "Failed to load order details",
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#dc2626",
        }).showToast();
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, quantity]);

  // Place order
  const handlePlaceOrder = async () => {
    if (!cartItems.length || !address || !userId) return;

    const { name, phone, address: addr, city, state, pincode } = address;

    const validItems = cartItems.filter(item => item.product.stock > 0 && item.product.stock >= item.quantity);
    if (!validItems.length) {
      Toastify({
        text: "No available products to place order",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
      navigate("/cart", { replace: true });
      return;
    }

    try {
      const subtotal = validItems.reduce((sum, item) => sum + item.product.new_price * item.quantity, 0);
      const total = subtotal + shipping;

      const orderData = {
        items: validItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.new_price,
        })),
        full_name: name,
        phone,
        address: addr,
        city,
        state,
        pincode,
        payment_method: "UPI",
        subtotal,
        shipping,
        total,
        user: userId,
      };

      await axios.post(`${API_URL}/api/orders`, orderData, { withCredentials: true });

      if (!productId) {
        await axios.delete(`${API_URL}/api/cart/clear`, { withCredentials: true });
      }

      let message = `*New Order Placed!*\n\nName: ${name}\nPhone: ${phone}\nAddress: ${addr}, ${city}, ${state} - ${pincode}\n\nItems:\n`;
      validItems.forEach((item, idx) => {
        message += `${idx + 1}.${item.product.name} - Qty: ${item.quantity} - ₹${item.product.new_price}\n`;
      });
      message += `\nSubtotal: ₹${subtotal}\nShipping: ₹${shipping}\nTotal: ₹${total}\nPayment: UPI`;

      const whatsappNumber = "919003689821";
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");

      Toastify({
        text: "Order placed successfully ✅",
        duration: 2000,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#16a34a",
      }).showToast();

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error placing order:", err);
      Toastify({
        text: err.response?.data?.message || "Failed to place order",
        duration: 2500,
        gravity: "bottom",
        position: "center",
        backgroundColor: "#dc2626",
      }).showToast();
    }
  };

  if (loading) return <div className="text-center py-10">Loading order details...</div>;
  if (!cartItems.length) return <div className="text-center py-10 text-red-500">No items to checkout.</div>;

  const validItems = cartItems.filter(item => item.product.stock > 0 && item.product.stock >= item.quantity);
  const subtotal = validItems.reduce((sum, item) => sum + item.product.new_price * item.quantity, 0);
  const total = subtotal + shipping;

  return (
    <div className="review-page-wrapper">
      <div className="review-bg"></div>
      <div className="review-page">
        <h1>Review & Confirm Your Order</h1>
        <div>
          {address && (
            <div className="address-card">
              <h2>Delivery Address</h2>
              <p><strong>{address.name}</strong></p>
              <p>{address.address}</p>
              <p>{address.city}, {address.state} - {address.pincode}</p>
              <p>{address.phone}</p>
            </div>
          )}
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item" key={item.product._id}>
                <div className="item-info">
                  <img
                    src={item.product.images?.[0]?.url || "/placeholder.png"}
                    alt={item.product.name}
                    className={item.product.stock === 0 ? "grayscale" : ""}
                  />
                  <div className="item-details">
                    <span>{item.product.name}</span>
                    <span className="item-price">₹{item.product.new_price}</span>
                    {item.product.stock === 0 ? (
                      <span className="text-red-600 text-sm">Out of Stock</span>
                    ) : item.product.stock < item.quantity ? (
                      <span className="text-red-600 text-sm">Insufficient Stock (Available: {item.product.stock})</span>
                    ) : null}
                  </div>
                </div>
                <span>Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={validItems.length === 0}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrder;