import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Harvest from "./Pages/Harvest";
import Cart from "./Pages/Cart";
import Wishlist from "./Pages/Wishlist";
import Categories from "./Pages/Categories";
import ProductDetails from "./Pages/ProductDetails";
import HarvestProductDetails from "./Pages/HarvestProductDetails";
import Orders from "./Pages/orders";
import Checkout from "./Pages/Checkout";
import TrackOrder from "./Pages/track";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import TermsConditions from "./Pages/TermsConditions";
import AboutUs from "./Pages/AboutUs";
import ContactUs from "./Pages/ContactUs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Harvest" element={<Harvest />} />
      <Route path="/Cart" element={<Cart />} />
      <Route path="/Wishlist" element={<Wishlist />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/track" element={<TrackOrder />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/category/:categoryName" element={<Categories />} />
      <Route path="/product/:ProductName" element={<ProductDetails />} />
      <Route path="/harvest-product/:ProductId" element={<HarvestProductDetails />}/>

    </Routes>
  );
}

export default App;