const Order = require("../models/order");
const Product = require("../models/product");
const Counter = require("../models/counter");
const User = require("../models/User");
const { sendUserOrderEmail, sendAdminOrderEmail } = require("./EmailService");

// Create new order with sequential code
const createOrder = async (userId, orderData) => {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const orderCode = `ORD${counter.seq}`;

  // Check stock
  for (let item of orderData.items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    if (product.stock < item.quantity)
      throw new Error(`Not enough stock for ${product.name}`);
  }

  // Decrease stock
  for (let item of orderData.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // Save order including shipping
  const order = new Order({
    code: orderCode,
    user: userId,
    full_name: orderData.full_name,
    phone: orderData.phone,
    address: orderData.address,
    city: orderData.city,
    state: orderData.state,
    pincode: orderData.pincode,
    payment_method: orderData.payment_method,
    is_paid: orderData.is_paid || false,
    shipping: orderData.shipping || 0, // ✅ Save shipping here
    items: orderData.items,
  });

  const savedOrder = await order.save();

  // ─── Send email notifications (non-blocking) ──────────────────────────────
  try {
    const user = await User.findById(userId).select("name email");
    if (user) {
      // Populate product names for email
      const populated = await Order.findById(savedOrder._id).populate("items.product", "name");
      await Promise.all([
        sendUserOrderEmail(populated, user.email, user.name),
        sendAdminOrderEmail(populated, user.email, user.name),
      ]);
    }
  } catch (mailErr) {
    console.error("[EmailService] Failed to send order emails:", mailErr.message);
    // Do NOT throw — order is already saved, email failure shouldn't break the flow
  }

  return savedOrder;
};
// Get orders of a user
const getUserOrders = async (userId) => {
  return await Order.find({ user: userId })
    .populate("items.product")
    .sort({ createdAt: -1 });
};

// Get single order by ID for user
const getOrderById = async (orderId, userId) => {
  return await Order.findOne({ _id: orderId, user: userId }).populate("items.product");
};

// Get all orders (admin)
const getAllOrders = async () => {
  return await Order.find()
    .populate("user", "name email mobile")
    .populate("items.product")
    .sort({ createdAt: -1 });
};

// Get single order by ID (admin)
const getOrderByIdAdmin = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email mobile")
    .populate("items.product");
  if (!order) throw new Error("Order not found");
  return order;
};

// ✅ Update order status and/or payment (admin)
const updateOrder = async (orderId, data) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  // Capitalize status to match schema
  if (data.status) {
    order.status = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
  }

  if (typeof data.is_paid === "boolean") order.is_paid = data.is_paid;

  return await order.save();
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  getOrderByIdAdmin,
  updateOrder,
};
