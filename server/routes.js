const categoryController = require('./controllers/CategoryController');
const heroController = require('./controllers/HeroController');
const productController = require('./controllers/ProductController');
const reelController = require('./controllers/ReelController');
const wishlistController = require('./controllers/WishlistController');
const userController = require('./controllers/UserController');
const cartController = require("./controllers/CartController");
const reviewController = require("./controllers/ReviewController");
const orderController = require("./controllers/OrderController"); 
const authMiddleware = require("./AuthMiddleware");
const adminController = require('./controllers/AdminController');
const { isAdmin } = require('./AdminAuth');
const { heroUpload, productUpload, categoryUpload, reelSingleUpload,offerUpload } = require('./config/multer');
const dashboard = require('./controllers/DashboardContoller');
const offerController = require('./controllers/OfferController');
 const contactRequestController = require('./controllers/ContactController');
const appRoutes = (app) => {

  // -------------------- USER AUTH & PROFILE --------------------
  app.post('/api/register', userController.register);
  app.post('/api/login', userController.login);
  app.post('/api/logout', userController.logout);
  app.get('/api/user', authMiddleware, userController.getProfile);
  app.put("/api/user/address", authMiddleware, userController.updateUserAddress);

  // -------------------- ADMIN USER MANAGEMENT --------------------
  app.post('/api/admin/login', adminController.loginAdmin);
  app.post('/api/admin/logout', adminController.logoutAdmin);
  app.get('/api/admin/profile', isAdmin, adminController.getAdminProfile);
  app.get('/api/admin/users/:id', isAdmin, userController.adminGetUserById);
  app.get('/api/admin/users', isAdmin, userController.adminGetAllUsers);

  // -------------------- CATEGORY ROUTES --------------------
  app.get('/api/categories', categoryController.fetchCategories);
  app.get("/api/categories/:id", categoryController.getCategoryById);
  app.post('/api/categories', categoryUpload.single('image'), categoryController.createCategory);
  app.put('/api/categories/:id', categoryUpload.single('image'), categoryController.updateCategory);
  app.delete('/api/categories/:id', categoryController.deleteCategory);

  // -------------------- HERO ROUTES --------------------
  app.get('/api/hero', heroController.getHeroes);
  app.post('/api/hero', heroUpload.array('image', 4), heroController.createHero);
  app.put('/api/hero/:id', heroUpload.array('image', 4), heroController.updateHero);
  app.delete('/api/hero/:id', heroController.deleteHero);

  // -------------------- PRODUCT ROUTES --------------------
  app.get('/api/products', productController.getProducts);
  app.get("/api/products/:id", productController.getProductById);
  app.post('/api/products', isAdmin, productUpload.array('images', 4), productController.createProduct);
  app.put('/api/products/:id', isAdmin, productUpload.array('images', 4), productController.updateProduct);
  app.delete('/api/products/:id', isAdmin, productController.deleteProduct);

  // -------------------- REEL ROUTES --------------------
  app.get('/api/reels/signature', reelController.getSignature);
  app.get('/api/reels', reelController.getReels);
  app.post('/api/reels', reelController.createReel);
  app.delete('/api/reels/:id', reelController.deleteReel);

  // -------------------- WISHLIST ROUTES --------------------
  app.post('/api/wishlist', authMiddleware, wishlistController.addWishlist);
  app.get('/api/wishlist', authMiddleware, wishlistController.getWishlist);
  app.get('/api/wishlist/all', isAdmin, wishlistController.getAllWishlists);
  app.delete('/api/wishlist/:productId', authMiddleware, wishlistController.deleteWishlist);

  // -------------------- CART ROUTES --------------------
  app.get("/api/cart", authMiddleware, cartController.getCart);
  app.post("/api/cart", authMiddleware, cartController.addToCart);
  app.put("/api/cart/:productId", authMiddleware, cartController.updateCartItem);
  app.delete("/api/cart/:productId", authMiddleware, cartController.removeFromCart);
  app.delete("/api/cart", authMiddleware, cartController.clearCart);

  // -------------------- REVIEW ROUTES --------------------
  // General Reviews
  app.post("/api/reviews/general", authMiddleware, reviewController.createGeneralReview);
  app.put("/api/reviews/general", authMiddleware, reviewController.updateGeneralReview);

  // Product Reviews
  app.post("/api/reviews/product", authMiddleware, reviewController.createProductReview);
  app.put("/api/reviews/product", authMiddleware, reviewController.updateProductReview);

  // Get Reviews
  app.get("/api/reviews", reviewController.getReviews);

  // Delete Reviews
  app.delete("/api/reviews", authMiddleware, reviewController.deleteReview); // single
  app.delete("/api/reviews/bulk-delete", isAdmin, reviewController.deleteMultipleReviews); // bulk

  // -------------------- ORDER ROUTES --------------------
  // User Orders
  app.post("/api/orders", authMiddleware, orderController.createOrder);
  app.get("/api/orders/user", authMiddleware, orderController.getUserOrders);
  app.get("/api/orders/:id", authMiddleware, orderController.getOrderById);

  // Admin Orders
  app.get("/api/admin/orders", isAdmin, orderController.getAllOrders);
  app.get("/api/admin/orders/:id", isAdmin, orderController.getOrderByIdAdmin);
  app.put("/api/orders/:id", isAdmin, orderController.updateOrder);

  // -------------------- DASHBOARD (admin only) --------------------
  app.get("/api/admin/dashboard", isAdmin, dashboard.getDashboard);

  //--offer
  app.post('/api/offers', isAdmin, offerUpload.single('image'), offerController.createOffer);
  app.get('/api/offers', offerController.getAllOffers);
  app.put('/api/offers/:id', isAdmin, offerUpload.single('image'), offerController.updateOffer);
  app.delete('/api/offers/:id', isAdmin, offerController.deleteOffer);


  //contact 
    // Create contact request (public)
  app.post('/api/contact-requests', contactRequestController.createContactRequest);
  // Get all contact requests (admin only)
  app.get('/api/contact-requests', isAdmin, contactRequestController.getContactRequests);
  // Update contact request (admin only)
  app.put('/api/contact-requests/:id', isAdmin, contactRequestController.updateContactRequest);
  // Get pending request count (admin only)
  app.get('/api/contact-requests/pending-count', isAdmin, contactRequestController.getPendingContactCount);
  app.delete('/api/contact-requests/:id', isAdmin, contactRequestController.deleteContactRequest);
};

module.exports = appRoutes;
