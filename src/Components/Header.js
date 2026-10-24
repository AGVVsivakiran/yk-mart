import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../Controllers/UserContext";
import "./Header.css";
import "../variables.css";
import Variables from '../Variables.json';
import { FaCertificate } from "react-icons/fa6";
import { FaLeaf } from "react-icons/fa6";
import { FaWallet } from "react-icons/fa6";
import { harvestlogobg } from "../assets/harvest/harvestlogobg.png"
import harvestlogo from "../assets/harvest/harvestlogo.jpeg"

// Icons
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiBox,
  FiMenu, FiX, FiChevronDown, FiEye, FiEyeOff, FiTrash2
} from "react-icons/fi";
import { CiWheat } from "react-icons/ci";

// Logo
import Logo from "../logo.jpg";
import { useLanguage } from "../Controllers/LanguageContext";

const baseUrl = Variables.baseUrl;

const Header = () => {
  const navigate = useNavigate();
  const {
    userData, setUserData,
    wishlistItems, setWishlistItems, cartItems, setCartItems,
    showAuthModal, setShowAuthModal,
    authType, setAuthType,
    loadWishlistItems,
    categories
  } = useContext(UserContext);
  const [navItems, setNavItems] = useState(["Home"]);

  // Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Language Dropdown State
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const { t, language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null); //This is updated by vishnu for close search box when click outside


  useEffect(() => {
    if (language === "en") setSelectedLang("English");
    else if (language === "hi") setSelectedLang("हिन्दी");
    else if (language === "te") setSelectedLang("తెలుగు");
  }, [language]);
  // This is updated by vishnu for close search box when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Auth Form State
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    fullName: '',
    mobile: '',
    confirmPassword: '',
    doorNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });

  const handleAuthChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!authData.mobile || !authData.password) {
      showToast("Please enter both mobile number and password.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("MobileNo", authData.mobile);
    formData.append("Password", authData.password);

    fetch(`${baseUrl}/api/Products/Login`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const apiUser = data[0];

          // Strict Validation Rules:
          // 1. Valid Id (not 0, not null, not undefined)
          // 2. Valid MobileNo
          // 3. Valid Token (Token or AdminToken)
          // 4. Valid RoleId
          const isValidId = apiUser.Id && apiUser.Id !== 0 && apiUser.Id !== "0";
          const hasMobile = apiUser.MobileNo && apiUser.MobileNo.toString().trim() !== "";
          const hasToken = apiUser.Token || apiUser.AdminToken;
          const hasRole = apiUser.RoleId !== undefined && apiUser.RoleId !== null;

          if (isValidId && hasMobile && hasToken && hasRole) {
            const user = {
              id: apiUser.Id,
              Id: apiUser.Id,
              UserId: apiUser.Id,
              name: apiUser.FarmerName || apiUser.Name,
              FarmerName: apiUser.FarmerName || apiUser.Name,
              mobile: apiUser.MobileNo,
              MobileNo: apiUser.MobileNo,
              email: apiUser.Email,
              address: apiUser.Address,
              token: apiUser.Token || apiUser.AdminToken,
              isLoggedIn: true,
              roleId: apiUser.RoleId
            };

            setUserData(user);
            localStorage.setItem("yk_user", JSON.stringify(user));
            setShowAuthModal(false);
            showToast("Login successful");
            // Fetch wishlist items after successful login
            loadWishlistItems(user.id);
          } else {
            // Found record but invalid registration data (e.g. Id=0 or missing fields)
            showToast("User not registered. Please register first.", "error");
            setAuthType("signup"); // Redirect to Registration Page/View
          }
        } else {
          // No record found or empty response
          showToast("User not registered. Please register first.", "error");
          setAuthType("signup"); // Redirect to Registration Page/View
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast("Login failed. Please check your connection.", "error");
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    // Validations
    const mobileRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!authData.fullName || authData.fullName.trim().length === 0) {
      showToast("Please enter your full name.", "error");
      return;
    }

    if (!mobileRegex.test(authData.mobile)) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }

    if (!emailRegex.test(authData.email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (authData.password.length < 6) {
      showToast("Password must be at least 6 characters long.", "error");
      return;
    }

    if (authData.password !== authData.confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    const fullAddr = `${authData.doorNo || ''}, ${authData.street || ''}, ${authData.landmark ? `${authData.landmark}, ` : ''}${authData.city || ''}, ${authData.state || ''} - ${authData.pincode || ''}`;

    const registrationData = {
      User: {
        Id: 0,
        FarmerName: authData.fullName,
        MobileNo: authData.mobile,
        Password: authData.password,
        Email: authData.email,
        DeviceToken: "",
        Status: 1,
        LoginType: 0,
        FarmerImage: "",
        CreatedBy: "Web",
        ModifiedBy: "Web"
      },
      Addresses: [
        {
          HNo: authData.doorNo || "",
          Area: authData.street || "",
          Landmark: authData.landmark || "",
          City: authData.city || "",
          State: authData.state || "",
          Pincode: authData.pincode || "",
          Address: fullAddr, // POINT-TO-POINT COMPOSITE STRING
          Latitude: "0.0",
          Longitude: "0.0"
        }
      ]
    };

    fetch(`${baseUrl}/api/farmer/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registrationData),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Registration Server Error:", response.status, errorText);
          throw new Error(`Registration failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Registration Response:", data);
        if (data && (data.MSG === "SUCCESS" || data.MSG === "Success" || data.status === 1)) {
          showToast("Registration successful! Please login with your mobile number.");
          setAuthType("login");
        } else {
          showToast("Registration failed: " + (data.MSG || data.Message || "Unknown error"), "error");
        }
      })
      .catch((error) => {
        console.error("Registration Fetch Error:", error);
        showToast("Registration failed: " + error.message, "error");
      });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!authData.mobile || !authData.password) {
      showToast("Please enter mobile number and new password.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("MobileNo", authData.mobile);
    formData.append("Password", authData.password);

    fetch(`${baseUrl}/api/Products/Forgot_Password`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Forgot Password Response:", data);
        const result = Array.isArray(data) ? data[0] : data;

        // Success check (flexible based on API style)
        const resStr = JSON.stringify(result || {}).toUpperCase();
        const isSuccess =
          resStr.includes("SUCCESS") ||
          resStr.includes("UPDATED") ||
          result?.status === 1 ||
          result?.status === "1";

        if (isSuccess) {
          showToast("Password updated successfully!", "success");
          setAuthType("login");
        } else {
          const errMsg = result?.Message || result?.MSG || "Failed to update password. Please check your mobile number.";
          showToast(errMsg, "error");
        }
      })
      .catch((error) => {
        console.error("Forgot Password Error:", error);
        showToast("Error connecting to server.", "error");
      });
  };

  const handleLogout = (showMessage = true) => {
    setUserData({});
    localStorage.removeItem('yk_user');
    setCartItems([]);
    if (showMessage) showToast("Logged out successfully!");
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const handleDeleteAccount = async () => {
    const userId = userData.id || userData.UserId || userData.Id;
    if (!userId) {
      showToast("User session not found.", "error");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const formData = new FormData();
      formData.append("UserId", userId.toString());

      const response = await fetch(`${baseUrl}/api/Products/DeleteAccount`, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }

      const resStr = text.toUpperCase();
      const isSuccess =
        resStr.includes("SUCCESS") ||
        resStr.includes("DELETED") ||
        data === 1 ||
        data?.status === 1 ||
        data?.status === "1" ||
        data?.MSG === "SUCCESS";

      if (isSuccess) {
        showToast("User Account deleted successfully", "success");
        handleLogout(false);
      } else {
        const errMsg = data.Message || data.MSG || (typeof data === 'string' ? data : "Failed to delete account. Please try again later.");
        showToast(errMsg, "error");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast("An error occurred while deleting your account.", "error");
    }
  };



  useEffect(() => {
    const checkToast = () => {
      const toastData = localStorage.getItem('yk_toast');
      if (toastData) {
        try {
          const { message, type } = JSON.parse(toastData);
          showToast(message, type);
          localStorage.removeItem('yk_toast');
        } catch (e) {
          localStorage.removeItem('yk_toast');
        }
      }
    };

    checkToast();
    window.addEventListener('storage', checkToast);
    window.addEventListener('yk_trigger_toast', checkToast);

    return () => {
      window.removeEventListener('storage', checkToast);
      window.removeEventListener('yk_trigger_toast', checkToast);
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('yk_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserData(user);
      // Fetch wishlist items when restoring session
      if (user.id && user.isLoggedIn) {
        loadWishlistItems(user.id);
      }
    }
  }, [setUserData]);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const categoryNames = categories
        .filter(item => item.name !== "YK Harvest")
        .map((item) => item.name);
      setNavItems(["Home", ...categoryNames]);
    }
  }, [categories]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const formData = new FormData();
        // Using 'productName' as per the user's curl command
        // but providing a robust JSON object for the filter.
        formData.append('productName', JSON.stringify([{ productname: query }]));

        const response = await fetch(`${baseUrl}/api/Products/GetAll_SearchingProducts`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();

        if (Array.isArray(data)) {
          // Fallback: If API still returns everything, filter locally to satisfy user requirement
          const filtered = data.filter(p =>
            p.productname.toLowerCase().includes(query.toLowerCase()) ||
            (p.CategoryName && p.CategoryName.toLowerCase().includes(query.toLowerCase()))
          );
          setSearchResults(filtered);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(query.trim().length > 0);
    }
  };
  // This is old code before update by vishnu
  // const handleSearchResultClick = (product) => {
  //   setShowSearchResults(false);
  //   setSearchQuery("");
  //   // navigate(`/product/${product.productname.replace(/\s+/g, '-')}`);
  //   navigate(`/product/${product.productname.replace(/\s+/g, '-')}`, { state: { productName: product.productname } });
  // };
  // This is latest code wrote by vishnu
  const handleSearchResultClick = (product) => {
    setShowSearchResults(false);
    setSearchQuery("");

    const cleanName = product.productname
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-")     // spaces to hyphens
      .toLowerCase();

    navigate(`/product/${cleanName}`, {
      state: { productName: product.productname }
    });
  };
  // End of vishnu code

  // Toggles
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Auth Handlers
  const openLogin = (e) => {
    if (e) e.preventDefault();
    setAuthType("login");
    setShowAuthModal(true);
    closeMobileMenu();
  };

  const openSignup = (e) => {
    if (e) e.preventDefault();
    setAuthType("signup");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setShowPassword(false);
  };

  return (
    <header className="header-wrapper">
      {/* --- TOP SECTION: Logo, Search, Actions --- */}
      <div className="header-top">
        <div className="container header-flex">

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <div className="logo-section">
            <Link to="/">
              <img src={Logo} alt="YK Mart" />
            </Link>
          </div>

          {/* Desktop Search Bar */}
          {/* <div className="search-section desktop-search" style={{ position: 'relative' }}> */}  {/*This is before updated by vishnu for close search box when click outside*/}
          <div className="search-section desktop-search" style={{ position: 'relative' }} ref={searchRef}> {/*This is After updated by vishnu for close search box when click outside*/}

            <input
              type="text"
              placeholder={t("searchProducts")}
              className="search-input"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.trim().length > 1 && setShowSearchResults(true)}
            />
            <button className="search-btn">
              <FiSearch color="white" size={20} />
            </button>

            {/* Desktop Search Results Dropdown */}
            {showSearchResults && (
              <div className="search-results-dropdown">
                {isSearching ? (
                  <div className="search-status">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.Productid}
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(product)}
                    >
                      <img
                        src={baseUrl + product.Image}
                        alt={product.productname}
                        className="search-result-image"
                        onError={(e) => { e.target.src = Logo; }}
                      />
                      <div className="search-result-info">
                        <span className="search-result-name">{product.productname}</span>
                        <span className="search-result-category">{product.CategoryName}</span>
                      </div>
                    </div>
                  ))
                ) : searchQuery.trim().length > 1 ? (
                  <div className="search-status">No products found</div>
                ) : null}
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="actions-section">

            {/* Language Dropdown (Desktop) */}
            <div
              className={`language-dropdown desktop-only ${langOpen ? 'active' : ''}`}
              onClick={() => setLangOpen(!langOpen)}
            >
              <div className="lang-selected">
                <span className="lang-name">{selectedLang}</span>
                <FiChevronDown size={16} />
              </div>
              <div className="lang-menu-list">
                <div className="lang-option" onClick={() => setLanguage("en")}>English</div>
                <div className="lang-option" onClick={() => setLanguage("hi")}>Hindi</div>
                <div className="lang-option" onClick={() => setLanguage("te")}>Telugu</div>
              </div>
            </div>

            {/* Mobile Search Toggle */}
            <button className="mobile-search-toggle" onClick={toggleSearch}>
              <FiSearch size={20} />
            </button>

            {/* Desktop Only Links */}
            <Link to="/harvest" className="action-item desktop-only">
              <img src={harvestlogo} alt="" className="harvest-logo" style={{ width: "40px", height: "40px" }} />
              {/* <CiWheat className="icon" /> */}
              <span>{t("ykHarvest")}</span>
            </Link>

            <Link to="/track" className="action-item desktop-only">
              <FiBox className="icon" />
              <span>{t("trackOrder")}</span>
            </Link>

            {/* Wishlist */}
            <Link to="/Wishlist" className="action-item wishlist-link">
              <FiHeart className="icon" />
              <span className="desktop-only">{t("wishlist")}</span>
              {wishlistItems.length > 0 && (
                <span className="badge">{wishlistItems.length}</span>
              )}
            </Link>

            {/* User Action (Login or Profile) */}
            {userData.isLoggedIn ? (
              <div className="user-profile-menu">
                <div className="action-item desktop-only">
                  <FiUser className="icon" />
                  <span>{userData.name ? userData.name.split(' ')[0] : 'User'}</span>
                  <FiChevronDown size={14} style={{ marginLeft: '4px' }} />
                </div>
                <div className="user-dropdown-list">
                  <Link to="/orders" className="dropdown-item">
                    <FiShoppingCart size={16} />
                    My Orders
                  </Link>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <FiX size={16} />
                    Logout
                  </div>
                  <div className="dropdown-item text-danger" onClick={handleDeleteAccount} style={{ color: '#dc3545' }}>
                    <FiTrash2 size={16} />
                    Delete Account
                  </div>
                </div>
              </div>
            ) : (
              <div className="action-item desktop-only" onClick={openLogin} style={{ cursor: 'pointer' }}>
                <FiUser className="icon" />
                <span>{t("login")}</span>
              </div>
            )}

            {/* Cart Button */}
            <Link to="/Cart" className="cart-btn">
              <FiShoppingCart size={18} />
              <span className="desktop-only">{t("cart")}</span>
              {cartItems.length > 0 && (
                <span className="cart-badge">{cartItems.length}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`mobile-search ${searchOpen ? 'open' : ''}`}>
          <div className="search-section" style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={t("searchProducts")}
              className="search-input"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button className="search-btn">
              <FiSearch color="white" size={20} />
            </button>

            {/* Mobile Search Results Dropdown */}
            {showSearchResults && searchQuery.trim().length > 1 && (
              <div className="search-results-dropdown mobile-results">
                {isSearching ? (
                  <div className="search-status">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <div
                      key={product.Productid}
                      className="search-result-item"
                      onClick={() => {
                        handleSearchResultClick(product);
                        setSearchOpen(false);
                      }}
                    >
                      <img
                        src={baseUrl + product.Image}
                        alt={product.productname}
                        className="search-result-image"
                        onError={(e) => { e.target.src = Logo; }}
                      />
                      <div className="search-result-info">
                        <span className="search-result-name">{product.productname}</span>
                        <span className="search-result-category">{product.CategoryName}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-status">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Navigation --- */}
      <nav className="header-bottom">
        {/* Desktop Marquee */}
        <div className="marquee-container desktop-nav">
          <ul className="nav-list marquee-content">
            {navItems.map((item, index) => (
              <li key={`first-${index}`} className={`nav-item ${item === 'Home' ? 'active' : ''}`}>
                <Link to={item === "Home" ? "/" : `/category/${item.replace(/\s+/g, '-')}`} className="nav-link">
                  {item}
                </Link>
              </li>
            ))}
            {/* {navItems.map((item, index) => (
              <li key={`second-${index}`} className={`nav-item ${item === 'Home' ? 'active' : ''}`}>
                <Link to={item === "Home" ? "/" : `/category/${item.replace(/\s+/g, '-')}`} className="nav-link">
                  {item}
                </Link>
              </li>
            ))} */}
          </ul>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="mobile-nav-list">
            {navItems.map((item, index) => (
              <li key={index} className="mobile-nav-item">
                <Link
                  to={item === "Home" ? "/" : `/category/${item.replace(/\s+/g, '-')}`}
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  {item}
                </Link>
              </li>
            ))}
            <li className="mobile-nav-divider"></li>
            <li className="mobile-nav-item">
              <Link to="/harvest" className="mobile-nav-link" onClick={closeMobileMenu}>
                <CiWheat className="icon" />
                {t("ykHarvest")}
              </Link>
            </li>
            <li className="mobile-nav-item">
              <Link to="/track" className="mobile-nav-link" onClick={closeMobileMenu}>
                <FiBox className="icon" />
                {t("trackOrder")}
              </Link>
            </li>
            {/* Mobile Login/Logout Link */}
            <li className="mobile-nav-item">
              {userData.isLoggedIn ? (
                <>
                  <Link to="/orders" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <FiShoppingCart className="icon" />
                    My Orders
                  </Link>
                  <div className="mobile-nav-link" onClick={() => { handleLogout(); closeMobileMenu(); }}>
                    <FiX className="icon" />
                    Logout
                  </div>
                  <div className="mobile-nav-link text-danger" onClick={() => { handleDeleteAccount(); closeMobileMenu(); }} style={{ color: '#dc3545' }}>
                    <FiTrash2 className="icon" />
                    Delete Account
                  </div>
                </>
              ) : (
                <div className="mobile-nav-link" onClick={openLogin}>
                  <FiUser className="icon" />
                  {t("login")}
                </div>
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && <div className="mobile-overlay" onClick={closeMobileMenu}></div>}

      {/* --- MODALS (Login & Signup) --- */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') closeAuthModal();
        }}>
          {/* login and registraion start */}
          <div className="modal-container modelwidth redesigned-modal">
            <div className="leftside">
              <div className="leftsideshadow"></div>
              {/* left side content */}
              <div className="leftside-content">
                <h2>YKMART</h2>
                <p className="smallcontent">Purchase Pure Organic YK Products</p>
                <div className="logoimage">
                  <img src={Logo} alt="YK Mart Modal Logo" />
                </div>
                <div className="lefthightlights">
                  <div className="highlightcontent">
                    <FaCertificate className="certificate-icon" />
                    <div>
                      <p>Sustainable Growth Through Organic Manure</p>
                      <p>We deliver high-quality organic manure that enhances crop productivity while ensuring environmental safety and pollinator protection.</p>
                    </div>
                  </div>
                  {/* <div className="highlightcontent">
                    <FaLeaf className="leaf-icon" />
                    <div>
                      <p>Harvesting</p>
                      <p>I provide professional harvesting services an supply crops in bulk.</p>
                    </div>
                  </div> */}
                  <div className="highlightcontent">
                    <FaCertificate className="certificate-icon" />
                    {/* <FaWallet className="wallet-icon" /> */}
                    <div>
                      <p>Certified Organic Protection & Farm Produce</p>
                      <p>YK Mart delivers certified organic botanical virucides, fungicides, and insecticides formulated from medicinal plants to control bacterial and fungal growth naturally. Alongside crop protection, we also farm and supply organic turmeric, chilli, papaya, and millets.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="rightside auth-rightside">
              <button className="modal-close-btn" onClick={closeAuthModal}>
                <FiX />
              </button>
              {/* LOGIN FORM */}
              {authType === "login" && (
                <>
                  <h2 className="modal-title">Welcome back</h2>
                  <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="Enter Mobile Number"
                        className="form-input"
                        value={authData.mobile}
                        onChange={handleAuthChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="form-input"
                        value={authData.password}
                        onChange={handleAuthChange}
                        required
                      />
                      <div
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </div>

                      <div className="form-footer">
                        <label className="checkbox-group">
                          <input type="checkbox" /> Remember me
                        </label>
                        <span
                          className="forgot-link"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setAuthType("forgot")}
                        >
                          Forgot password?
                        </span>
                      </div>
                    </div>

                    <button type="submit" className="auth-btn">Sign in</button>
                  </form>

                  <p className="switch-auth">
                    Don't have an account?
                    <span onClick={openSignup}>Sign up now.</span>
                  </p>

                  <p className="version-info">
                    r19-n22-15-v12
                  </p>

                </>
              )}
              {/* FORGOT PASSWORD FORM */}
              {authType === "forgot" && (
                <>
                  <h2 className="modal-title">Reset Password</h2>
                  <p className="text-muted small mb-4">Enter your mobile number and a new password to reset.</p>
                  <form onSubmit={handleForgotPassword} className="auth-form">
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="Enter Mobile Number"
                        className="form-input"
                        value={authData.mobile}
                        onChange={handleAuthChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter New Password"
                        className="form-input"
                        value={authData.password}
                        onChange={handleAuthChange}
                        required
                      />
                      <div
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </div>
                    </div>

                    <button type="submit" className="auth-btn">Update Password</button>
                  </form>

                  <p className="switch-auth">
                    Remembered password?
                    <span onClick={() => setAuthType("login")}>Back to Login.</span>
                  </p>
                </>
              )}
              {/* SIGNUP FORM */}
              {authType === "signup" && (
                <>
                  <div className="signup-header">
                    <h2 className="modal-title">Create your account</h2>
                    <form onSubmit={handleSignup} className="auth-form">
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="John Doe"
                          className="form-input"
                          value={authData.fullName}
                          onChange={handleAuthChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input
                          type="tel"
                          name="mobile"
                          placeholder="9876543210"
                          className="form-input"
                          value={authData.mobile}
                          onChange={handleAuthChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="you@example.com"
                          className="form-input"
                          value={authData.email}
                          onChange={handleAuthChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Door No/House No</label>
                        <input type="text" name="doorNo" placeholder="H.No 123" className="form-input" value={authData.doorNo || ''} onChange={handleAuthChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Area/Street</label>
                        <input type="text" name="street" placeholder="Street Name" className="form-input" value={authData.street || ''} onChange={handleAuthChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Landmark</label>
                        <input type="text" name="landmark" placeholder="Near Hospital" className="form-input" value={authData.landmark || ''} onChange={handleAuthChange} />
                      </div>
                      <div className="form-row">
                        <div className="form-group flex-1">
                          <label className="form-label">City</label>
                          <input type="text" name="city" placeholder="City" className="form-input" value={authData.city || ''} onChange={handleAuthChange} />
                        </div>
                        <div className="form-group flex-1">
                          <label className="form-label">State</label>
                          <input type="text" name="state" placeholder="State" className="form-input" value={authData.state || ''} onChange={handleAuthChange} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode</label>
                        <input type="text" name="pincode" placeholder="Pincode" className="form-input" value={authData.pincode || ''} onChange={handleAuthChange} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          className="form-input"
                          value={authData.password}
                          onChange={handleAuthChange}
                          required
                        />
                        <div
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          className="form-input"
                          value={authData.confirmPassword}
                          onChange={handleAuthChange}
                          required
                        />
                        <div
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </div>
                      </div>

                      <button type="submit" className="auth-btn crtbtn">Sign Up</button>
                    </form>

                    <p className="switch-auth">
                      Already have an account?
                      <span onClick={openLogin}>Sign in.</span>
                    </p>
                  </div>
                </>

              )}
            </div>
          </div>
          {/* login and registraion end */}
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

    </header>
  );
};

export default Header;