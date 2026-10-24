import { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../Controllers/UserContext";
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import fungal1 from "../assets/products/fungal_1.jpg";
import "./Cart.css";
import Variables from '../Variables.json'
import { useLanguage } from "../Controllers/LanguageContext";
import Breadcrumb from '../Components/Breadcrumb';

const baseUrl = Variables.baseUrl;

export default function Cart() {
    // 1. Get userData to prefill payment form
    const {
        setWishlistItems, setCartItems, wishlistItems, cartItems, userData,
        setShowAuthModal, setAuthType, addToWishlist
    } = useContext(UserContext);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        fetchRelatedProducts();
    }, []);

    // --- RAZORPAY HELPERS START ---

    // Function to load Razorpay script dynamically
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    // The Main Payment Handler
    // Updated to redirect to Checkout Page
    const handleProceedToCheckout = () => {
        if (!userData.isLoggedIn) {
            setAuthType("login");
            setShowAuthModal(true);
            return;
        }
        navigate('/checkout');
    };
    // --- RAZORPAY HELPERS END ---


    const fetchRelatedProducts = () => {

    };

    // Helper function to parse price
    const parsePrice = (price) => {
        if (!price) return 0;
        return parseFloat(price) || 0;
    };

    // Get the selected price for an item
    const getItemPrice = (item) => {
        // Default to Price1 if no specific pack is selected
        const selectedPack = item.selectedPack || 'Pack1';
        const priceKey = selectedPack.replace('Pack', 'Price');
        return parsePrice(item[priceKey]);
    };

    // Get the selected pack name
    const getPackName = (item) => {
        const selectedPack = item.selectedPack || 'Pack1';
        return item[selectedPack] || item.Pack1 || '';
    };

    // Get original price (Price3 for comparison)
    const getOriginalPrice = (item) => {
        return parsePrice(item.Price3);
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.Productid === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.Productid !== productId));
    };

    const saveToWishlist = (product) => {
        addToWishlist(product);
        // Remove from cart
        removeFromCart(product.Productid);
    };

    const addToCart = (product) => {
        const exists = cartItems.some(item => item.Productid === product.Productid);
        if (!exists) {
            setCartItems(prevItems => [...prevItems, {
                ...product,
                quantity: 1,
                selectedPack: 'Pack1' // Default to first pack
            }]);
        }
    };

    // const toggleWishlist = (product) => {
    //     addToWishlist(product);
    // };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.Productid === productId);
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
        const price = getItemPrice(item);
        return sum + (price * (item.quantity || 1));
    }, 0);
    const delivery = 0.00;

    return (
        <div className="container mt-2">
            <Breadcrumb />
            {(location.state?.fromHarvest || cartItems.some(item => item.CategoryId === 38 || item.CategoryId === "38" || item.CategoryName === "YK Harvest")) && (
                    <button
                        className="back-btn-harvest"
                        onClick={() => navigate('/harvest')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            backgroundColor: '#1f5134',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginBottom: '15px',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            width: 'fit-content'
                        }}
                    >
                        <FiArrowLeft size={18} /> Back to Harvest
                    </button>
                )}
                <div className="cart-content">
                    <div className="cart-left">
                        <h1 className="cart-title">Your Cart</h1>

                        {cartItems.length === 0 ? (
                            <div className="empty-cart">
                                <FiShoppingCart size={64} />
                                <p>Your cart is empty</p>
                                <button
                                    className="continue-shopping"
                                    onClick={() => navigate("/")}
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <>
                                {cartItems.map((item) => {
                                    const currentPrice = getItemPrice(item);
                                    const originalPrice = getOriginalPrice(item);
                                    const packName = getPackName(item);
                                    const lineTotal = currentPrice * (item.quantity || 1);

                                    return (
                                        <div key={item.Productid} className="cart-item">
                                            <img
                                                src={baseUrl + item.Image}
                                                alt={item.productname}
                                                className="cart-item-image"
                                                onError={(e) => { e.target.src = fungal1; }}
                                            />
                                            <div className="cart-item-details">
                                                <div className="cart-item-header">
                                                    <h3 className="cart-item-title">{item.productname}</h3>
                                                    <button
                                                        onClick={() => saveToWishlist(item)}
                                                        className="wishlist-btn-top"
                                                    >
                                                        <FiHeart size={18} /> Save to wishlist
                                                    </button>
                                                </div>
                                                <p className="cart-item-category">{item.CategoryName || "Organic Manure"}</p>
                                                {packName && (
                                                    <p className="cart-item-pack">Pack Size: {packName}</p>
                                                )}
                                                {/* <p className="cart-item-description">
                                                High-quality organic product formulated for consistent performance. Suitable for small and large farms, delivers reliable results with a focus on sustainability and ease-of-use.
                                            </p> */}

                                                <div className="cart-item-actions">
                                                    <div className="quantity-and-remove">
                                                        <div className="quantity-control">
                                                            <button
                                                                onClick={() => updateQuantity(item.Productid, (item.quantity || 1) - 1)}
                                                                className="qty-btn"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="qty-display">{item.quantity || 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.Productid, (item.quantity || 1) + 1)}
                                                                className="qty-btn"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.Productid)}
                                                            className="remove-btn-inline"
                                                        >
                                                            <FiTrash2 size={16} /> Remove
                                                        </button>
                                                    </div>

                                                    <div className="cart-item-price-section">
                                                        {originalPrice > 0 && originalPrice > currentPrice && (
                                                            <span className="original-price">₹{originalPrice.toFixed(2)}</span>
                                                        )}
                                                        <span className="current-price">₹{currentPrice.toFixed(2)}</span>
                                                        <span className="line-total">Line: ₹{lineTotal.toFixed(2)}</span>
                                                    </div>
                                                </div>


                                            </div>
                                        </div>
                                    );
                                })}

                                {/* You may also like section */}
                                <div className="related-products-section">
                                    <h2 className="related-title">You may also like</h2>
                                    <div className="related-products-grid">
                                        {relatedProducts.map((product) => {
                                            const currentPrice = parsePrice(product.Price1);
                                            const originalPrice = parsePrice(product.Price3);

                                            return (
                                                <div key={product.Productid} className="related-product-card">
                                                    {product.discount > 0 && (
                                                        <span className="discount-badge">-{product.discount}%</span>
                                                    )}
                                                    <button
                                                        onClick={() => addToWishlist(product)}
                                                        className={`wishlist-icon ${isInWishlist(product.Productid) ? 'active' : ''}`}
                                                    >
                                                        <FiHeart size={20} />
                                                    </button>
                                                    <img
                                                        src={baseUrl + product.Image}
                                                        alt={product.productname}
                                                        className="related-product-image"
                                                        onError={(e) => { e.target.src = fungal1; }}
                                                    />
                                                    <div className="related-product-info">
                                                        <h4 className="related-product-name">{product.productname}</h4>
                                                        <div className="related-product-price">
                                                            {originalPrice > 0 && originalPrice > currentPrice && (
                                                                <span className="related-original-price">₹{originalPrice.toFixed(2)}</span>
                                                            )}
                                                            <span className="related-current-price">₹{currentPrice.toFixed(2)}</span>
                                                        </div>
                                                        {product.Pack1 && <span className="related-unit">{product.Pack1}</span>}
                                                        <button
                                                            onClick={() => addToCart(product)}
                                                            className="add-to-cart-btn"
                                                        >
                                                            <FiShoppingCart size={16} /> {t("addToCart")}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className="cart-right">
                            <div className="order-summary">
                                <h2 className="summary-title">Order Summary</h2>
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span className="summary-value">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery</span>
                                    <span className="summary-value">₹{delivery.toFixed(2)}</span>
                                </div>
                                <div className="summary-divider"></div>

                                {/* Updated Check Out Button */}
                                <button
                                    className="checkout-btn"
                                    onClick={handleProceedToCheckout}
                                >
                                    Confirm & Proceed
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
}