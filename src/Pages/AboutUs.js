import React, { useEffect } from 'react';
import Breadcrumb from '../Components/Breadcrumb';
import './AboutUs.css';
import Logo from '../logo.jpg'; // Importing the logo

const AboutUs = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="container mt-2 mb-5">
            <Breadcrumb />
            <div className="about-content">

                    <div className="row align-items-center mb-5">
                        {/* Content Section - Left */}
                        <div className="col-md-7 order-2 order-md-1">
                            <h1 className="mb-4">ABOUT YKmart</h1>
                            <p>
                                We YK Laboratories manufacturing of certified organic inputs especially Botanical Virucide, Fungicide water base and Botanical Insecticide & Sucking pest oil base, with the aid of Medicinal plants and related alkaloids which controls and suppress the multiplication of Bacterial and Fungal growth.
                            </p>
                            <p>
                                We have developed the capability to match international quality standards stringent user requirements through continuous Field trials on my YK Farm Land which we cultivate organically all vegetables and flowers and cereals, horticulture crops, located in Hyderabad, INDIA. It improves the product quality and batch to batch consistency and reproducibility according to the climatic conditions.
                            </p>
                        </div>

                        {/* Logo Section - Right */}
                        <div className="col-md-5  order-1 order-md-2 text-center">
                            <div className="aboutlogo">
                                <img src={Logo} alt="YK Mart Logo" className="shadow-sm aboutimg" />
                            </div>
                        </div>
                    </div>


            </div>
        </div>
    );
};

export default AboutUs;
