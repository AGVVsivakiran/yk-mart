import React, { useEffect } from 'react';
import Breadcrumb from '../Components/Breadcrumb';
import './TermsConditions.css';

const TermsConditions = () => {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="container mt-2 mb-5">
            <Breadcrumb />
            <div className="terms-content">
                    <h1 className="mb-4">Terms & Conditions of YK Mart</h1>

                    <section className="mb-4">
                        <p>YK Mart operates the <a href="https://ykmart.in/">https://ykmart.in/</a> website, which provides the SERVICE.</p>
                        <p>This page is used to inform website visitors regarding our terms with the collection, use, and disclosure of Personal Information if anyone decided to use our Service, the YK Mart website.</p>
                    </section>

                    <section className="mb-4">
                        <h4>Personal Information</h4>
                        <p>As part of the registration process on the Site, YKMART may collect the following personally identifiable information about you: Name including Full Name, email address, mobile phone number and contact details, Postal code, address and information about the pages on the site you visit/access, the links you click on the site, the number of times you access the page and any such browsing information.</p>
                    </section>

                    <section className="mb-4">
                        <h4>Account & Registration Obligations</h4>
                        <p>All shoppers have to register and login for placing orders on the Site. You have to keep your account and registration details current and correct for communications related to your purchases from the site. By agreeing to the terms and conditions, the shopper agrees to receive promotional communication and newsletters upon registration</p>
                    </section>

                    <section className="mb-4">
                        <h4>Pricing</h4>
                        <p>All the products listed on the Site will be sold at MRP unless otherwise specified. The prices mentioned at the time of ordering will be the prices charged on the date of the delivery. Although prices of most of the products do not fluctuate on a daily basis but some of the commodities do change on a daily basis.</p>
                    </section>

                    <section className="mb-4">
                        <h4>Return & Refunds</h4>
                        <p>We have a "no questions asked return and refund policy" which entitles all our members to return the product at the time of delivery if due to some reason they are not satisfied with the quality or freshness of the product. We will take the returned product back with us and issue a credit note for the value of the return products which will be credited to your account on the Site. This can be used to pay your subsequent shopping bills.</p>
                    </section>

                    <section className="mb-4">
                        <h4>You may not use the Site for any of the following purposes:</h4>
                        <ul>
                            <li>Disseminating any unlawful, harassing, libellous, abusive, threatening, harmful, vulgar, obscene, or otherwise objectionable material.</li>
                            <li>Transmitting material that encourages conduct that constitutes a criminal offence or results in civil liability or otherwise breaches any relevant laws, regulations or code of practice.</li>
                            <li>Gaining unauthorized access to other computer systems.</li>
                            <li>Interfering with any other person's use or enjoyment of the Site.</li>
                            <li>Breaching any applicable laws.</li>
                            <li>Interfering or disrupting networks or web sites connected to the Site.</li>
                            <li>Making, transmitting or storing electronic copies of materials protected by copyright without the permission of the owner.</li>
                        </ul>
                    </section>

                    <section className="mb-4">
                        <h4>Colours</h4>
                        <p>We have made every effort to display the colours of our products that appear on the Website as accurately as possible. However, as the actual colours you see will depend on your monitor, we cannot guarantee that your monitor's display of any colour will be accurate.</p>
                    </section>

                    <section className="mb-4">
                        <h4>Modification of Terms & Conditions of Service</h4>
                        <p>YKMART may at any time modify the Terms & Conditions of Use of the Website without any prior notification to you. You can access the latest version of these Terms & Conditions at any given time on the Site. You should regularly review the Terms & Conditions on the Site. In the event the modified Terms & Conditions is not acceptable to you, you should discontinue using the Service. However, if you continue to use the Service you shall be deemed to have agreed to accept and abide by the modified Terms & Conditions of Use of this Site.</p>
                    </section>

                </div>
            </div>
    );
};

export default TermsConditions;
