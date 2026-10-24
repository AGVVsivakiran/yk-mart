import React, { useEffect, useContext, useState } from 'react';
import { LuWheat } from "react-icons/lu";
import { FaLeaf, FaTruck, FaAward } from "react-icons/fa6";
//import { IoShieldCheckmark } from "react-icons/io5";
//import { MdVerified } from "react-icons/md";
//import { GiWheat } from "react-icons/gi";
//import { BsShieldCheck } from "react-icons/bs";
import './Harvest.css';
import chili from '../assets/harvest/chili.jpg';
//import millets from '../assets/harvest/millets.jpg'
//import paddy from '../assets/harvest/paddy.jpg'
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Variables from '../Variables.json';
import banner1 from "../assets/banner/banner.jpeg";
import banner2 from "../assets/harvest/banner.jpg";

const bannerImages = [banner1, banner2];

const BASE_URL = Variables.baseUrl;

const getImageUrl = (item) => {
    const img = item?.Images?.[0];
    if (!img) return chili;

    const rawUrl = img.Url;

    // Case: already full URL
    if (typeof rawUrl === "string" && rawUrl.startsWith("http")) {
        return rawUrl;
    }

    // Case: relative path
    if (typeof rawUrl === "string") {
        try {
            // Try JSON parse
            const parsed = JSON.parse(rawUrl);
            if (parsed?.Url) return parsed.Url;
        } catch {
            // rawUrl is not JSON
        }

        // If it starts with /
        if (rawUrl.startsWith("/")) {
            return BASE_URL + rawUrl;
        }
    }

    return chili;
};


export default function Harvest() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [products, setProducts] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Auto-slide logic
    useEffect(() => {
        const slideInterval = setInterval(() => {
            nextSlide();
        }, 3000);
        return () => clearInterval(slideInterval);
    }, [currentSlide]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchAll = async () => {
            try {
                // PRODUCTS
                const formData = new FormData();
                formData.append("Param", JSON.stringify([{ CategoryId: "38" }]));

                const productRes = await fetch(
                    `${BASE_URL}/api/Products/GetAll_CategorywiseProductsBasedOnCategoryID`,
                    {
                        method: "POST",
                        body: formData,
                        signal: controller.signal
                    }
                );

                if (!productRes.ok) throw new Error("Products failed");
                const productData = await productRes.json();
                setProducts(Array.isArray(productData) ? productData : []);

                // FARMS
                const farmRes = await fetch(
                    `${BASE_URL}/api/HarvestFarms/GetAll`,
                    { signal: controller.signal }
                );

                if (!farmRes.ok) throw new Error("Farms failed");
                const farmData = await farmRes.json();
                setFarms(Array.isArray(farmData) ? farmData : []);

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error(err);
                    setError("Failed to load data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        return () => controller.abort();
    }, []);

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            {/* Banner Slider Section */}
            <div className="harvestbanner">
                <button className="slider-arrow left" onClick={prevSlide}>
                    <FiChevronLeft size={24} />
                </button>

                <div className="slider-wrapper">
                    {bannerImages.map((image, index) => (
                        <div
                            key={index}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            {index === currentSlide && (
                                <img src={image} alt={`Banner ${index + 1}`} className="slide-image" />
                            )}
                        </div>
                    ))}
                </div>

                <button className="slider-arrow right" onClick={nextSlide}>
                    <FiChevronRight size={24} />
                </button>

                <div className="slider-dots">
                    {bannerImages.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>

                {currentSlide === 1 && (
                    <div className="lineargreen">
                        <div className="banner-content">
                            <div className="banner-badge">
                                <span className="badge-dot">●</span> Exclusively by YK Laboratories
                            </div>
                            <h1 className="banner-title">
                                Premium <span className="highlight-orange">Organic</span> Bulk Produce,<br />
                                <span className="highlight-orange">Harvest-to-Plate</span>
                            </h1>
                            <p className="banner-description">
                                All organically cultivated produce — Mirchi, Turmeric, Paddy, Millets,
                                Papaya, and more — grown using organic farming methods and organic-
                                based pesticides. Directly from YK Laboratories' certified farms to your
                                business.
                            </p>
                            <div className="banner-buttons">
                                <a href="#vieworganic" className="textnounderline">
                                    <button className="btn-primary" style={{ color: "#fff" }}>View Organic Catalog</button>
                                </a>
                            </div>
                            <div className="banner-stats">
                                <div className="stat-item">
                                    <div className="stat-icon"><FaLeaf /></div>
                                    <div className="stat-number">100%</div>
                                    <div className="stat-label">Certified Organic</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-icon"><FaAward /></div>
                                    <div className="stat-number">12+</div>
                                    <div className="stat-label">Years of Excellence</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="container pbmb50">
                {/* Harvests Ready for Bulk Purchase */}
                <section id="vieworganic">
                    <div className="bulkpurchase">
                        <div className="bulkpurchasetitle">
                            <p>Current Availability</p>
                            <h3>Fresh Harvests Ready for <span className="texthigh">Bulk Purchase</span></h3>
                            <p className="brief">All produce grown on YK Laboratories' certified organic farms using organic-based pesticides and sustainable farming practices.</p>
                        </div>
                    </div>


                    <div className="product-grid">
                        {products.map((item) => (
                            <div
                                className="product-cards"
                                key={item.Productid}
                                onClick={() => {
                                    const cleanName = item.productname
                                        .trim()
                                        .replace(/[^\w\s-]/g, "") // remove special chars
                                        .replace(/\s+/g, "-")     // spaces to hyphens
                                        .toLowerCase();
                                    navigate(`/product/${cleanName}`, { state: { productName: item.productname, fromHarvest: true } });
                                }}
                            >
                                <div className="card-image-wrapper">
                                    <img
                                        src={BASE_URL + item.Image}
                                        alt={item.productname}
                                        className="card-image"
                                        onError={(e) => { e.target.src = chili; }}
                                    />

                                    <div className="badges">
                                        <span className="badges badge-success">Available</span>
                                        <span className="badges badge-white">YK Farms</span>
                                    </div>
                                </div>

                                <div className="card-content">
                                    <h3 className="card-title">{item.productname}</h3>

                                    {/* <div className="card-details">
                                            <div className="detail-item">
                                                <span>Nalgonda</span>
                                            </div>
                                            <div className="detail-item">
                                                <span>
                                                    Stock Available
                                                </span>
                                            </div>
                                        </div> */}

                                    <div className="card-footer">
                                        <div className="product-price">
                                            <span style={{ fontWeight: 'bold', color: '#1f5134' }}>₹{parseFloat(item.Price1 || 0).toFixed(2)} / {item.Pack1 || '1kg'}</span>
                                        </div>
                                        <button className="enquire-btn">
                                            More →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* Organic Farms */}
                <div className="bulkpurchase">
                    <div className="bulkpurchasetitle">
                        <p>Our Farms</p>
                        <h3>YK Laboratories <span className="texthigh">Organic Farms</span></h3>
                        <p className="brief">All our produce comes exclusively from YK Laboratories' owned and certified partner farms, ensuring complete traceability and consistent organic quality.</p>
                    </div>
                </div>
                <div className="organicfarm">
                    {farms.map((farm) => (
                        <div className="organicblock">
                            <div className="titleheader">
                                <h4>{farm.FarmName}</h4>
                                <p>{farm.FarmType}</p>
                            </div>
                            <div className="detail-item">
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>{farm.City}, {farm.State}</span>
                            </div>
                            <ul className="productlist">
                                <li><LuWheat />{farm.ProductNames}</li>
                            </ul>
                            <div className="certification">
                                <p><FaLeaf /> NIPHM & NHDRF</p>
                            </div>
                        </div>
                    ))}
                </div>


                {/* Certifications & Quality Section */}
                <section >
                    <div className="bulkpurchase">
                        <div className="bulkpurchasetitle">
                            <p> Certifications & Quality</p>
                            <h3>Certified <span className="texthigh">Organic Standards</span></h3>
                            <p className="brief">YK Laboratories maintains the highest organic certifications globally, ensuring every bulk purchase meets international organic standards.</p>
                        </div>
                    </div>

                    <div className="certification-badges">
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> Apof Organic
                        </div>
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> Biocert
                        </div>
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> Care Labs
                        </div>
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> CIMAP
                        </div>
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> FDA
                        </div>
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> NHDRF
                        </div>
                        <div className="cert-badge">
                            <FaLeaf className="cert-icon" /> TSSOCA
                        </div>
                    </div>

                    <div className="certification-grid">
                        {/* Card 1 - With Image  */}
                        <a href="./assets/certificate/Apof.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/apoflogo.jpg" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Apof Organic</h4>
                            <p className="cert-card-description">
                                Apof Organic Certification Agency (AOCA) is an independent not-for-profit NGO, committed to the cause of providing most efficient and affordable inspection and certification service to the farmers of India.
                            </p>

                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 2 - USDA  */}
                        <a href="./assets/certificate/bio.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/biocertlogo.jfif" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Biocert</h4>
                            <p className="cert-card-description">
                                Biocert International Pvt. Ltd. provides inspection and certification services for organic and quality standards, helping farmers and food producers meet national and international regulations while promoting sustainable and trustworthy agricultural practices
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 3 - EU Organic  */}
                        <a href="./assets/certificate/carelabs_botanical.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/carelabs.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Care Labs Cyto-Botanical insecticide</h4>
                            <p className="cert-card-description">
                                Care Labs Cyto-Botanical Insecticide is a plant-based insect control solution developed using botanical extracts, offering effective pest management while being eco-friendly, safe for crops, and suitable for sustainable agriculture.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 4 - Pesticide Free */}
                        <a href="./assets/certificate/carelabs_fost.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/carelabs.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Care Labs Fost(Rootex)Organic Manure</h4>
                            <p className="cert-card-description">
                                Care Labs Fost (Rootex) Organic Manure improves root development, enhances soil fertility, boosts microbial activity, and supports healthy plant growth using natural, eco-friendly nutrients.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 5 - Traceability  */}
                        <a href="./assets/certificate/carelabs_immuno.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/carelabs.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Care Labs Immuno-plant Immuno Modulator & Flower Stimulate</h4>
                            <p className="cert-card-description">
                                Care Labs Immuno-Plant is an immuno-modulator and flower stimulant that strengthens plant resistance, improves flowering, enhances yield quality, and supports healthy growth through natural bio-active compounds.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 6 - Quality Guarantee  */}
                        <a href="./assets/certificate/carelabs_impel_botanical.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/carelabs.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Care Labs Impel - Botanical Fungicide & Bactericide(Plant Protector)</h4>
                            <p className="cert-card-description">
                                Care Labs Impel is a botanical fungicide and bactericide that protects plants from diseases, controls pathogens naturally, strengthens plant immunity, and supports healthy, residue-free crop growth.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Add more cards for total 11 Card 7  */}
                        <a href="./assets/certificate/carelabs_enviro.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/carelabs.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">Care Labs Cyto Labs</h4>
                            <p className="cert-card-description">
                                Care Labs Cyto Labs is an agricultural biotechnology company focused on botanical and organic crop protection solutions, enhancing plant health, immunity, and sustainable farming productivity.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 8  */}
                        <a href="./assets/certificate/csir-medi-aro.jpeg" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/cimap.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">CSIR- CIMAP</h4>
                            <p className="cert-card-description">
                                CSIR-CIMAP (Central Institute of Medicinal and Aromatic Plants) is a premier Indian research institute developing technologies for medicinal, aromatic plant cultivation, processing, and value-added agro-based innovations.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 9  */}
                        <a href="./assets/certificate/fda.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/fdalogo.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">U.S. FOOD AND DRUG ADMINISTRATION</h4>
                            <p className="cert-card-description">
                                Certificate of Registration of Facility under the U.S. Food and Drug Administration (FDA)
                                This certificate confirms that a manufacturing or processing facility is officially registered with the U.S. FDA, meeting mandatory regulatory requirements for exporting products to the United States.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 10 */}
                        <a href="./assets/certificate/nhrdf.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/nhrdflogo.jfif" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">NHDRF</h4>
                            <p className="cert-card-description">
                                NHRDF (National Horticulture Research and Development Foundation) is an Indian organization focused on research, development, and extension to improve horticultural crop productivity and farmer livelihoods.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>

                        {/* Card 11  */}
                        <a href="./assets/certificate/tso.pdf" target="_blank" className="cert-card">
                            <div className="cert-card-icon">
                                <div className="icon-circle imagecircle">
                                    <img src="./assets/certificate/tsologo.png" alt="Apof Organic Logo" />
                                </div>
                            </div>
                            <h4 className="cert-card-title">TSSOCA</h4>
                            <p className="cert-card-description">
                                Telangana State Organic Certification Agency is a government body responsible for seed certification and organic certification, ensuring quality standards, authenticity, and compliance for agricultural products in Telangana.
                            </p>
                            <button className="click-here-btn">
                                Click Here →
                            </button>
                            <p className="learn-more-text">Learn more about our certification process</p>
                        </a>
                    </div>
                </section>

            </div>

        </div>
    )
}

