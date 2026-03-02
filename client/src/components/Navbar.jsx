import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

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

  const handleSearchClick = (item) => {
    if (item.type === "Category") {
      navigate(`/product?category=${item.name}`);
    } else {
      navigate(`/productdetails/${item._id}`);
    }
    setSearchTerm("");
    setSearchResults([]);
    setMenuOpen(false);
  };

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
          <img src="" alt="M" /> Marutham Stores
        </Link>

        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <div className={`nav-links ${menuOpen ? "active" : ""}`}>
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
            onClick={() => setMenuOpen(false)}
          >
            <i className="fas fa-user text-2xl"></i>
          </Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            <button className="cart-btn">
              <i className="fas fa-shopping-cart"></i> Cart
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;