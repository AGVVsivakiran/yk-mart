import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { UserProvider } from './Controllers/UserContext';
import Header from './Components/Header';
import Footer from './Components/Footer';
import './index.css';
import { LanguageProvider } from './Controllers/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './Components/ScrollToTop';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <UserProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <Header />
            <App />
            <Footer />
          </Router>
        </LanguageProvider>
      </UserProvider>
    </HelmetProvider>
  </React.StrictMode>
);