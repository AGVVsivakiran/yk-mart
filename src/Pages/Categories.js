import React, { useState, useEffect, useContext } from 'react';
import './Categories.css';
import { FiHeart } from "react-icons/fi";
import Variables from '../Variables.json'
import fungal1 from "../assets/products/fungal_1.jpg";
import { UserContext } from '../Controllers/UserContext';
// 1. Import useParams to read the URL
import { useParams } from 'react-router-dom';
import { useLanguage } from '../Controllers/LanguageContext';
import Breadcrumb from '../Components/Breadcrumb';

import { useNavigate } from 'react-router-dom';

const baseUrl = Variables.baseUrl;

export default function Categories() {

  const { 
    setWishlistItems, setCartItems, wishlistItems, cartItems, addToWishlist, categories,
    globalCategoryProducts: categoryProducts, 
    loadingProductsGlobal: loadingProducts, 
    fetchProductsForCategoryGlobal: fetchProductsForCategory 
  } = useContext(UserContext);

  const { t, language, setLanguage } = useLanguage();

  const navigate = useNavigate();

  // 2. Get the categoryName from the URL parameters
  const { categoryName } = useParams();


  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.Productid === productId);
  };

  const handleAddToCart = (product) => {
    const exists = cartItems.some(item => item.Productid === product.Productid);
    if (!exists) {
      setCartItems(prevItems => [...prevItems, {
        ...product,
        quantity: 1,
        selectedPack: 'Pack1'
      }]);
    }
  };

  const parsePrice = (price) => {
    if (!price) return 0;
    return parseFloat(price) || 0;
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    const original = parsePrice(originalPrice);
    const current = parsePrice(currentPrice);
    if (original > 0 && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return 0;
  };

  // const handleGotoProduct = (item) => {
  //   debugger
  //   navigate('/product/' + item.replace(/\s+/g, '_'))
  // }

  // This is before update by vishnu code 
  // const handleGotoProduct = (product, categoryName) => {
  //   // Standardizing the URL slug to use hyphens instead of underscores, matching Header and Home
  //   const safeItem = product.productname.replace(/\s+/g, "-");
  //   navigate(`/product/${safeItem}`, { state: { productName: product.productname, categoryName: categoryName } });
  // };
// Updated handleGotoProduct function by vishnu after updatd 
const handleGotoProduct = (product) => {
  const slug = 
    product.productname
      .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-")     // spaces to hyphens
    .toLowerCase();
  

  navigate(`/product/${slug}`, {
    state: { productName: product.productname }
  });
};

  // 3. Filter Categories Logic
  // If categoryName exists in URL, filter for exact match. Otherwise, show all.
  const filteredCategories = categoryName
    ? categories.filter(cat => cat.name.replace(/\s+/g, '-') === categoryName)
    : categories;

  return (
    <div className='container mt-2'>
      <Breadcrumb categoryName={categoryName} />
      {/* Dynamic Category Products Sections */}
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category.id}>
              <div className="title-section">
                <h2>{category.name}</h2>
              </div>

              {loadingProducts[category.id] ? (
                <div className="loading-products">
                  <p>Loading {category.name} products...</p>
                </div>
              ) : categoryProducts[category.id] && categoryProducts[category.id].length > 0 ? (
                <div className="productcard">
                  {categoryProducts[category.id].map((product, index) => {
                    const currentPrice = parsePrice(product.Price1);
                    const originalPrice = parsePrice(product.Price3);
                    const discount = calculateDiscount(originalPrice, currentPrice);

                    return (
                      <div key={product.Productid || index} className="product-card" onClick={() => handleGotoProduct(product, category.name)}>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToWishlist(product);
                          }}
                          className={`wishlist-icon ${isInWishlist(product.Productid) ? 'active' : ''}`}
                        >
                          <FiHeart size={20} />
                        </button>
                        <img
                          src={baseUrl + product.Image}
                          alt={product.productname}
                          className="product-image"
                          onError={(e) => {
                            e.target.src = fungal1;
                          }}
                        />
                        <div className="product-info">
                          <h4 className="product-name">{product.productname}</h4>
                          <div className="product-price">

                            <span className="current-price">₹{currentPrice.toFixed(2)}</span>
                          </div>
                          {product.Pack1 && <span className="product-unit">{product.Pack1}</span>}
                          <button
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(product)}
                          >
                            {t('addToCart')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-products">
                  <p>No products available in {category.name}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="loading-text">Loading categories...</p>
        )}
    </div>
  );
}