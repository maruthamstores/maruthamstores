import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "./Navbar.css";
import "toastify-js/src/toastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [offerLine, setOfferLine] = useState("");
  const menuRef = useRef();
  const navigate = useNavigate();

  const showLoginPromptToast = useCallback((type) => {
    const toastNode = document.createElement("div");
    toastNode.className = "flex flex-col gap-2 text-sm";

    const message = document.createElement("span");
    message.textContent = `You're not logged in. Can't view ${type}. Login now?`;

    const actions = document.createElement("div");
    actions.className = "flex justify-center gap-2";

    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.className = "rounded bg-white px-3 py-1 font-semibold text-green-700";

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
      gravity: "top",
      position: "center",
      backgroundColor: "#16a34a",
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
  }, [navigate]);

  const handleProtectedNav = useCallback(async (event, path, type) => {
    event.preventDefault();
    setMenuOpen(false);

    try {
      await axios.get(`${API_URL}/api/user`, { withCredentials: true });
      navigate(path);
    } catch (err) {
      if (err.response?.status === 401) {
        showLoginPromptToast(type);
      } else {
        Toastify({
          text: `Unable to open ${type}`,
          duration: 2000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "#16a34a",
        }).showToast();
      }
    }
  }, [navigate, showLoginPromptToast]);

  // Fetch all products, categories, and offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, offersRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/offers`),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        // Select the most recent offer's offerLine
        const latestOffer = offersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        setOfferLine(latestOffer ? latestOffer.offerLine : "Explore Our Latest Deals");
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setOfferLine("Explore Our Latest Deals"); // Fallback if fetch fails
      }
    };
    fetchData();
  }, []);

  // Body scroll lock when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
        setCategoryOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic (products + categories)
  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();

    const productMatches = products
      .filter((p) => p.name.toLowerCase().includes(term))
      .map((p) => ({ ...p, type: "Product" }));

    const categoryMatches = categories
      .filter((c) => c.name.toLowerCase().includes(term))
      .map((c) => ({ ...c, type: "Category" }));

    setSearchResults([...productMatches, ...categoryMatches]);
  }, [searchTerm, products, categories]);

  const handleSearchClick = useCallback((item) => {
    if (item.type === "Category") {
      navigate(`/product?category=${item.name}`);
    } else {
      navigate(`/productdetails/${item._id}`);
    }
    setSearchTerm("");
    setSearchResults([]);
    setMenuOpen(false);
  }, [navigate]);

  return (
    <>
      <div className="top-bar">
        <Link to="/offerspage">
          <span>
            <i className="fas fa-leaf"></i> 100% Natural & Organic &nbsp; | &nbsp; ✨
            {offerLine} | Shop Now
          </span>
        </Link>
      </div>

      <div className="navbar" ref={menuRef}>
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <img src="/loginlogo.jpeg" alt="M" className="logo-img" /> 
        </Link>

        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
          <div className="mobile-only-logo">
            <img src="/loginlogo.jpeg" alt="Marutham Stores" />
          </div>
          {/* Category Dropdown */}
          <div
            className="dropdown nav-link"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            Categories{" "}
            <i
              className="fas fa-chevron-down"
              style={{ fontSize: "10px", marginLeft: "4px" }}
            ></i>
            <div
              className="dropdown-content"
              style={{ display: categoryOpen ? "flex" : "none" }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/product?category=${cat.name}`}
                  className="dropdown-item"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/category"
                className="dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                All Categories
              </Link>
            </div>
          </div>

          <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </div>

        {/* Search Box */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search Product or Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>

          {searchResults.length > 0 && (
            <div className="search-suggestions">
              {searchResults.map((item) => (
                <div
                  key={item._id}
                  className="suggestion-item"
                  onClick={() => handleSearchClick(item)}
                >
                  <span className="suggestion-name">{item.name}</span>
                  <span className="suggestion-type">{item.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="right-icons">
          <Link
            to="/profile"
            className="profile-icon"
            onClick={(event) => handleProtectedNav(event, "/profile", "profile")}
          >
            <i className="fas fa-user text-2xl"></i>
          </Link>
          <Link to="/cart" onClick={(event) => handleProtectedNav(event, "/cart", "cart")}>
            <button className="cart-btn">
              <i className="fas fa-shopping-cart"></i> <span>Cart</span>
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default React.memo(Navbar);
