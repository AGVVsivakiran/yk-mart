import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// logo
import Logo from "../logo.jpg";

// footer icon
import { FaChevronCircleRight } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { MdCall } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-flex">
        <div className="footer-section">
          <img src={Logo} alt="YK Mart" className="footer-logo" />
          <p>Your trusted partner for quality products and organic farming solutions.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/"><FaChevronCircleRight /> Home</Link></li>
            <li><Link to="/harvest"><FaChevronCircleRight /> YK Harvest</Link></li>
            <li><Link to="/cart"><FaChevronCircleRight /> Cart</Link></li>
            <li><Link to="/privacy-policy"><FaChevronCircleRight /> Privacy Policy</Link></li>
            <li><Link to="/terms-conditions"><FaChevronCircleRight /> Terms & Conditions</Link></li>
            <li><Link to="/about-us"><FaChevronCircleRight /> About Us</Link></li>
            <li><Link to="/contact-us"><FaChevronCircleRight /> Contact Us</Link></li>
            <li><a href="https://yklaboratories.com/" target="_blank" rel="noopener noreferrer"><FaChevronCircleRight /> YK Laboratories</a></li>
            <li><a href="https://siteadmin.ykmart.in/login" target="_blank" rel="noopener noreferrer"><FaChevronCircleRight /> Admin Login</a></li>
            <li><a href="https://ykhomes.in/" target="_blank" rel="noopener noreferrer"><FaChevronCircleRight /> YK Homes<div style={{ fontSize: "9px", marginTop: "-5px", fontWeight: 100, letterSpacing: "1.1px", fontStyle: "italic" }}>Luxurious & Comfortable Stay</div> </a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/orders"><FaChevronCircleRight /> My Orders</Link></li>
            <li><Link to="/wishlist"><FaChevronCircleRight /> Wishlist</Link></li>
            <li><Link to="/track"><FaChevronCircleRight /> Track Order</Link></li>
            {/* <li><a href="mailto:support@ykmart.com">Support</a></li> */}
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p><MdEmail /> <a href="mailto:info@ykmart.in" style={{ color: "white", textDecoration: "none" }}>info@ykmart.in</a></p>
          <p style={{ width: '100%' }}><MdCall /> <span style={{ display: 'inline-flex' }}> +91-970 512 9639 <br /> +91-949 141 8181</span></p>
          <p style={{ width: '100%', display: 'ruby-text' }}><MdLocationOn /> <span style={{ display: 'inline-flex' }}>SY.NO. 255, PLOT NO.3, EAST PART, KUNTLOOR (V), HAYATHNAGAR, R.R. DIST. TELANGANA - 501505. INDIA.</span></p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 YK Mart. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;