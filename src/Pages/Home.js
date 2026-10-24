import React, { useState, useEffect, useContext, useRef } from 'react';
import './Home.css';
import { FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import Variables from '../Variables.json'
import img1 from '../BannerImages/slide1.jpg';
import img2 from '../BannerImages/slide2.jpg';
import img3 from '../BannerImages/slide3.jpg';
import img4 from '../BannerImages/slide4.jpg';
import banner1 from '../BannerImages/new/banner1.jpeg';
import banner2 from '../BannerImages/new/banner2.jpeg';
import banner3 from '../BannerImages/new/banner3.jpeg';
import banner4 from '../BannerImages/new/banner4.jpeg';
import banner5 from '../BannerImages/new/banner5.jpeg';
import banner6 from '../BannerImages/new/banner6.jpeg';
import banner7 from '../BannerImages/new/banner7.jpeg';
import fungal1 from "../assets/products/fungal_1.jpg";
import swan from "../BannerImages/new/swan.mp4";

import { UserContext } from '../Controllers/UserContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../Controllers/LanguageContext';

const bannerItems = [
  { type: 'video', src: swan, duration: 30000, height: "100vh" },
  { type: 'image', src: banner3, duration: 1000 },
  { type: 'image', src: img1, duration: 1000 },
  { type: 'image', src: banner1, duration: 1000 },
  { type: 'image', src: img3, duration: 1000 },
  { type: 'image', src: banner6, duration: 1000 },
];
const baseUrl = Variables.baseUrl;

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { 
    setWishlistItems, setCartItems, wishlistItems, cartItems, addToWishlist, categories: globalCategories,
    globalCategoryProducts: categoryProducts,
    loadingProductsGlobal: loadingProducts,
    fetchProductsForCategoryGlobal: fetchProductsForCategory
  } = useContext(UserContext);

  const categories = globalCategories.filter(item => item.name !== "YK Harvest");

  const { t } = useLanguage();
  const scrollRefs = useRef({});
  const [scrollPositions, setScrollPositions] = useState({});

  const updateScrollButtons = (categoryId) => {
    const container = scrollRefs.current[categoryId];
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setScrollPositions(prev => ({
        ...prev,
        [categoryId]: {
          canScrollLeft: scrollLeft > 5,
          canScrollRight: scrollLeft + clientWidth < scrollWidth - 5
        }
      }));
    }
  };

  const handleScroll = (categoryId, direction) => {
    const container = scrollRefs.current[categoryId];
    if (container) {
      // Get the first card to calculate its width plus the gap
      const card = container.querySelector('.product-card');
      const scrollAmount = card ? card.offsetWidth + 15 : 270;

      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // Small timeout to update buttons after scroll completes
      setTimeout(() => updateScrollButtons(categoryId), 500);
    }
  };

  useEffect(() => {
    // Initial check for all sliders
    Object.keys(categoryProducts).forEach(id => {
      updateScrollButtons(id);
    });
  }, [categoryProducts]);

  const navigate = useNavigate();


  // Auto-slide logic
  useEffect(() => {
    const currentItem = bannerItems[currentSlide];
    const timer = setTimeout(() => {
      nextSlide();
    }, currentItem.duration);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === bannerItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? bannerItems.length - 1 : prev - 1));
  };

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
  //  navigate('product/' + item.replace(/\s+/g, '-'))
  //  }
  //Vishnu wrote this code of 

  const handleGotoProduct = (item) => {
    const cleanName = item
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-")     // spaces to hyphens
      .toLowerCase();
    navigate(`/product/${cleanName}`, { state: { productName: item } });
  }
  // const handleGotoProduct = (item) => {
  //  navigate('product/' + item.replace(/\s+/g, '-'))
  //  }
  //Vishnu wrote this code of 

  // const handleGotoProduct = (item) => {
  //  const safeItem = encodeURIComponent(item.replace(/\s+/g, "_"));
  // navigate(`/product/${safeItem}`);
  //};

  return (
    <div className='home-container'>
      {/* Banner Slider Section */}
      <div className="banner-slider" style={{ height: bannerItems[currentSlide].height || '400px' }}>
        <button className="slider-arrow left" onClick={prevSlide}>
          <FiChevronLeft size={24} />
        </button>

        <div className="slider-wrapper">
          {bannerItems.map((item, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
            >
              {index === currentSlide && (
                item.type === 'video' ? (
                  <video
                    key={index}
                    src={item.src}
                    className="slide-image"
                    autoPlay
                    muted
                    loop={false}
                    playsInline
                    preload="auto"
                    onEnded={nextSlide}
                    style={{ height: item.height || '100vh', objectFit: 'cover', }}
                  />
                ) : (
                  <img src={item.src} alt={`Banner ${index + 1}`} className="slide-image" />
                )
              )}
            </div>
          ))}
        </div>

        <button className="slider-arrow right" onClick={nextSlide}>
          <FiChevronRight size={24} />
        </button>

        <div className="slider-dots">
          {bannerItems.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* Dynamic Category Products Sections */}
      <div className='container' style={{ zoom: '.9', }}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category.id}>
              <div className="title-section">
                <h2>{category.name}</h2>
                <p onClick={() => navigate(`/category/${category.name.replace(/\s+/g, '-')}`)}>See all</p>
              </div>

              {loadingProducts[category.id] ? (
                <div className="loading-products">
                  <p>Loading {category.name} products...</p>
                </div>
              ) : categoryProducts[category.id] && categoryProducts[category.id].length > 0 ? (
                <div
                  className="slider-parent-container"
                  style={{ position: 'relative', margin: '0 3.5rem' }}
                  onMouseEnter={() => updateScrollButtons(category.id)}
                >
                  {categoryProducts[category.id] && categoryProducts[category.id].length > 0 && (
                    <>
                      {scrollPositions[category.id]?.canScrollLeft && (
                        <button
                          className="slider-arrow left"
                          onClick={() => handleScroll(category.id, 'left')}
                          style={{
                            left: '-25px',
                            zIndex: 10,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: '1px solid #eee'
                          }}
                        >
                          <FiChevronLeft size={24} />
                        </button>
                      )}
                      {scrollPositions[category.id]?.canScrollRight !== false && categoryProducts[category.id].length >= 4 && (
                        <button
                          className="slider-arrow right"
                          onClick={() => handleScroll(category.id, 'right')}
                          style={{
                            right: '-25px',
                            zIndex: 10,
                            backgroundColor: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: '1px solid #eee'
                          }}
                        >
                          <FiChevronRight size={24} />
                        </button>
                      )}
                    </>
                  )}
                  <div
                    className="productcard"
                    ref={el => scrollRefs.current[category.id] = el}
                    onScroll={() => updateScrollButtons(category.id)}
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      overflowX: 'auto',
                      scrollBehavior: 'smooth',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      padding: '15px 2px',
                      margin: '0',
                      gap: '15px'
                    }}
                  >
                    <style>{`
                    .productcard::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                    {categoryProducts[category.id].map((product, index) => {
                      const currentPrice = parsePrice(product.Price1);
                      const originalPrice = parsePrice(product.Price3);
                      // const discount = calculateDiscount(originalPrice, currentPrice);

                      return (
                        <div
                          key={product.Productid || index}
                          className="product-card"
                          onClick={() => handleGotoProduct(product.productname)}
                          style={{
                            flex: '0 0 266px',
                            margin: '0',
                            minWidth: '266px'
                          }}
                        >
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
                            style={{
                              width: '249.97px',
                              height: '220px',
                              objectFit: 'contain'
                            }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                            >
                              {t("addToCart")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
    </div>
  );
}