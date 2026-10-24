import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../Controllers/UserContext";
import "./Checkout.css";
import Breadcrumb from "../Components/Breadcrumb";
import { FiArrowLeft, FiCreditCard, FiPlus, FiCheck, FiMapPin, FiTrash2, FiCheckCircle } from "react-icons/fi";
import Variables from "../Variables.json";
import { sendOrderEmail, sendAdminPushNotification } from "../Services/EmailService";

// Compute API base URL once at module level so ALL functions can access it
// Covers BOTH production domains: ykmart.in and ykmart.breakingindiaapp.com
const isProduction = window.location.origin.includes("ykmart.in") || window.location.origin.includes("breakingindiaapp.com");
const apiBaseUrl = isProduction ? "/webservices" : Variables.baseUrl;

// Utility to ensure URLs use production domain instead of localhost
// and enforce HTTPS for security/CORS compliance
const formatUrl = (url) => {
    if (!url) return "";
    let formatted = url.toString();
    // Replace localhost or local IP with production domain
    formatted = formatted.replace(/http:\/\/localhost:7070/g, "https://ykmart.in/webservices");
    formatted = formatted.replace(/http:\/\/127\.0\.0\.1:7070/g, "https://ykmart.in/webservices");
    return formatted;
};

const Checkout = () => {
    const {
        userData, cartItems, setCartItems,
        setShowAuthModal, setAuthType
    } = useContext(UserContext);
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment

    const [shippingData, setShippingData] = useState({
        fullName: userData?.name || "",
        mobile: userData?.mobile || "",
        email: userData?.email || "",
        hno: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        addressType: "Home"
    });

    const subtotal = cartItems.reduce((sum, item) => {
        let price = item.Price1 || item.Price || 0;
        if (item.selectedPack === "Pack2") price = item.Price2 || price;
        if (item.selectedPack === "Pack3") price = item.Price3 || price;
        return sum + (price * (item.quantity || 1));
    }, 0);
    const delivery = 0.0;
    const finalAmount = subtotal + delivery;

    useEffect(() => {
        if (userData && userData.isLoggedIn) {
            fetchAddresses();
        }
    }, [userData]);

    const fetchAddresses = async (selectHNo = null) => {
        if (!userData || !userData.id) return;

        try {
            const formData = new FormData();
            formData.append("Param", JSON.stringify([{ UserId: userData.id.toString() }]));

            const response = await fetch(`${Variables.baseUrl}/api/Products/Get_Customer_Address_Based_On_Id`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            // Saved addresses from API
            let apiAddresses = Array.isArray(data) ? data : (data && data.Id ? [data] : []);

            let finalAddressList = [];

            if (apiAddresses.length > 0) {
                // Use the first address from the database as the "Profile Address"
                finalAddressList = apiAddresses.map((addr, index) => {
                    if (index === 0) {
                        return {
                            ...addr,
                            isProfile: true, // Label it as profile
                            displayLabel: "Profile Address (Registered)"
                        };
                    }
                    return {
                        ...addr,
                        displayLabel: addr.Address || "Saved Address"
                    };
                });
            } else {
                // Fallback ONLY if the database is empty
                finalAddressList = [{
                    Id: "Profile-Addr",
                    displayLabel: "Profile Address",
                    HNo: (userData.address && userData.address !== "India") ? userData.address : "Saved Profile",
                    Area: "",
                    City: "",
                    State: "",
                    Pincode: "",
                    MobileNo: userData.mobile,
                    isProfile: true,
                    Address: (userData.address && userData.address !== "India") ? userData.address : "Saved Profile"
                }];
            }

            setAddresses(finalAddressList);

            // Auto-selection logic
            if (selectHNo) {
                const newlyAdded = finalAddressList.find(a => a.HNo === selectHNo) || finalAddressList[finalAddressList.length - 1];
                if (newlyAdded) setSelectedAddressId(newlyAdded.Id);
            } else if (!selectedAddressId && finalAddressList.length > 0) {
                setSelectedAddressId(finalAddressList[0].Id);
            }
            setShowAddressForm(false);
        } catch (error) {
            console.error("Error fetching addresses:", error);
            setShowAddressForm(true);
        }
    };

    const handleInputChange = (e) => {
        setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    };

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirmAddress = async () => {
        if (showAddressForm) {
            if (!shippingData.hno || !shippingData.area || !shippingData.city || !shippingData.state || !shippingData.pincode) {
                alert("Please fill in all shipping details.");
                return;
            }

            setLoading(true);
            try {
                // Client-side de-duplication: check if this address already exists
                const alreadyExists = addresses.some(a =>
                    a.HNo.toLowerCase() === shippingData.hno.toLowerCase() &&
                    a.Area.toLowerCase() === shippingData.area.toLowerCase()
                );

                if (alreadyExists) {
                    const existing = addresses.find(a => a.HNo.toLowerCase() === shippingData.hno.toLowerCase());
                    setSelectedAddressId(existing.Id);
                    setStep(2);
                    setLoading(false); // Ensure loading state is reset
                    return;
                }

                const fullAddressString = `${shippingData.hno}, ${shippingData.area}, ${shippingData.landmark ? `${shippingData.landmark}, ` : ''}${shippingData.city}, ${shippingData.state} - ${shippingData.pincode}`;

                const addFormData = new FormData();
                addFormData.append("Param", JSON.stringify([{
                    UserId: userData.id.toString(),
                    Area: shippingData.area,
                    Landmark: shippingData.landmark || "",
                    Address: fullAddressString, // COMPOSITE ADDRESS for DB accuracy
                    HNo: shippingData.hno,
                    City: shippingData.city,
                    State: shippingData.state,
                    Pincode: shippingData.pincode,
                    MobileNo: shippingData.mobile
                }]));

                console.log("Adding new address to DB with full string:", fullAddressString);

                const res = await fetch(`${Variables.baseUrl}/api/Products/Add_Customer_Address`, {
                    method: "POST",
                    body: addFormData
                });

                // Re-fetch once to update UI and select the new one
                localStorage.setItem('yk_toast', JSON.stringify({ message: "Address added successfully", type: "success" }));
                window.dispatchEvent(new Event('yk_trigger_toast'));
                await fetchAddresses(shippingData.hno);
                setStep(2);
            } catch (error) {
                console.error("Error adding address:", error);
                alert("Failed to add address. Please try again.");
            } finally {
                setLoading(false);
            }
        } else if (!selectedAddressId) {
            alert("Please select a delivery address.");
            return;
        } else {
            setStep(2);
        }
    };

    const handleDeleteAddress = async (id, e) => {
        if (e) e.stopPropagation();

        if (id === "Profile-Addr") {
            alert("Profile address cannot be deleted.");
            return;
        }

        if (!window.confirm("Are you sure you want to remove this address?")) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("Id", id.toString());

            const response = await fetch(`${Variables.baseUrl}/api/Products/DeleteAddress`, {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                localStorage.setItem('yk_toast', JSON.stringify({ message: "Address removed successfully", type: "success" }));
                window.dispatchEvent(new Event('yk_trigger_toast'));

                // If the deleted address was selected, fallback to profile address
                if (selectedAddressId && selectedAddressId.toString() === id.toString()) {
                    setSelectedAddressId("Profile-Addr");
                }

                await fetchAddresses();
            } else {
                localStorage.setItem('yk_toast', JSON.stringify({ message: "Failed to delete address", type: "error" }));
                window.dispatchEvent(new Event('yk_trigger_toast'));
            }
        } catch (error) {
            console.error("Error deleting address:", error);
            alert("Failed to delete address.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (e) => {
        if (e) e.preventDefault();

        if (!userData.isLoggedIn) {
            setAuthType("login");
            setShowAuthModal(true);
            return;
        }

        let addressId = selectedAddressId;
        const activeAddr = addresses.find(a => a.Id.toString() === addressId.toString());

        if (!activeAddr && (!showAddressForm)) {
            alert("Delivery address not found. Please select again.");
            return;
        }

        console.log("Using API Base URL:", apiBaseUrl);

        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load.");
            return;
        }

        const options = {
            key: Variables.razorpayKey,
            amount: Math.round(finalAmount * 100),
            currency: "INR",
            name: "YK Mart",
            description: "Organic Purchase",
            image: formatUrl("https://ykmart.in/assets/img/IMG-20220210-WA0049a.jpg"),
            handler: async function (response) {
                setLoading(true);
                try {
                    const orderParams = cartItems.map(item => {
                        // Numeric cleanup
                        const priceVal = parseFloat(item.Price1 || item.Price || 0);
                        const qty = parseInt(item.quantity || 1);
                        const total = priceVal * qty;
                        const gstVal = parseFloat(item.GST || item.GstPrice || 0);

                        // Extract size string - fallback to a number-like string if possible
                        // Some backends expect IDs here, others expect labels. 
                        // We use the label from the pack selection.
                        const actualSize = (item[item.selectedPack] || item.Pack1 || item.Size || "1").toString();

                        const currentUserId = (userData.id || userData.Id || userData.UserId || "0").toString();
                        const productId = (item.Productid || item.ProductId || "0").toString();
                        const finalAddressId = addressId.toString();
                        const txnId = (response.razorpay_payment_id || Date.now().toString()).toString();

                        return {
                            "CustomerID": currentUserId,
                            "PaymentType": "online",
                            "ProductId": productId,
                            "Quantity": qty.toString(),
                            "Size": actualSize,
                            "Price": priceVal.toString(),
                            "TotalPrice": total.toString(),
                            "ProductName": (item.productname || item.ProductName || "").toString(),
                            "productname": (item.productname || item.ProductName || "").toString(),
                            "TransactionID": txnId,
                            "TransactionStatus": "Success",
                            "GstPrice": gstVal.toString(),
                            "AddressId": finalAddressId,
                            "HNo": activeAddr?.HNo || shippingData.hno || "",
                            "Area": activeAddr?.Area || shippingData.area || "",
                            "City": activeAddr?.City || shippingData.city || "",
                            "State": activeAddr?.State || shippingData.state || "",
                            "Pincode": activeAddr?.Pincode || activeAddr?.PinCode || shippingData.pincode || "",
                            "MobileNo": activeAddr?.MobileNo || shippingData.mobile || "",
                            "Device": "Web",
                            "OfferPrice": "0",
                            "DeliveryCharge": "0",
                            "CreatedBy": currentUserId
                        };
                    });

                    const orderFormData = new FormData();
                    orderFormData.append("Param", JSON.stringify(orderParams));

                    console.log("Placing order with params:", orderParams);

                    // Set a timeout for the fetch call
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                    console.log("Executing fetch to:", `${apiBaseUrl}/api/Products/Insert_Customer_Orders`);
                    const orderRes = await fetch(`${apiBaseUrl}/api/Products/Insert_Customer_Orders`, {
                        method: "POST",
                        body: orderFormData,
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json, text/plain, */*'
                        }
                    });
                    clearTimeout(timeoutId);

                    console.log("Fetch status:", orderRes.status);
                    const responseText = await orderRes.text();
                    console.log("Order API raw response:", responseText);

                    // Treat any successful HTTP response with content as success
                    // The API may return JSON, a number, "true", or any text — all mean success
                    let result = null;
                    if (orderRes.ok && responseText && responseText.trim().length > 0) {
                        try {
                            result = JSON.parse(responseText);
                        } catch (e) {
                            // Response is not JSON — that's fine, treat as success
                            result = responseText.trim();
                        }
                    }
                    console.log("Parsed result:", result);

                    if (result) {
                        try {
                            // Construct email payload
                            // Map cart items to the structure expected by the email API
                            const emailOrderData = cartItems.map(item => {
                                let price = item.Price1 || item.Price || 0;
                                if (item.selectedPack === "Pack2") price = item.Price2 || price;
                                if (item.selectedPack === "Pack3") price = item.Price3 || price;

                                // Extract order ID in a robust way (handling strings, objects, numbers)
                                const extractOrderId = (res, fallback) => {
                                    if (!res) return fallback;
                                    if (typeof res === 'object') {
                                        return res.OrderId || res.OrderID || res.id || res.Id || fallback;
                                    }
                                    if (typeof res === 'string') {
                                        const cleanRes = res.replace(/['"]/g, '').trim();
                                        if (cleanRes.startsWith('YK') || !isNaN(cleanRes) || cleanRes.startsWith('ORD')) return cleanRes;
                                    }
                                    return fallback;
                                };

                                const orderId = extractOrderId(result, response.razorpay_payment_id || Date.now().toString());

                                return {
                                    "FarmerName": userData.name || "Customer",
                                    "OrderID": orderId.toString(),
                                    "MobileNo": userData.mobile || shippingData.mobile || "",
                                    "ProductName": (item.productname || item.ProductName || "").toString(),
                                    "Quantity": parseInt(item.quantity || 1),
                                    "Price": price.toString()
                                };
                            });

                            // Send email in background - don't await to avoid blocking UI
                            sendOrderEmail(emailOrderData).catch(err => console.error("Background email failed", err));

                            // Send push notification to admins in background
                            const finalOrderId = emailOrderData[0]?.OrderID || response.razorpay_payment_id || Date.now().toString();
                            sendAdminPushNotification(finalOrderId, userData.name || shippingData.fullName || "Customer", finalAmount.toFixed(2)).catch(err => console.error("Background push notification failed", err));
                        } catch (emailErr) {
                            console.error("Failed to prepare order email", emailErr);
                        }

                        localStorage.setItem('yk_toast', JSON.stringify({ message: "Order placed successfully", type: "success" }));
                        window.dispatchEvent(new Event('yk_trigger_toast')); // Immediate trigger for Header
                        try {
                            setCartItems([]);
                            console.log("Cart cleared, navigating to /orders...");
                            navigate("/orders");
                        } catch (navError) {
                            console.error("Navigation failed:", navError);
                            window.location.href = "/orders"; // Use hard redirect if reach-router navigate fails
                        }
                    } else {
                        console.warn("Order registration failed - response not success");
                        alert("Your payment was successful, but we couldn't register the order automatically. Please contact support with Payment ID: " + response.razorpay_payment_id);
                    }
                } catch (error) {
                    console.error("Error placing order:", error);
                    if (error.name === 'AbortError') {
                        alert("Order processing is taking too long. Please check 'My Orders' in a few minutes or contact support if the payment was deducted.");
                    } else {
                        alert("Order placement failed. Please check your internet connection.");
                    }
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: shippingData.fullName,
                email: shippingData.email,
                contact: shippingData.mobile,
            },
            theme: { color: "#28a745" },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="mb-4">
                    <FiArrowLeft size={48} className="text-muted" />
                </div>
                <h2>Your cart is empty</h2>
                <p className="text-muted">Looks like you haven't added anything to your cart yet.</p>
                <button className="btn btn-success mt-3 px-4" onClick={() => navigate("/")}>Go Shopping</button>
            </div>
        );
    }

    return (
        <div className="container mt-2 mb-5">
            <Breadcrumb />
                <div className="row mt-4">
                    <div className="col-lg-8">
                        {/* Step 1: Address */}
                        <div className={`card shadow-sm border-0 mb-4 ${step !== 1 ? 'opacity-50' : ''}`}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-bold mb-0">1. Delivery Address</h4>
                                    {step === 2 && (
                                        <button className="btn btn-sm btn-outline-success" onClick={() => setStep(1)}>
                                            Change Address
                                        </button>
                                    )}
                                </div>

                                {step === 1 && (
                                    <>
                                        {!showAddressForm && addresses.length > 0 && (
                                            <div className="mb-4">
                                                <div className="row g-3">
                                                    {addresses.map((addr) => (
                                                        <div key={addr.Id} className="col-md-6">
                                                            <div
                                                                className={`address-card ${selectedAddressId?.toString() === addr.Id?.toString() ? 'selected' : ''}`}
                                                                onClick={() => setSelectedAddressId(addr.Id)}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <div className="d-flex align-items-center">
                                                                        <input
                                                                            type="radio"
                                                                            className="form-check-input mt-0 me-2"
                                                                            checked={selectedAddressId?.toString() === addr.Id?.toString()}
                                                                            readOnly
                                                                        />
                                                                        {selectedAddressId?.toString() === addr.Id?.toString() && <FiCheck className="text-success me-1" />}
                                                                    </div>
                                                                    {!addr.isProfile && (
                                                                        <button
                                                                            className="btn btn-link text-danger p-0 delete-addr-btn"
                                                                            onClick={(e) => handleDeleteAddress(addr.Id, e)}
                                                                            title="Remove Address"
                                                                        >
                                                                            <FiTrash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="fw-bold mb-1 text-truncate">{addr.displayLabel}</div>
                                                                <div className="small text-muted mb-2 lh-sm">
                                                                    {addr.HNo}{addr.Area ? `, ${addr.Area}` : ''}<br />
                                                                    {addr.City}{addr.State ? `, ${addr.State}` : ''} {addr.Pincode || addr.PinCode ? `- ${addr.Pincode || addr.PinCode}` : ''}
                                                                </div>
                                                                <div className="small fw-medium text-success">Ph: {addr.MobileNo || userData.mobile}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="col-md-6">
                                                        <div className="add-address-btn h-100 d-flex flex-column align-items-center justify-content-center" onClick={() => setShowAddressForm(true)}>
                                                            <FiPlus size={24} className="mb-2" />
                                                            <span>Add New Address</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(showAddressForm || addresses.length === 0) && (
                                            <div className="row g-3">
                                                <div className="col-12 d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="mb-0 text-success">Add New Delivery Address</h6>
                                                    {addresses.length > 0 && (
                                                        <button type="button" className="btn btn-link text-muted text-decoration-none p-0" onClick={() => setShowAddressForm(false)}>
                                                            Select Existing
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Full Name</label>
                                                    <input type="text" name="fullName" className="form-control" value={shippingData.fullName} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Mobile Number</label>
                                                    <input type="tel" name="mobile" className="form-control" value={shippingData.mobile} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">H.No / Door No</label>
                                                    <input type="text" name="hno" className="form-control" value={shippingData.hno} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Area / Street</label>
                                                    <input type="text" name="area" className="form-control" value={shippingData.area} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-12">
                                                    <label className="form-label">Landmark (Optional)</label>
                                                    <input type="text" name="landmark" className="form-control" value={shippingData.landmark} onChange={handleInputChange} />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">City</label>
                                                    <input type="text" name="city" className="form-control" value={shippingData.city} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">State</label>
                                                    <input type="text" name="state" className="form-control" value={shippingData.state} onChange={handleInputChange} required />
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label">Pincode</label>
                                                    <input type="text" name="pincode" className="form-control" value={shippingData.pincode} onChange={handleInputChange} required />
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 text-end">
                                            <button
                                                className="btn btn-success px-5 py-2 fw-bold"
                                                onClick={handleConfirmAddress}
                                                disabled={loading}
                                            >
                                                {loading ? 'Processing...' : 'Deliver to this Address'}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {step === 2 && selectedAddressId && (
                                    <div className="p-3 bg-light rounded border-start border-success border-4">
                                        <div className="d-flex align-items-center mb-1">
                                            <FiMapPin className="text-success me-2" />
                                            <span className="fw-bold">Selected Address</span>
                                        </div>
                                        <div className="small text-muted ps-4">
                                            {addresses.find(a => a.Id === selectedAddressId)?.HNo || shippingData.hno}, {addresses.find(a => a.Id === selectedAddressId)?.Area || shippingData.area}, {addresses.find(a => a.Id === selectedAddressId)?.City || shippingData.city}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Payment */}
                        <div className={`card shadow-sm border-0 mb-4 ${step !== 2 ? 'opacity-50' : ''}`}>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-4">2. Payment Method</h4>
                                {step === 2 ? (
                                    <>
                                        <div className="payment-options mb-4">
                                            <div className="card border-success bg-light opacity-100">
                                                <div className="card-body d-flex align-items-center">
                                                    <div className="bg-success text-white p-2 rounded-circle me-3">
                                                        <FiCreditCard />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold">Online Payment (Razorpay)</div>
                                                        <div className="small text-muted">UPI, Cards, NetBanking, Wallets</div>
                                                    </div>
                                                    <FiCheck className="ms-auto text-success" size={24} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                                                <FiArrowLeft className="me-2" /> Back to Address
                                            </button>
                                            <button
                                                className="btn btn-success btn-lg px-5 shadow-sm"
                                                onClick={handlePayment}
                                                disabled={loading}
                                            >
                                                {loading ? 'Processing...' : `Pay ₹${finalAmount.toFixed(2)} Now`}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-muted small italic">Please confirm your delivery address to proceed to payment.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card shadow-sm border-0 summary-card">
                            <div className="card-body p-4">
                                <h5 className="fw-bold mb-4">Order Summary</h5>
                                {cartItems.map((item, idx) => {
                                    let price = item.Price1 || item.Price || 0;
                                    if (item.selectedPack === "Pack2") price = item.Price2 || price;
                                    if (item.selectedPack === "Pack3") price = item.Price3 || price;
                                    return (
                                        <div key={idx} className="d-flex justify-content-between mb-3 align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-light p-2 rounded me-2 small">
                                                    {item.quantity}x
                                                </div>
                                                <div className="small fw-medium text-truncate" style={{ maxWidth: '150px' }}>{item.productname || item.ProductName}</div>
                                            </div>
                                            <span className="small fw-bold">₹{(price * (item.quantity || 1)).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                                <hr className="my-4" />
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-success">
                                    <span>Delivery</span>
                                    <span className="fw-bold">FREE</span>
                                </div>
                                <hr className="my-4" />
                                <div className="d-flex justify-content-between mb-0 h4 fw-bold">
                                    <span>Total</span>
                                    <span className="text-success">₹{finalAmount.toFixed(2)}</span>
                                </div>

                                {step === 2 && (
                                    <div className="mt-4 p-3 bg-light rounded small text-muted text-center border">
                                        <FiCheck className="text-success me-1" /> SECURE CHECKOUT
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default Checkout;
