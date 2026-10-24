import React, { useEffect, useState } from 'react';
import Breadcrumb from '../Components/Breadcrumb';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import './ContactUs.css';

const ContactUs = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle form submission, e.g., sending data to an API
        console.log('Form submitted:', formData);
        alert('Thank you for contacting us! We will get back to you shortly.');
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="container mt-2 mb-5">
            <Breadcrumb />
            <h1 className="mb-4 text-center">Contact Us</h1>
                <p className="text-center text-muted mb-5">
                    We'd love to hear from you! Whether you have a question about our products, need assistance with an order, or just want to say hello, our team is ready to answer all your questions.
                </p>

                <div className="row g-5">
                    {/* Contact Information */}
                    <div className="col-lg-5">
                        <div className="contact-info-card shadow-sm p-4 rounded h-100">
                            <h3>Get in Touch</h3>
                            <p className="text-muted mb-4">Fill out the form or contact us via the details below.</p>

                            <div className="d-flex mb-4">
                                <div className="icon-box text-success me-3">
                                    <FiPhone size={24} />
                                </div>
                                <div>
                                    <h5 className="mb-1">Phone</h5>
                                    <p className="mb-0"><a href="tel:+919705129639" className="text-decoration-none text-dark">(+91) 970 512 9639</a></p>
                                    <p className="mb-0"><a href="tel:+919491418181" className="text-decoration-none text-dark">(+91) 949 141 8181</a></p>
                                </div>
                            </div>

                            <div className="d-flex mb-4">
                                <div className="icon-box text-success me-3">
                                    <FiMail size={24} />
                                </div>
                                <div>
                                    <h5 className="mb-1">Email</h5>
                                    <p className="mb-0"><a href="mailto:info@ykmart.in" className="text-decoration-none text-dark">info@ykmart.in</a></p>
                                </div>
                            </div>

                            <div className="d-flex">
                                <div className="icon-box text-success me-3">
                                    <FiMapPin size={24} />
                                </div>
                                <div>
                                    <h5 className="mb-1">Reach Us</h5>
                                    <p className="mb-0 text-muted">
                                        SY.NO. 255, PLOT NO.3, EAST PART,<br />
                                        KUNTLOOR (V), HAYATHNAGAR,<br />
                                        R.R. DIST. TELANGANA - 501505. INDIA.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="col-lg-7">
                        <div className="contact-form-card shadow-sm p-4 rounded bg-white border">
                            <h3 className="mb-4">Send us a Message</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label htmlFor="name" className="form-label">Your Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label">Your Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="subject" className="form-label">Subject</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="message" className="form-label">Message</label>
                                        <textarea
                                            className="form-control"
                                            id="message"
                                            name="message"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-success px-4 py-2">Send Message</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default ContactUs;
