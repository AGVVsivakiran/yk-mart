import React, { createContext, useContext, useState } from 'react';


const translations = {
  en: {
    // Header
    sellOnBigHaat: 'Sell on YK Mart',
    bulkOrders: 'Bulk Order Inquiries',
    corporate: 'Corporate Site',
    missedCall: 'Missed Call To Order: 1800-3000-2434',
    searchProducts: 'Search products...',
    ykHarvest:'YK-Harvest',
    trackOrder: 'Track Order',
    wishlist: 'Wishlist',
    login: 'Login',
    cart: 'Cart',
    
    // Navigation
    home: 'Home',
    organicManure: 'Organic Manure',
    fungalBacterial: 'Fungal & Bacterial Special',
    vaayuYantra: 'Vaayu & Yantra',
    ykLaboratories: 'YK Laboratories Special',
    soilax: 'Soilax',
    petVeterinary: 'Pet and Veterinary',
    nanoSilver: 'Nano Silver PPM',
    naturalFumigant: 'Natural Fumigant',
    cosmetics: 'Cosmetics and Therapy',
    
    // Footer
    hotProducts: 'Hot products',
    quickLinks: 'Quick links',
    address: 'Address',
    aboutUs: 'About Us',
    contactUs: 'Contact Us',
    blog: 'Blog',
    customerLogin: 'Customer Login',
    adminLogin: 'Admin Login',
    privacyPolicy: 'Privacy policy',
    termsConditions: 'Terms & Conditions',
    weAccept: 'We Accept',
    customerLoginCall: 'Customer Login please call',
    addressText: 'SY.NO. 255, PLOT NO.3, EAST PART, KUNTLOOR (V), HAYATHNAGAR, R.R. DIST. TELANGANA - 501505. INDIA.',
    
    // Products
    immunoOrganic: 'IMMUNO-ORGANIC MANURE,500 ml',
    fostRootex: 'FOST-ROOTEX-ORGANIC MANURE',
    vaayuOrganic: 'VAAYU-ORGANIC SUCKING PEST,100ml',
    cureal: 'CUREAL-BOTANICAL BACTERICIDE & FUNGICIDE',
    maxSize: 'MAX SIZE-ORGANIC MANURE',
    neeOil: 'NEEMOIL-ORGANIC MANURE',
    pappayaChilli: 'PAPPAYA & CHILLI SPECIAL-YK LABORATORIES SPECIAL',
    tomatoSpecial: 'TOMATO SPECIAL-YK LABORATORIES SPECIAL',
    wiltSpecial: 'WILT SPECIAL',
    oxyveg: 'Oxyveg Cotton Special',
    
    addToCart: 'Add to Cart',
    viewDetails: 'View Details',
    buyNow: 'Buy Now',
    // Track order
    trackYourOrder: 'Track your order',
    orderId: 'Order ID',
    mobileNumber: 'Mobile Number',
    search: 'Search',
    trackingFor: 'Tracking for',
    currentStatus: 'Current status',
    stepPlaced: 'Placed',
    stepConfirmed: 'Confirmed',
    stepPacked: 'Packed',
    stepShipped: 'Shipped',
    stepOutForDelivery: 'Out for delivery',
    stepDelivered: 'Delivered',

    // Harvest
    cropReport: 'Crop Report',
    detailedInsights: 'Detailed organic-integrated performance insights and actionable next steps for the current cycle.',
    lastUpdated: 'Last updated',
    organicQuantityAndCompliance: 'Organic Quantity & Compliance',
    immediateActionPlan: 'Immediate Action Plan',
    operationalHighlights: 'Operational Highlights',
    organicQuantity: 'Organic Quantity',
    conventionalQuantity: 'Conventional Quantity',
    traceabilityNote: 'Traceability matched lot-wise dispatch',
    yourCart: 'Your Cart',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    proceedToCheckout: 'Proceed to Checkout',
    cartEmptyTitle: 'Your cart is empty',
    cartEmptyDesc: 'Add products to see them here.',
    saveToWishlist: 'Save to wishlist',
    addToWishlist: 'Add to wishlist',
    removeFromWishlist: 'Remove from wishlist',
    remove: 'Remove',
    youMayAlsoLike: 'You may also like',
    moveAllToCart: 'Move all to cart',
    noWishlist: 'No items in wishlist',
    congratulations: 'Congratulations!',
    accountCreated: 'Your account has been created and your order is confirmed.',
    signUpConfirmOrder: 'Sign Up & Confirm Order',
    fullNameLabel: 'Full Name (any name is fine for demo)',
    mobileLabel: 'Mobile Number (optional)',
    emailLabel: 'Email (optional)',
  },
  te: {
    // Header
    sellOnBigHaat: 'వైకే మార్ట్‌లో విక్రయించండి',
    bulkOrders: 'బల్క్ ఆర్డర్ విచారణలు',
    corporate: 'కార్పొరేట్ సైట్',
    missedCall: 'ఆర్డర్ చేయడానికి మిస్డ్ కాల్: 1800-3000-2434',
    searchProducts: 'ఉత్పత్తులను శోధించండి...',
    ykHarvest: 'వైకే-హార్వెస్ట్',
    trackOrder: 'ఆర్డర్ ట్రాక్ చేయండి',
    wishlist: 'విష్‌లిస్ట్',
    login: 'లాగిన్',
    cart: 'కార్ట్',
    
    // Navigation
    home: 'హోమ్',
    organicManure: 'సేంద్రీయ ఎరువు',
    fungalBacterial: 'ఫంగల్ & బ్యాక్టీరియల్ స్పెషల్',
    vaayuYantra: 'వాయువు & యంత్ర',
    ykLaboratories: 'YK లాబొరేటరీస్ స్పెషల్',
    soilax: 'సోయిలాక్స్',
    petVeterinary: 'పెట్ మరియు వెటరినరీ',
    nanoSilver: 'నానో సిల్వర్ PPM',
    naturalFumigant: 'సహజ ఫ్యూమిగెంట్',
    cosmetics: 'కాస్మెటిక్స్ మరియు థెరపీ',
    
    // Track order
    trackYourOrder: 'ఆర్డర్ ట్రాక్ చేయండి',
    orderId: 'ఆర్డర్ ID',
    mobileNumber: 'మొబైల్ నంబర్',
    search: 'శోధించండి',
    trackingFor: 'ట్రాకింగ్ కోసం',
    currentStatus: 'ప్రస్తుత స్థితి',
    stepPlaced: 'పెట్టబడింది',
    stepConfirmed: 'దృఢీకరించబడినది',
    stepPacked: 'ప్యాక్ చేయబడింది',
    stepShipped: 'షిప్ చేయబడింది',
    stepOutForDelivery: 'డెలివరీకి బయల్దేరింది',
    stepDelivered: 'డెలివరీ చేయబడింది',

    // Harvest
    cropReport: 'పంట నివేదిక',
    detailedInsights: 'ప్రస్తుత చక్రానికి కోసం సమగ్ర సేంద్రీయ పనితీరు సూచనలు మరియు అమలు చేసుకోదగిన తదుపరి చర్యలు.',
    lastUpdated: 'చివరి నవీకరణ',
    organicQuantityAndCompliance: 'సేంద్రియ పరిమాణం & అనుకూలత',
    immediateActionPlan: 'తక్షణ చర్యా ప్రణాళిక',
    operationalHighlights: 'ఆపరేషనల్ హైలైట్స్',
    organicQuantity: 'సేంద్రియ పరిమాణం',
    conventionalQuantity: 'సాంప్రదాయక పరిమాణం',
    traceabilityNote: 'ట్రేసబిలిటీ లాట్-వైజ్ డిస్పాచ్‌కు సరిపోయింది',
    wiltSpecial: 'విల్ట్ స్పెషల్',
    oxyveg: 'ఆక్సివెగ్ కాటన్ స్పెషల్',
    
    addToCart: 'కార్ట్‌కి జోడించండి',
    viewDetails: 'వివరాలు చూడండి',
    buyNow: 'ఇప్పుడు కొనండి',
    yourCart: 'మీ కార్ట్',
    orderSummary: 'ఆర్డర్ సారాంశం',
    subtotal: 'ఉప మొత్తము',
    delivery: 'డెలివరీ',
    proceedToCheckout: 'చెకౌట్‌కు కొనసాగండి',
    cartEmptyTitle: 'మీ కార్ట్ ఖాళీగా ఉంది',
    cartEmptyDesc: 'ఇక్కడ చూడటానికి ఉత్పత్తులను జత చేయండి.',
    saveToWishlist: 'విష్‌లిస్ట్‌లో సేవ్ చేయండి',
    addToWishlist: 'విష్‌లిస్ట్‌లో జోడించండి',
    removeFromWishlist: 'విష్‌లిస్ట్ నుంచి తొలగించండి',
    remove: 'తొలగించండి',
    youMayAlsoLike: 'మీకు ఇది కూడా నచ్చవచ్చు',
    moveAllToCart: 'అన్నింటిని కార్ట్‌కి మార్చండి',
    noWishlist: 'విష్‌లిస్ట్‌లో అంశాలు లేవు',
    congratulations: 'అభినందనలు!',
    accountCreated: 'మీ ఖాతా సృష్టించబడింది మరియు మీరు చేసిన ఆర్డర్ నిర్ధారించబడింది.',
    signUpConfirmOrder: 'సైన్ అప్ & ఆర్డర్‌ను నిర్ధారించండి',
    fullNameLabel: 'పూర్తి పేరు (డెమో కోసం ఏ పేరైనా సరిపోతుంది)',
    mobileLabel: 'మొబైల్ నంబర్ (ఐచ్ఛికం)',
    emailLabel: 'ఈమెయిల్ (ఐచ్ఛికం)',
  },
  hi: {
    // Header
    sellOnBigHaat: 'वाई के मार्ट पर बेचें',
    bulkOrders: 'थोक ऑर्डर पूछताछ',
    corporate: 'कॉर्पोरेट साइट',
    missedCall: 'ऑर्डर के लिए मिस्ड कॉल: 1800-3000-2434',
    searchProducts: 'उत्पाद खोजें...',
    ykHarvest: 'वाई के-हार्वेस्ट',
    trackOrder: 'ऑर्डर ट्रैक करें',
    wishlist: 'विशलिस्ट',
    login: 'लॉगिन',
    cart: 'कार्ट',
    
    // Navigation
    home: 'होम',
    organicManure: 'जैविक खाद',
    fungalBacterial: 'फंगल और बैक्टीरियल स्पेशल',
    vaayuYantra: 'वायु और यंत्र',
    ykLaboratories: 'YK लेबोरेटरीज स्पेशल',
    soilax: 'सोयलाक्स',
    petVeterinary: 'पालतू और पशु चिकित्सा',
    nanoSilver: 'नैनो सिल्वर PPM',
    naturalFumigant: 'प्राकृतिक फ्यूमिगेंट',
    cosmetics: 'कॉस्मेटिक्स और थेरेपी',
    
    // Track order
    trackYourOrder: 'अपना ऑर्डर ट्रैक करें',
    orderId: 'ऑर्डर आईडी',
    mobileNumber: 'मोबाइल नंबर',
    search: 'खोजें',
    trackingFor: 'के लिए ट्रैकिंग',
    currentStatus: 'वर्तमान स्थिति',
    stepPlaced: 'दर्ज किया गया',
    stepConfirmed: 'पुष्ट',
    stepPacked: 'पैक किया गया',
    stepShipped: 'शिप किया गया',
    stepOutForDelivery: 'डिलिवरी के लिए निकला',
    stepDelivered: 'डिलिवर किया गया',

    // Harvest
    cropReport: 'फसल रिपोर्ट',
    detailedInsights: 'वर्तमान चक्र के लिए विस्तृत ऑर्गेनिक-इंटीग्रेटेड प्रदर्शन अंतर्दृष्टि और कार्रवाई योग्य अगले कदम।',
    lastUpdated: 'अंतिम अद्यतन',
    organicQuantityAndCompliance: 'ऑर्गेनिक मात्रा और अनुपालन',
    immediateActionPlan: 'तत्काल कार्य योजना',
    operationalHighlights: 'ऑपरेशनल हाइलाइट्स',
    organicQuantity: 'ऑर्गेनिक मात्रा',
    conventionalQuantity: 'पारंपरिक मात्रा',
    traceabilityNote: 'ट्रेसबिलिटी लॉट-वार डिस्पैच से मेल खाती है',
    wiltSpecial: 'विल्ट स्पेशल',
    oxyveg: 'ऑक्सीवेग कॉटन स्पेशल',
    
    addToCart: 'कार्ट में डालें',
    viewDetails: 'विवरण देखें',
    buyNow: 'अभी खरीदें',
    yourCart: 'आपकी कार्ट',
    orderSummary: 'ऑर्डर सारांश',
    subtotal: 'उप-योग',
    delivery: 'वितरण',
    proceedToCheckout: 'चेकआउट पर जाएँ',
    cartEmptyTitle: 'आपकी कार्ट खाली है',
    cartEmptyDesc: 'यहां देखने के लिए उत्पाद जोड़ें।',
    saveToWishlist: 'विशलिस्ट में सहेजें',
    addToWishlist: 'विशलिस्ट में जोड़ें',
    removeFromWishlist: 'विशलिस्ट से हटाएं',
    remove: 'हटाएं',
    youMayAlsoLike: 'आपको यह भी पसंद आ सकता है',
    moveAllToCart: 'सभी को कार्ट में ले जाएँ',
    noWishlist: 'विशलिस्ट में आइटम नहीं हैं',
    congratulations: 'बधाई हो!',
    accountCreated: 'आपका खाता बनाया गया है और आपका ऑर्डर पुष्टि हुआ है।',
    signUpConfirmOrder: 'साइन अप और ऑर्डर की पुष्टि करें',
    fullNameLabel: 'पूरा नाम (डेमो के लिए कोई भी नाम ठीक है)',
    mobileLabel: 'मोबाइल नंबर (वैकल्पिक)',
    emailLabel: 'ईमेल (वैकल्पिक)',
  },
};

const LanguageContext = createContext(undefined);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
