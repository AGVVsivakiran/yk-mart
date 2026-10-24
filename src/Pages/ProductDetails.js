import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiHeart, FiShare2, FiArrowLeft } from 'react-icons/fi';
import { FaStar, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { UserContext } from '../Controllers/UserContext';
import Variables from '../Variables.json';
import { Helmet } from 'react-helmet-async';
import './ProductDetails.css';
import Breadcrumb from '../Components/Breadcrumb';
import { sendOrderEmail, sendAdminPushNotification } from '../Services/EmailService';

const baseUrl = Variables.baseUrl;
// Compute API base URL once at module level so ALL functions can access it
// Covers BOTH production domains: ykmart.in and ykmart.breakingindiaapp.com
const isProduction = window.location.origin.includes("ykmart.in") || window.location.origin.includes("breakingindiaapp.com");
const apiBaseUrl = isProduction ? "/webservices" : baseUrl;

// Utility to ensure URLs use production domain instead of localhost
// and enforce HTTPS for security/CORS compliance
const formatUrl = (url) => {
  if (!url) return "";
  let formatted = url.toString();
  // Replace localhost or local IP with production domain
  if (formatted.includes('localhost') || formatted.includes('127.0.0.1')) {
    formatted = formatted.replace(/http:\/\/localhost:7070/g, "https://ykmart.in/webservices");
    formatted = formatted.replace(/http:\/\/127\.0\.0\.1:7070/g, "https://ykmart.in/webservices");
  }

  // Ensure absolute URL for social images
  if (!formatted.startsWith('http') && !formatted.startsWith('data:')) {
    const cleanPath = formatted.startsWith('/') ? formatted.substring(1) : formatted;
    formatted = `https://ykmart.in/webservices/${cleanPath}`;
  }

  return formatted;
};

export default function ProductDetails() {
  const { ProductName } = useParams();
  const location = useLocation();
  const categoryName = location.state?.categoryName;
  const {
    setWishlistItems, setCartItems, wishlistItems, cartItems, userData, addToWishlist,
    setShowAuthModal, setAuthType
  } = useContext(UserContext);

  const [productData, setProductData] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPack, setSelectedPack] = useState('Pack1');
  const [quantity, setQuantity] = useState(1);
  const [addressDetails, setAddressDetails] = useState(null);
  const [paymentType, setPaymentType] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Magnifier State
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});

  const navigate = useNavigate();

  // NEW STATE FOR TABS
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (ProductName) {
      fetchProductDetails();
    }
  }, [ProductName]);

  useEffect(() => {
    if (productData) {
      fetchProductImages(productData.Productid);

      // Set default active tab based on available data
      if (productData.ProductInfo) setActiveTab('info');
      else if (productData.Benefits) setActiveTab('benefits');
      else if (productData.Dosage) setActiveTab('dosage');
      else if (productData.RecommendedCrops) setActiveTab('crops');

      // Meta tags are now managed via react-helmet-async within the component's JSX.
    }
  }, [productData]);

  useEffect(() => {
    if (userData.isLoggedIn) {
      getCustomerAddress();
    }
  }, [userData]);

  const getCustomerAddress = async () => {
    const addressData = [{
      UserId: userData.id.toString()
    }];

    console.log('Fetching address for UserId:', userData.id);

    const formData = new FormData();
    formData.append('Param', JSON.stringify(addressData));

    try {
      const response = await fetch(`${baseUrl}/api/Products/Get_Customer_Address_Based_On_Id`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log('Address API Response:', data);

      const addressList = Array.isArray(data) ? data : (data && data.Id ? [data] : []);

      if (addressList.length > 0) {
        setAddressDetails(addressList);
      } else {
        console.warn('No address found for user');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const safeDecode = (str) => {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      // If decoding fails (usually because of a stray %), return original string
      return str;
    }
  };

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const formdata = new FormData();
      let nameWithSpaces;

      if (location.state?.productName) {
        nameWithSpaces = location.state.productName;
        formdata.append("ProductName", nameWithSpaces);

        const requestOptions = {
          method: "POST",
          body: formdata,
          redirect: "follow"
        };

        const response = await fetch(`${baseUrl}/api/Products/GetAllCategoryWiseProductsBasedOnProductName`, requestOptions);
        const result = await response.json();

        if (Array.isArray(result) && result.length > 0) {
          setProductData(result[0]);
          return;
        }
      }

      // If no location.state.productName or the first call failed, fallback to searching via slugs
      const decodedParam = decodeURIComponent(ProductName);
      const searchSlug = decodedParam.toLowerCase();

      // 1. Try exact match using decodedParam (e.g. "fost-rootex" exactly matches "FOST-ROOTEX" instantly)
      const exactFormData = new FormData();
      exactFormData.append("ProductName", decodedParam);
      try {
        const exactRes = await fetch(`${baseUrl}/api/Products/GetAllCategoryWiseProductsBasedOnProductName`, {
            method: "POST", body: exactFormData, redirect: "follow"
        });
        const exactResult = await exactRes.json();
        if (Array.isArray(exactResult) && exactResult.length > 0) {
          setProductData(exactResult[0]);
          return;
        }
      } catch (exactErr) {
        console.warn("Exact param fetch failed, trying legacys...", exactErr);
      }

      // First try the old exact match replacement fallback just in case
      let legacyName = decodedParam
          .replace(/-/g, " ")
          .replace(/%2F|\/+/g, " ")       // fix for slash
          .replace(/%26|&/g, " & ")        // fix for &
          .replace(/\s+/g, " ")            // remove extra spaces
          .trim();

      const formdata2 = new FormData();
      formdata2.append("ProductName", legacyName);
      const res2 = await fetch(`${baseUrl}/api/Products/GetAllCategoryWiseProductsBasedOnProductName`, {
          method: "POST", body: formdata2, redirect: "follow"
      });
      const result2 = await res2.json();
      if (Array.isArray(result2) && result2.length > 0) {
        setProductData(result2[0]);
        return;
      }

      // If STILL not found, fetch ALL products and match by slug! (Handles Chart Bot direct links)
      const allFormData = new FormData();
      allFormData.append('productName', JSON.stringify([{ productname: "" }]));
      const allRes = await fetch(`${baseUrl}/api/Products/GetAll_SearchingProducts`, {
        method: "POST", body: allFormData
      });
      const allProducts = await allRes.json();
      
      if (Array.isArray(allProducts)) {
        const foundProduct = allProducts.find(p => {
          const productSlug = p.productname
            .trim()
            .replace(/[^\w\s-]/g, "") // remove special chars
            .replace(/\s+/g, "-")     // spaces to hyphens
            .toLowerCase();
          return productSlug === searchSlug;
        });

        if (foundProduct) {
          // Got it from the slug! Call exact API one last time to get full details
          const exactForm = new FormData();
          exactForm.append("ProductName", foundProduct.productname);
          const exactRes = await fetch(`${baseUrl}/api/Products/GetAllCategoryWiseProductsBasedOnProductName`, {
            method: "POST", body: exactForm, redirect: "follow"
          });
          const exactResult = await exactRes.json();
          if (Array.isArray(exactResult) && exactResult.length > 0) {
            setProductData(exactResult[0]);
          } else {
             setProductData(foundProduct);
          }
        }
      }

    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId) => {
    try {
      const formdata = new FormData();
      formdata.append("Param", productId.toString());

      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow"
      };

      const response = await fetch(`${baseUrl}/api/Products/GetAll_ProductImagesBasedonProductId`, requestOptions);
      const result = await response.json();

      if (Array.isArray(result)) {
        setProductImages(result);
      }
    } catch (error) {
      console.error("Error fetching product images:", error);
      setProductImages([]);
    }
  };

  const decodeHtml = (html) => {
    if (!html) return '';

    let decoded = decodeURIComponent(html);

    const txt = document.createElement('textarea');
    txt.innerHTML = decoded;
    return txt.value;
  };

  const renderHtmlContent = (encodedHtml) => {
    if (!encodedHtml) return null;

    try {
      const decodedHtml = decodeHtml(encodedHtml);
      return <div dangerouslySetInnerHTML={{ __html: decodedHtml }} />;
    } catch (error) {
      console.error('Error decoding HTML:', error);
      return <div>{encodedHtml}</div>;
    }
  };

  const toggleWishlist = (product) => {
    addToWishlist(product);
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.Productid === productId);
  };

  const handleAddToCart = () => {
    if (!productData) return;

    const exists = cartItems.some(item => item.Productid === productData.Productid);

    if (!exists) {
      setCartItems(prevItems => [...prevItems, {
        ...productData,
        quantity: quantity,
        selectedPack: selectedPack
      }]);
      alert('Product added to cart!');
    } else {
      alert('Product already in cart!');
    }
  };

  const getPackOptions = () => {
    if (!productData) return [];

    const packs = [];

    if (productData.Pack1) packs.push({ key: 'Pack1', label: productData.Pack1, price: productData.Price1 });
    if (productData.Pack2) packs.push({ key: 'Pack2', label: productData.Pack2, price: productData.Price2 });
    if (productData.Pack3) packs.push({ key: 'Pack3', label: productData.Pack3, price: productData.Price3 });
    if (productData.Pack4) packs.push({ key: 'Pack4', label: productData.Pack4, price: productData.Price4 });

    return packs;
  };

  const getCurrentPrice = () => {
    if (!productData) return 0;
    const priceKey = selectedPack.replace('Pack', 'Price');
    return parseFloat(productData[priceKey]) || 0;
  };

  const getCurrentGST = () => {
    if (!productData) return 0;
    return parseFloat(productData.GST) || 0;
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

  const RazorPayPayment = async () => {
    if (!userData.isLoggedIn) {
      setAuthType("login");
      setShowAuthModal(true);
      return;
    }

    if (!addressDetails || !addressDetails[0] || !addressDetails[0].Id) {
      alert('Please add address for Delivery.');
      return;
    }

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    const amount = currentPrice * quantity * 100;

    const options = {
      description: 'YKMart',
      image: formatUrl('https://ykmart.in/logo.png'),
      currency: 'INR',
      key: Variables.razorpayKey,
      payment_id: Date.now(),
      payment_capture: '1',
      amount: amount,
      name: "YKMart",
      prefill: {
        contact: userData.mobile ? `+91${userData.mobile}` : '',
        name: userData.name || ''
      },
      theme: {
        color: '#008cb3'
      },
      handler: razorPayHandler
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const razorPayHandler = (response) => {
    console.log(response);
    if (response.razorpay_payment_id) {
      console.log('Payment Successful:', response.razorpay_payment_id);
      InsertUserDirect(response.razorpay_payment_id);
    } else {
      console.log('Payment failed or cancelled');
    }
  };

  const InsertUserDirect = async (paymentId) => {
    const transactionId = Date.now().toString();
    const currentPriceStr = currentPrice.toString();
    const totalPriceStr = (currentPrice * quantity).toString();
    const gstStr = (gst || 0).toString();
    const currentUserId = (userData.id || userData.Id || userData.UserId || "0").toString();
    const productId = (productData.Productid || productData.ProductId || "0").toString();
    const finalAddressId = (addressDetails && addressDetails[0] && addressDetails[0].Id ? addressDetails[0].Id : "0").toString();

    const orderData = {
      "CustomerID": currentUserId,
      "PaymentType": "online",
      "ProductId": productId,
      "Quantity": quantity.toString(),
      "Size": (productData[selectedPack] || "1").toString(),
      "Price": currentPriceStr,
      "TotalPrice": totalPriceStr,
      "TransactionID": transactionId,
      "TransactionStatus": "Success",
      "GstPrice": gstStr,
      "AddressId": finalAddressId,
      "Device": "Web",
      "OfferPrice": "0",
      "DeliveryCharge": "0",
      "CreatedBy": currentUserId
    };

    console.log('Direct Razorpay Order Data:', orderData);

    const formData = new FormData();
    formData.append('Param', JSON.stringify([orderData]));

    try {
      console.log('Calling Insert_Customer_Orders API to:', `${apiBaseUrl}/api/Products/Insert_Customer_Orders`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${apiBaseUrl}/api/Products/Insert_Customer_Orders`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });
      clearTimeout(timeoutId);

      console.log('Insert_Customer_Orders status:', response.status);
      const responseText = await response.text();
      console.log('Order API raw response:', responseText);

      // Treat any successful HTTP response with content as success
      // The API may return JSON, a number, "true", or any text — all mean success
      let data = null;
      if (response.ok && responseText && responseText.trim().length > 0) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          // Response is not JSON — that's fine, treat as success
          data = responseText.trim();
        }
      }
      console.log('Parsed result:', data);
      if (data) {
        try {
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

          const orderId = extractOrderId(data, transactionId);
          const emailOrderData = [{
            "FarmerName": userData.name || "Customer",
            "OrderID": orderId.toString(),
            "MobileNo": userData.mobile || "",
            "ProductName": (productData.productname || "").toString(),
            "Quantity": quantity,
            "Price": currentPrice.toString()
          }];
          // Send email in background - don't await to avoid blocking UI
          sendOrderEmail(emailOrderData).catch(err => console.error("Background email failed", err));

          // Send push notification to admins in background
          sendAdminPushNotification(orderId, userData.name || "Customer", totalPriceStr).catch(err => console.error("Background push notification failed", err));
        } catch (emailErr) {
          console.error("Failed to prepare order email", emailErr);
        }

        alert('Your Order Placed Successfully');
        try {
          navigate('/orders');
        } catch (navError) {
          console.error("Navigation failed:", navError);
          window.location.href = "/orders";
        }
      } else {
        alert('Payment successful, but we could not register the order. Please contact support with Payment ID: ' + paymentId);
      }
    } catch (error) {
      console.error('Error placing direct order:', error);
      if (error.name === 'AbortError') {
        alert("Order is taking too long to process. Please check 'My Orders' shortly.");
      } else {
        alert('Error placing order. Please check your connection.');
      }
    }
  };

  const PlaceOrder = () => {
    if (!userData.isLoggedIn) {
      setAuthType("login");
      setShowAuthModal(true);
      return;
    }

    // Add current product to cart if not already there, then go to checkout
    const exists = cartItems.some(item => item.Productid === productData.Productid);
    if (!exists) {
      setCartItems(prevItems => [...prevItems, {
        ...productData,
        quantity: quantity,
        selectedPack: selectedPack
      }]);
    }

    navigate('/checkout');
  };

  const proceedToPayment = () => {
    setShowPaymentModal(false);
    if (paymentType === 'CashOnDelivery') {
      InsertUserCOD();
    } else if (paymentType === 'Online') {
      RedirectToPaymentGateway();
    }
  };

  const InsertUserCOD = async () => {
    const transactionId = Date.now();
    const totalAmount = currentPrice * quantity;

    const codOrderData = {
      userId: userData.id,
      addressId: addressDetails[0].Id,
      paymentMode: "COD",
      amount: totalAmount
    };

    console.log("COD Order Data:", codOrderData);

    const orderData = {
      CustomerID: userData.id,
      AddressId: addressDetails[0].Id,
      PaymentType: "CashOnDelivery",
      ProductId: productData.Productid,
      Quantity: quantity,
      Size: productData[selectedPack],
      Price: currentPrice,
      TransactionID: transactionId,
      GstPrice: gst,
      DeliveryCharge: 0,
      TotalPrice: currentPrice * quantity,
      OfferPrice: 0,
      CreatedBy: userData.id,
      Device: 'Web',
      TransactionStatus: 'Pending'
    };

    console.log('Full COD Order Data:', orderData);

    const formData = new FormData();
    formData.append('Param', JSON.stringify([orderData]));

    try {
      console.log('Calling Insert_Customer_Orders API for COD...');
      const response = await fetch(`${baseUrl}/api/Products/Insert_Customer_Orders`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log('COD API Response:', data);
      if (data) {
        try {
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

          const orderId = extractOrderId(data, transactionId);
          const emailOrderData = [{
            "FarmerName": userData.name || "Customer",
            "OrderID": orderId.toString(),
            "MobileNo": userData.mobile || "",
            "ProductName": (productData.productname || "").toString(),
            "Quantity": quantity,
            "Price": currentPrice.toString()
          }];
          await sendOrderEmail(emailOrderData);

          // Send push notification to admins in background
          sendAdminPushNotification(orderId, userData.name || "Customer", totalAmount.toString()).catch(err => console.error("Background push notification failed", err));
        } catch (emailErr) {
          console.error("Failed to send order email", emailErr);
        }

        alert('Your Order Placed Successfully');
        navigate('/orders');
      } else {
        alert('Order placement failed. Please try again.');
      }
    } catch (error) {
      console.error('Error placing COD order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const RedirectToPaymentGateway = async () => {
    const transactionId = Date.now();
    const subTotal = currentPrice * quantity;

    const bookingDetails = [{
      CustomerID: userData.id,
      AddressId: addressDetails[0].Id,
      PaymentType: "Online",
      ProductId: productData.Productid,
      Quantity: quantity,
      Size: productData[selectedPack],
      Price: currentPrice,
      TransactionID: transactionId,
      GstPrice: gst,
      DeliveryCharge: 0,
      TotalPrice: subTotal,
      OfferPrice: 0,
      CreatedBy: userData.id,
      Device: 'Web'
    }];

    console.log('Redirect Payment Booking Details:', bookingDetails);

    const formData = new FormData();
    formData.append('Name', userData.name || '');
    formData.append('Mobile', userData.mobile || '');
    formData.append('Email', userData.email || '');
    formData.append('Amount', subTotal);
    formData.append('Productinfo', "Product");
    formData.append('TransactionId', transactionId);
    formData.append('BookingDetails', JSON.stringify(bookingDetails));

    try {
      console.log('Calling PaymentGateWayWEB API...');
      const response = await fetch(`${baseUrl}/api/Products/PaymentGateWayWEB`, {
        method: 'POST',
        body: formData
      });
      const data = await response.text();
      console.log('PaymentGateWayWEB Response:', data);
      if (data) {
        window.location.href = data;
      } else {
        alert('Payment gateway initialization failed.');
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment. Please try again.');
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;

    setZoomPos({ x, y });
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${baseUrl + (images[selectedImage]?.UImage || productData.Image)})`
    });
  };

  const handleMouseEnter = () => setShowZoom(true);
  const handleMouseLeave = () => setShowZoom(false);

  if (loading) {
    return <div className="loading-container">Loading product details...</div>;
  }

  if (!productData) {
    return <div className="error-container">Product not found</div>;
  }

  const images = productImages.length > 0 ? productImages : [{ UImage: productData.Image }];
  const packOptions = getPackOptions();
  const currentPrice = getCurrentPrice();
  const gst = getCurrentGST();

  // Determine available tabs
  const availableTabs = [];
  if (productData.ProductInfo) availableTabs.push({ id: 'info', label: 'Product Information' });
  if (productData.Benefits) availableTabs.push({ id: 'benefits', label: 'Benefits' });
  if (productData.Dosage) availableTabs.push({ id: 'dosage', label: 'Dosage & Application' });
  if (productData.RecommendedCrops) availableTabs.push({ id: 'crops', label: 'Recommended For' });
  // This code is wrote by vishnu for share Facebook and Whatsapp 28-06-2024


  const shareProductNative = async () => {
    if (!navigator.share || !navigator.canShare) {
      alert("Native sharing not supported");
      return;
    }

    try {
      const imageUrl = baseUrl + (images[0]?.UImage || productData.Image);
      const blob = await fetch(imageUrl).then(res => res.blob());

      const file = new File([blob], "product.jpg", { type: blob.type });

      await navigator.share({
        title: productData.productname,
        text: `Check out this product on YK Mart`,
        files: [file]
      });

    } catch (err) {
      console.error(err);
    }
  };


  const getProductShareData = () => {
    const url = `https://ykmart.in/product/${encodeURIComponent(productData.productname)}`;

    const image = formatUrl(productData.Image || 'https://ykmart.in/logo.png');

    const plainDesc = productData.ProductInfo
      ? productData.ProductInfo.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
      : '';

    // Get a clean short description
    const cleanOneLine = plainDesc.length > 150 ? plainDesc.substring(0, 147) + '...' : plainDesc;

    // WhatsApp logic: URL AT THE TOP ensures the Rich Preview displays correctly immediately.
    const text = `${url}\n\n🛒 *${productData.productname} - ${productData.CategoryName}*\n💰 *Price:* ₹${currentPrice}\n\n${cleanOneLine}\n\n✅ *Organic & Natural products*\n📦 *Powered by YK Mart*`;

    return { url, text, image };
  };

  const shareOnFacebook = () => {
    if (!productData) return;

    const { url } = getProductShareData();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    window.open(facebookUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  const shareOnWhatsapp = () => {
    if (!productData) return;

    const { text } = getProductShareData();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };



  return (
    <div className="container mt-2">
      {productData && (
        <Helmet>
          <title>{`${productData.productname} | YK Mart`}</title>
          <meta name="description" content={`Buy ${productData.productname} at YK Mart. Premium quality ${productData.CategoryName || 'product'} available for ₹${productData.Price1 || '0'}.`} />
          <meta name="keywords" content={`${productData.productname}, ${productData.CategoryName || ''}, buy online India, YK Mart, organic farming, natural agri products`} />
          <link rel="canonical" href={`https://ykmart.in/product/${encodeURIComponent(productData.productname)}`} />
          <meta property="og:title" content={`${productData.productname} | YK Mart`} />
          <meta property="og:description" content={`Order ${productData.productname} on YK Mart. Price: ₹${productData.Price1 || '0'}. Premium quality ${productData.CategoryName || 'product'}.`} />
          <meta property="og:url" content={`https://ykmart.in/product/${encodeURIComponent(productData.productname)}`} />
          <meta property="og:image" content={formatUrl(productData.Image || 'https://ykmart.in/logo.png')} />
          <meta property="og:image:secure_url" content={formatUrl(productData.Image || 'https://ykmart.in/logo.png')} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={productData.productname} />
          <meta property="og:type" content="product" />
          <meta property="og:site_name" content="YK Mart" />
          <meta property="og:locale" content="en_IN" />
          <meta property="product:price:amount" content={productData.Price1 || '0'} />
          <meta property="product:price:currency" content="INR" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${productData.productname} - Buy Online at Best Price | YK Mart`} />
          <meta name="twitter:description" content={productData.ProductInfo ? productData.ProductInfo.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 155) : ''} />
          <meta name="twitter:image" content={formatUrl(productData.Image || 'https://ykmart.in/logo.png')} />
          <meta name="twitter:image:alt" content={productData.productname} />
          <script type="application/ld+json">
            {`
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${productData.productname}",
  "description": "${productData.ProductInfo ? productData.ProductInfo.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().substring(0, 155) : ''}",
  "image": "${productData.Image ? (productData.Image.startsWith('http') ? productData.Image : `${baseUrl}${productData.Image}`) : 'https://ykmart.in/logo.png'}",
  "url": "https://ykmart.in/product/${encodeURIComponent(productData.productname)}",
  "sku": "${productData.Productid}",
  "brand": {"@type": "Brand", "name": "YK Mart"},
  "offers": {"@type": "Offer", "priceCurrency": "INR", "price": "${productData.Price1 || '0'}", "availability": "https://schema.org/InStock", "url": "https://ykmart.in/product/${encodeURIComponent(productData.productname)}", "seller": {"@type": "Organization", "name": "YK Mart"}}
}
`}
          </script>
        </Helmet>
      )}
      <Breadcrumb categoryName={categoryName} productName={productData?.productname} />
      {(location.state?.fromHarvest || productData?.CategoryId === 38 || productData?.CategoryId === "38" || productData?.CategoryName === "YK Harvest") && (
          <button className="back-btn-harvest" onClick={() => navigate('/harvest')}>
            <FiArrowLeft size={18} /> Back to Harvest
          </button>
        )}
        <div className="product-details-container productpages">
          <div className="product-details-wrapper">

            <div className="productimagesection">
              <div className="gallery-layout">
                {/* Thumbnail Gallery (Amazon Style - Sidebar on Left) */}
                <div className="thumbnail-gallery-sidebar">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                      onMouseEnter={() => setSelectedImage(index)}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={formatUrl(baseUrl + img.UImage)}
                        alt={`${productData.productname} ${index + 1}`}
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
                      src={formatUrl(baseUrl + (images[selectedImage]?.UImage || productData.Image))}
                      alt={productData.productname}
                      className="display-image"
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
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              <h1 className="product-title">{productData.productname}</h1>

              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="star" />
                  ))}
                </div>
                <span className="rating-text">5 Rate</span>
                <a href="#reviews" className="reviews-link">Reviews</a>
              </div>

              {/* Before update by vishnu */}
              {/* <div className="share-buttons">
                <span>Share</span>
                <button className="share-btn facebook"><FaFacebook /></button>
                <button className="share-btn whatsapp"><FaWhatsapp /></button>
              </div> */}
              {/* After update by vishnu 28-06-2024 */}
              <div className="share-buttons">
                <span>Share</span>

                {/* Facebook → URL based share */}
                <button className="share-btn facebook" onClick={shareOnFacebook}>
                  <FaFacebook />
                </button>

                {/* WhatsApp → Text + URL */}
                <button className="share-btn whatsapp" onClick={shareOnWhatsapp}>
                  <FaWhatsapp />
                </button>

                {/* Optional: Native Share (mobile share sheet) */}
                <button className="share-btn native" onClick={shareProductNative}>
                  Share
                </button>
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
                <span className="price-value">₹{currentPrice.toFixed(2)}</span>
                <span className="gst-info">GST Included ({gst}%)</span>
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
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="buy-now-btn" onClick={PlaceOrder}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          <div className="description-sections">
            <h3>Product Information</h3>
            <div className="description-content">
              {renderHtmlContent(productData.ProductInfo) || <p style={{ color: '#888' }}>No data available</p>}
            </div>
          </div>
          <div className="description-sections">
            <h3>Benefits</h3>
            <div className="description-content">
              {renderHtmlContent(productData.Benefits) || <p style={{ color: '#888' }}>No data available</p>}
            </div>
          </div>
          {/* <div className="description-sections">
            <h3>Usages</h3>
            <div className="description-content">
              {renderHtmlContent(productData.Usages || productData.usages) || <p style={{ color: '#888' }}>No data available</p>}
            </div>
          </div> */}
          <div className="description-sections">
            <h3>Dosage & Application Method</h3>
            <div className="description-content">
              {renderHtmlContent(productData.Dosage) || <p style={{ color: '#888' }}>No data available</p>}
            </div>
          </div>
          <div className="description-sections">
            <h3>Recommended For</h3>
            <div className="description-content">
              {renderHtmlContent(productData.RecommendedCrops) || <p style={{ color: '#888' }}>No data available</p>}
            </div>
          </div>

          {/* NEW TABBED DETAILS SECTION - REPLACES OLD BOTTOM SECTIONS */}
          {/* {availableTabs.length > 0 && (
          <div className="tabbed-details-section">
            <div className="tabs-container">
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {activeTab === 'info' && productData.ProductInfo && (
                <div className="tab-panel">
                  <h3 className="tab-panel-title">Product Information</h3>
                  <div className="tab-panel-content">
                    {renderHtmlContent(productData.ProductInfo)}
                  </div>
                </div>
              )}

              {activeTab === 'benefits' && productData.Benefits && (
                <div className="tab-panel">
                  <h3 className="tab-panel-title">Benefits</h3>
                  <div className="tab-panel-content">
                    {renderHtmlContent(productData.Benefits)}
                  </div>
                </div>
              )}

              {activeTab === 'dosage' && productData.Dosage && (
                <div className="tab-panel">
                  <h3 className="tab-panel-title">Dosage & Application Method</h3>
                  <div className="tab-panel-content">
                    {renderHtmlContent(productData.Dosage)}
                  </div>
                </div>
              )}

              {activeTab === 'crops' && productData.RecommendedCrops && (
                <div className="tab-panel">
                  <h3 className="tab-panel-title">Recommended For</h3>
                  <div className="tab-panel-content">
                    {renderHtmlContent(productData.RecommendedCrops)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )} */}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <>
            <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}></div>
            <div className="payment-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Select Payment Method</h5>
                  <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="payment-option">
                    <input
                      type="radio"
                      name="paymentType"
                      id="cod"
                      value="CashOnDelivery"
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <label htmlFor="cod">Cash on Delivery</label>
                  </div>
                  <div className="payment-option">
                    <input
                      type="radio"
                      name="paymentType"
                      id="online"
                      value="Online"
                      onChange={(e) => setPaymentType(e.target.value)}
                    />
                    <label htmlFor="online">Online Payment</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                  <button className="proceed-btn" onClick={proceedToPayment} disabled={!paymentType}>Proceed</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
}