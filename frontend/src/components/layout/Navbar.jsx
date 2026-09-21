import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  Search,
  Bell,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  Home,
  Heart,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useSocket } from "../../context/SocketContext";
import { apiFetch } from "../../config/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { unreadCount } = useSocket();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

 

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      return;
    }

    const loadNotificationCount = async () => {
      try {
        const data = await apiFetch("/notifications/unread-count");
        setNotificationCount(data.count);
      } catch (err) {
        console.error("Failed to load notification count:", err);
      }
    };

    loadNotificationCount();

    const handleNotificationsUpdated = () => {
      loadNotificationCount();
    };

    window.addEventListener("notificationsUpdated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("notificationsUpdated", handleNotificationsUpdated);
    };
  }, [user]);

 
const handleSearchChange = async (e) => {
  const value = e.target.value;
  setQuery(value);

  const searchText = value.trim();

  if (!searchText) {
    setSearchResults([]);
    setShowSearchResults(false);
    return;
  }

  setShowSearchResults(true);
  setSearchLoading(true);

  try {
    const data = await apiFetch(
      `/products/search?q=${encodeURIComponent(searchText)}`
    );

    console.log("SEARCH RESULT:", data);

    setSearchResults(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Product search failed:", error);
    setSearchResults([]);
  } finally {
    setSearchLoading(false);
  }
};

const submitSearch = async (e) => {
  e.preventDefault();

  const searchText = query.trim();

  if (!searchText) return;

  try {
    setSearchLoading(true);

    const data = await apiFetch(
      `/products/search?q=${encodeURIComponent(searchText)}`
    );

    console.log("SUBMIT SEARCH RESULT:", data);

    if (Array.isArray(data) && data.length > 0) {
      navigate(`/product/${data[0]._id}`);
      setQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      setMobileOpen(false);
    } else {
      showToast(`No products found for "${searchText}"`);
    }
  } catch (error) {
    console.error("Product search failed:", error);
    showToast("Search failed. Please try again.");
  } finally {
    setSearchLoading(false);
  }
};
 

  
  
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    showToast("Logged out successfully");
    navigate("/");
  };

 

  const openProfile = () => {
    if (!user?._id) return;

    setProfileOpen(false);
    navigate(`/profile/${user._id}`);
  };

  return (
    <header className="navbar">
      <div className="nav-inner">

      

        <NavLink
          to="/"
          className="brand"
          onClick={() => {
            setMobileOpen(false);
            setProfileOpen(false);
          }}
        >
          <span className="brand-mark">
            <Heart size={22} />
          </span>

          <span className="brand-text">
            <strong>Revly</strong>
            <small>Your Beauty, Your Voice, Your Community</small>
          </span>
        </NavLink>

        

        <button
          className="mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

       
        <div className={`nav-content ${mobileOpen ? "open" : ""}`}>


          <nav className="main-nav">
            <NavLink to="/" end onClick={() => setMobileOpen(false)}>
              <Home size={15} />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/product-explore"
              className={({ isActive }) =>
                isActive || location.pathname.startsWith("/product/")
                  ? "active"
                  : ""
              }
              onClick={() => setMobileOpen(false)}
            >
              <span>Products</span>
            </NavLink>

            <NavLink to="/reviews" onClick={() => setMobileOpen(false)}>
              <span>Reviews</span>
            </NavLink>

            <NavLink to="/community" onClick={() => setMobileOpen(false)}>
              <Heart size={15} />
              <span>Community</span>
            </NavLink>

            <a
              href="/#reviewers"
              onClick={(e) => {
                if (location.pathname !== "/") {
                  e.preventDefault();
                  navigate("/#reviewers");
                }
                setMobileOpen(false);
              }}
            >
              <span>Top Reviewers</span>
            </a>
           <NavLink
           to="/blog"
           className={({ isActive }) => (isActive ? "active" : "")}
           onClick={() => setMobileOpen(false)}
             >
              <span>Blog</span>
          </NavLink>
            
          </nav>

          

          <form className="nav-search" onSubmit={submitSearch}>
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              onFocus={() => {
                if (query.trim()) setShowSearchResults(true);
              }}
              placeholder="Search products..."
            />

            <button type="submit" aria-label="Search">
              <Search size={18} />
            </button>

            {showSearchResults && query.trim() && (
              <div className="nav-search-results">

                {searchLoading && (
                  <div className="nav-search-message">
                    Searching products...
                  </div>
                )}

                {!searchLoading && searchResults.length === 0 && (
                  <div className="nav-search-message">
                    No products found
                  </div>
                )}

                {!searchLoading && searchResults.length > 0 &&
                  searchResults.map((product) => (
                    <button
                      key={product._id}
                      type="button"
                      className="nav-search-product"
                      onClick={() => {
                        navigate(`/product/${product._id}`);
                        setQuery("");
                        setSearchResults([]);
                        setShowSearchResults(false);
                        setMobileOpen(false);
                      }}
                    >
                      <div className="nav-search-product-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <span>♡</span>
                        )}
                      </div>

                      <div className="nav-search-product-info">
                        <strong>{product.name}</strong>
                        <span>{product.brand}</span>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </form>

         

          <div className="nav-actions">

           

            <button
              className="nav-icon-btn"
              onClick={() => navigate("/messages")}
              aria-label="Messages"
            >
              <MessageCircle size={19} />
              {unreadCount > 0 && <b>{unreadCount}</b>}
            </button>

           

            <button
              className="nav-icon-btn"
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {notificationCount > 0 && <b>{notificationCount}</b>}
            </button>

           

            {user ? (
              <div className="profile-wrapper">

                <button
                  className="profile-mini"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-label="Open profile menu"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span className="avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )}

                  <span>Hi, {user.username}</span>

                  <ChevronDown
                    size={16}
                    className={profileOpen ? "rotate-icon" : ""}
                  />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">

                   

                    <div className="dropdown-user">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <span className="avatar-placeholder">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      )}

                      <div>
                        <strong>{user.username}</strong>
                        <span>
                          @{user.username?.replace(/\s+/g, "").toLowerCase()}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                   

                    <button onClick={openProfile}>
                      <span>👤</span>
                      My Profile
                    </button>

                   

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/add-product");
                      }}
                    >
                      <span>➕</span>
                      Add Product
                    </button>

                    

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        showToast("Settings coming soon!");
                      }}
                    >
                      <span>⚙️</span>
                      Settings
                    </button>

                   

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        showToast("Opening saved reviews...");
                      }}
                    >
                      <span>♡</span>
                      Saved Reviews
                    </button>

                    <div className="dropdown-divider" />

                 

                    <button className="logout-item" onClick={handleLogout}>
                      <span>↪</span>
                      Logout
                    </button>

                  </div>
                )}
              </div>
            ) : (
             

              <div className="auth-buttons">
                <button onClick={() => navigate("/login")}>Login</button>
                <button onClick={() => navigate("/register")}>Register</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
