import { useContext } from "react";
import { UserContext } from "../Controllers/UserContext";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import fungal1 from "../assets/products/fungal_1.jpg";
import "./Wishlist.css";
import Variables from '../Variables.json'
import Breadcrumb from '../Components/Breadcrumb';

const baseUrl = Variables.baseUrl;

export default function Wishlist() {
    const { setWishlistItems, setCartItems, wishlistItems, cartItems, removeFromWishlist } = useContext(UserContext);

    // Helper function to parse price
    const parsePrice = (price) => {
        if (!price) return 0;
        return parseFloat(price) || 0;
    };

    const addToCart = (product) => {
        const exists = cartItems.some(item => item.Productid === product.Productid);
        if (!exists) {
            setCartItems(prevItems => [...prevItems, {
                ...product,
                quantity: 1,
                selectedPack: 'Pack1'
            }]);
        }
        // Optionally remove from wishlist after adding to cart
        // removeFromWishlist(product.Productid);
    };

    const moveAllToCart = () => {
        wishlistItems.forEach(product => {
            const exists = cartItems.some(item => item.Productid === product.Productid);
            if (!exists) {
                setCartItems(prevItems => [...prevItems, {
                    ...product,
                    quantity: 1,
                    selectedPack: 'Pack1'
                }]);
            }
        });
        // Optionally clear wishlist after moving all
        // setWishlistItems([]);
    };

    return (
        <div className="container mt-2">        
            <Breadcrumb />
            <div className="wishlist-container">
            <div className="wishlist-header">
                <h1 className="wishlist-title">Wishlist</h1>
                {wishlistItems.length > 0 && (
                    <button className="move-all-btn" onClick={moveAllToCart}>
                        Move all to cart
                    </button>
                )}
            </div>

            {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                    <FiHeart size={64} />
                    <p>Your wishlist is empty</p>
                    <p className="empty-subtitle">Save items you love for later</p>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlistItems.map((product) => {
                        const currentPrice = parsePrice(product.Price1 || product.Price);
                        const originalPrice = parsePrice(product.Price3 || product.MRP);

                        return (
                            <div key={product.Productid} className="wishlist-card">
                                <img
                                    src={baseUrl + product.Image}
                                    alt={product.productname}
                                    className="wishlist-image"
                                    onError={(e) => { e.target.src = fungal1; }}
                                />
                                <div className="wishlist-info">
                                    <h3 className="wishlist-product-name">{product.productname}</h3>

                                    <div className="wishlist-price">
                                        {originalPrice > 0 && originalPrice > currentPrice && (
                                            <span className="wishlist-original-price">₹{originalPrice.toFixed(2)}</span>
                                        )}
                                        <span className="wishlist-current-price">₹{currentPrice.toFixed(2)}</span>
                                    </div>

                                    <div className="wishlist-actions">
                                        <button
                                            className="wishlist-add-cart-btn"
                                            onClick={() => addToCart(product)}
                                        >
                                            <FiShoppingCart size={18} /> Add to Cart
                                        </button>
                                        <button
                                            className="wishlist-remove-btn"
                                            onClick={() => removeFromWishlist(product.Productid)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>
        </div>
    );
}