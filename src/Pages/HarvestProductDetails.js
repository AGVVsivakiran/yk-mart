import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FaEnvelope, FaWhatsapp, FaPhoneAlt, FaStar, FaFacebook } from 'react-icons/fa';
import { UserContext } from '../Controllers/UserContext';
import './HarvestProductDetails.css';
import Breadcrumb from '../Components/Breadcrumb';
import Variables from '../Variables.json';



import { Helmet } from 'react-helmet-async';

export default function HarvestProductDetails() {

    const formatDescription = (text) => {
        if (!text) return "";

        // 1. Replace *text* with <strong>text</strong>
        let formattedText = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

        // 2. Replace double line breaks with <p> tags for paragraphs
        formattedText = formattedText.split(/\n\s*\n/).map(paragraph => `<p>${paragraph}</p>`).join('');

        // 3. Optionally replace single line breaks inside paragraph with <br>
        formattedText = formattedText.replace(/\n/g, "<br>");

        return formattedText;
    };


    const { ProductId } = useParams();
    const { setCartItems, cartItems } = useContext(UserContext);

    const [productData, setProductData] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedPack, setSelectedPack] = useState('Pack1');
    const [loading, setLoading] = useState(true);

    // Magnifier State
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({});

    const IMAGE_BASE_URL = Variables.baseUrl;

    useEffect(() => {
        if (ProductId) fetchProductDetails();
    }, [ProductId]);

    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${IMAGE_BASE_URL}/api/HarvestFarms/Products/GetById`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ProductId: Number(ProductId) })
                }
            );

            const result = await response.json();
            setProductData(result);

            if (Array.isArray(result.Images)) {
                const imgs = result.Images
                    .map(img => {
                        const rawUrl = img?.Url;
                        if (!rawUrl) return null;

                        if (typeof rawUrl === "string" && rawUrl.startsWith("http")) return rawUrl;
                        if (typeof rawUrl === "string" && rawUrl.startsWith("/")) return IMAGE_BASE_URL + rawUrl;

                        try {
                            const parsed = JSON.parse(rawUrl);
                            if (parsed?.Url) return parsed.Url;
                        } catch { }

                        return null;
                    })
                    .filter(Boolean);

                setProductImages(imgs);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const packOptions = productData?.ProductId === 30
        ? [{ key: 'Pack1', label: "1kg", price: 168 }]
        : [{ key: 'Pack1', label: "1kg", price: 0 }];

    const getCurrentPrice = () => {
        const pack = packOptions.find(p => p.key === selectedPack);
        return pack ? pack.price : 0;
    };

    const currentPrice = getCurrentPrice();
    const gst = 5;

    const handleAddToCart = () => {
        if (!productData) return;

        const exists = cartItems.some(item => item.ProductId === productData.ProductId);

        if (!exists) {
            setCartItems(prev => [
                ...prev,
                {
                    ProductId: productData.ProductId,
                    ProductName: productData.ProductName,
                    Price: currentPrice,
                    Quantity: quantity,
                    Image: productImages[0]
                }
            ]);
            alert('Product added to cart!');
        } else {
            alert('Product already in cart!');
        }
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left - window.scrollX) / width) * 100;
        const y = ((e.pageY - top - window.scrollY) / height) * 100;

        setZoomPos({ x, y });
        setZoomStyle({
            backgroundPosition: `${x}% ${y}%`,
            backgroundImage: `url(${productImages[selectedImage] || "/placeholder.jpg"})`
        });
    };

    const handleMouseEnter = () => setShowZoom(true);
    const handleMouseLeave = () => setShowZoom(false);

    if (loading) return <div className="ykp-loading">Loading...</div>;
    if (!productData) return <div className="ykp-error">Product not found</div>;

    return (
        <div className="container mt-2">
            <Breadcrumb productName={productData.ProductName} />
                {productData && (
                    <Helmet>
                        <title>{`${productData.ProductName} | YK Mart Harvest`}</title>
                        <meta name="description" content={`Buy fresh ${productData.ProductName} from ${productData.FarmName} at YK Mart. Origin: ${productData.OriginCity}. Harvested on ${productData.HarvestDate}.`} />
                        <meta property="og:title" content={`${productData.ProductName} - Fresh from ${productData.FarmName} | YK Mart`} />
                        <meta property="og:description" content={`Order farm-fresh ${productData.ProductName} on YK Mart. Origin: ${productData.OriginCity}. Supporting local organic farmers.`} />
                        <meta property="og:url" content={`https://ykmart.in/harvest-product/${ProductId}`} />
                        <meta property="og:image" content={productImages[0] || 'https://ykmart.in/logo.png'} />
                        <meta property="og:type" content="product" />
                        <meta name="twitter:card" content="summary_large_image" />
                        <meta name="twitter:image" content={productImages[0] || 'https://ykmart.in/logo.png'} />
                    </Helmet>
                )}
                <div className="product-details-container bgtransparent">
                    <div className="productcardharvest medicard">
                        {/* <h1 className="product-title">{productData.ProductName}</h1> */}
                        <div class="title-section product-title">
                            <h2>{productData.ProductName}</h2>
                            {/* <div className="ykp-contact-icons">
                                <a href="mailto:support@ykmart.com" className="ykp-icon email emailcol">
                                    <FaEnvelope />
                                </a>

                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(
                                        `https://ykmart.in/harvest-product/${ProductId}\n\n🌾 *${productData.ProductName}*\n📍 *Origin:* ${productData.OriginCity}\n🚜 *Farm:* ${productData.FarmName}\n\nFresh from the farm! Order now on *YK Mart*.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ykp-icon whatsapp whatupcol"
                                >
                                    <FaWhatsapp />
                                </a>

                                <a href="tel:+919999999999" className="ykp-icon call callcol">
                                    <FaPhoneAlt />
                                </a>
                            </div> */}
                        </div>
                        <div className="product-details-wrapper">
                            {/* IMAGE SECTION */}
                            <div className="productimagesection">
                                <div className="gallery-layout">
                                    {/* Thumbnail Gallery (Amazon Style - Sidebar on Left) */}
                                    <div className="thumbnail-gallery-sidebar">
                                        {productImages.map((img, index) => (
                                            <div
                                                key={index}
                                                className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                                                onMouseEnter={() => setSelectedImage(index)}
                                                onClick={() => setSelectedImage(index)}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`Thumbnail ${index}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Image with Zoom */}
                                    <div className="main-image-container">
                                        <div
                                            className="main-image-viewport"
                                            onMouseMove={handleMouseMove}
                                            onMouseEnter={handleMouseEnter}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            <img
                                                src={productImages[selectedImage] || "/placeholder.jpg"}
                                                alt={productData.ProductName}
                                                className="display-image"
                                                onError={e => e.target.src = "/placeholder.jpg"}
                                            />
                                            {showZoom && (
                                                <div className="zoom-lens" style={{ left: `${zoomPos.x}%`, top: `${zoomPos.y}%` }}></div>
                                            )}
                                        </div>

                                        {/* Resulting Zoom Panel (Amazon Style) */}
                                        {showZoom && (
                                            <div className="zoom-result-panel" style={zoomStyle}></div>
                                        )}
                                    </div>
                                </div>

                                <div className="trust-badge">
                                    <a href="http://nhrdf.org/" target="_blank" rel="noopener"><img src={`${process.env.PUBLIC_URL}/assets/certificate/HarvestLogo/harvestlogoNHDRF.jpeg`} alt="NHDRF Certificate" className="certificate-image" /></a>
                                    <a href="https://niphm.gov.in/" target="_blank" rel="noopener"><img src={`${process.env.PUBLIC_URL}/assets/certificate/HarvestLogo/harvestlogoNIPHM.jpg`} alt="NIPHM Certificate" className="certificate-image" /></a>
                                </div>
                            </div>

                            {/* PRODUCT INFO */}
                            <div className="product-info-section">
                                <h1 className="product-title">{productData.ProductName}</h1>

                                <div className="product-rating">
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="star" />
                                        ))}
                                    </div>
                                    <span className="rating-text">5 Rate</span>
                                    <a href="#reviews" className="reviews-link">Reviews</a>
                                </div>

                                <div className="share-buttons">
                                    <span>Share</span>
                                    <button className="share-btn facebook"><FaFacebook /></button>
                                    <button className="share-btn whatsapp"><FaWhatsapp /></button>
                                    <div className="share-title">Share</div>
                                </div>

                                <div className="product-options">
                                    <div className="option-row">
                                        <label>Size:</label>
                                        <select
                                            value={selectedPack}
                                            onChange={(e) => setSelectedPack(e.target.value)}
                                            className="pack-select"
                                        >
                                            {packOptions.map(pack => (
                                                <option key={pack.key} value={pack.key}>{pack.label}</option>
                                            ))}
                                        </select>

                                        <label style={{ marginLeft: '20px' }}>Quantity:</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="quantity-input"
                                        />
                                    </div>
                                </div>

                                <div className="price-section">
                                    <span className="price-label">Price:</span>
                                    {productData.ProductId === 30 ? (
                                        <div className="price-display" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ textDecoration: 'line-through', color: '#666' }}>₹{currentPrice.toFixed(2)}</span>
                                            <span style={{ color: '#1f5134', fontWeight: 'bold', fontSize: '1.5rem' }}>₹{(currentPrice * 0.75).toFixed(2)}</span>
                                            <span style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>25% OFF</span>
                                        </div>
                                    ) : (
                                        <p className="price-value" style={{ margin: 0, fontWeight: 'bold' }}>₹{currentPrice.toFixed(2)}</p>
                                    )}
                                    <span className="gst-info"> GST Included ({gst}%)</span>
                                </div>

                                <div className="pack-options-grid">
                                    {packOptions.map(pack => (
                                        <button
                                            key={pack.key}
                                            className={`pack-option ${selectedPack === pack.key ? 'active' : ''}`}
                                            onClick={() => setSelectedPack(pack.key)}
                                        >
                                            <div className="pack-size">{pack.label}</div>
                                            <div className="pack-price">₹{parseFloat(pack.price).toFixed(2)}</div>
                                        </button>
                                    ))}
                                </div>

                                <div className="action-buttons">
                                    <button className="add-to-cart-btn yk-cart-btn" onClick={handleAddToCart}>
                                        Add to Cart
                                    </button>
                                    <button className="buy-now-btn">
                                        Buy Now
                                    </button>
                                </div>
                            </div>

                            {/* <div className="down-social-icons">
                                <div className="socialiconsticky">
                                    <a href="mailto:support@ykmart.com" className="ykp-icon email borleft12">
                                        <FaEnvelope /> <span>E-mail</span>
                                    </a>
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(
                                            `https://ykmart.in/harvest-product/${ProductId}\n\n🌾 *${productData.ProductName}*\n📍 *Origin:* ${productData.OriginCity}\n🚜 *Farm:* ${productData.FarmName}\n\nFresh from the farm! Order now on *YK Mart*.`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ykp-icon whatsapp"
                                    >
                                        <FaWhatsapp /> <span> WhatsApp</span>
                                    </a>

                                    <a href="tel:+919999999999" className="ykp-icon call borright12">
                                        <FaPhoneAlt /> <span>Call</span>
                                    </a>
                                </div>
                            </div> */}
                        </div>

                        <div className="description-section">
                            <h3>Description</h3>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: formatDescription(productData.Description)
                                }}
                            />

                            <div className="test-report-qr" style={{ marginTop: '30px' }}>
                                <h4>Test Report / QR Verification</h4>
                                <img
                                    src={`${process.env.PUBLIC_URL}/assets/Harvest/qr_placeholder.png`}
                                    alt="Verification QR Code"
                                    style={{ width: '150px', border: '1px solid #ddd', borderRadius: '8px' }}
                                    onError={(e) => e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=YK-MART-VERIFIED"}
                                />
                            </div>
                        </div>

                    </div>
                </div>




                {/* <div className="ykp-contact-icons">
                    <a href="mailto:support@ykmart.com" className="ykp-icon email emailcol">
                        <FaEnvelope />
                    </a>

                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                            `https://ykmart.in/harvest-product/${ProductId}\n\n🌾 *${productData.ProductName}*\n📍 *Origin:* ${productData.OriginCity}\n🚜 *Farm:* ${productData.FarmName}\n\nFresh from the farm! Order now on *YK Mart*.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ykp-icon whatsapp whatupcol"
                    >
                        <FaWhatsapp />
                    </a>

                    <a href="tel:+919999999999" className="ykp-icon call callcol">
                        <FaPhoneAlt />
                    </a>
                </div> */}




            </div>
    );
}
