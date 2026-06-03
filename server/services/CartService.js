const Cart = require("../models/cart");

// Helper: decide query by user or session
const getCartQuery = (user, sessionID) => {
  if (user) return { user: user._id };
  if (sessionID) return { session_key: sessionID };
  throw new Error("No user or session found");
};

const removeDeletedProducts = async (cart) => {
  if (!cart) return cart;

  const originalLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.product);

  if (cart.items.length !== originalLength) {
    await cart.save();
    await cart.populate("items.product");
  }

  return cart;
};

// 🛒 Get or create cart
async function getOrCreateCart(user, sessionID) {
  const query = getCartQuery(user, sessionID);
  let cart = await Cart.findOne(query).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ ...query, items: [] });
    await cart.populate("items.product");
  }
  return removeDeletedProducts(cart);
}

// ➕ Add item to cart
async function addToCart(user, sessionID, productId, quantity = 1) {
  const query = getCartQuery(user, sessionID);
  let cart = await Cart.findOne(query);

  if (!cart) {
    cart = await Cart.create({ ...query, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product");
  return removeDeletedProducts(cart);
}

// ✏️ Update item quantity
async function updateCartItem(user, sessionID, productId, quantity) {
  const query = getCartQuery(user, sessionID);
  const cart = await Cart.findOne(query);

  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new Error("Item not in cart");

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  return removeDeletedProducts(cart);
}

// ❌ Remove item
async function removeFromCart(user, sessionID, productId) {
  const query = getCartQuery(user, sessionID);
  const cart = await Cart.findOne(query);

  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();
  await cart.populate("items.product");
  return removeDeletedProducts(cart);
}

// 🗑️ Clear cart
async function clearCart(user, sessionID) {
  const query = getCartQuery(user, sessionID);
  const cart = await Cart.findOne(query);

  if (!cart) throw new Error("Cart not found");

  cart.items = [];
  await cart.save();
  await cart.populate("items.product");
  return cart;
}

module.exports = {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
