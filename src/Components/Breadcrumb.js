import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ categoryName, productName }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on Harvest page
  if (pathnames.includes('Harvest')) {
    return null;
  }

  // Build breadcrumb items based on route
  const getBreadcrumbs = () => {
    const breadcrumbs = [{ name: 'Home', path: '/' }];

    if (pathnames.length === 0) {
      return breadcrumbs;
    }

    const firstPath = pathnames[0].toLowerCase();

    if (firstPath === 'cart') {
      breadcrumbs.push({ name: 'Cart', path: '/Cart' });
    } else if (firstPath === 'wishlist') {
      breadcrumbs.push({ name: 'Wishlist', path: '/Wishlist' });
    } else if (firstPath === 'orders') {
      breadcrumbs.push({ name: 'Orders', path: '/orders' });
    } else if (firstPath === 'checkout') {
      breadcrumbs.push({ name: 'Checkout', path: '/checkout' });
    } else if (firstPath === 'track') {
      breadcrumbs.push({ name: 'Track Order', path: '/track' });
    } else if (firstPath === 'privacy-policy') {
      breadcrumbs.push({ name: 'Privacy Policy', path: '/privacy-policy' });
    } else if (firstPath === 'terms-conditions') {
      breadcrumbs.push({ name: 'Terms & Conditions', path: '/terms-conditions' });
    } else if (firstPath === 'about-us') {
      breadcrumbs.push({ name: 'About Us', path: '/about-us' });
    } else if (firstPath === 'contact-us') {
      breadcrumbs.push({ name: 'Contact Us', path: '/contact-us' });
    } else if (firstPath === 'category' && pathnames[1]) {
      breadcrumbs.push({
        name: decodeURIComponent(pathnames[1]).replace(/-/g, ' '),
        path: `/category/${pathnames[1]}`
      });
    } else if (firstPath === 'product' && pathnames[1]) {
      if (categoryName) {
        breadcrumbs.push({
          name: categoryName,
          path: `/category/${categoryName.replace(/\s+/g, '-')}`
        });
      }
      breadcrumbs.push({
        name: productName || decodeURIComponent(pathnames[1]).replace(/-/g, ' '),
        path: `/product/${pathnames[1]}`
      });
    } else if (firstPath === 'harvest-product' && pathnames[1]) {
      breadcrumbs.push({ name: 'YK-Harvest', path: '/Harvest' });
      breadcrumbs.push({
        name: productName || 'Harvest Product',
        path: `/harvest-product/${pathnames[1]}`
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="breadcrumb">
      <div className="breadcrumb-container">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <span key={crumb.path}>
              {index > 0 && <span className="breadcrumb-separator"> &gt; </span>}
              {isLast ? (
                <span className="breadcrumb-current">{crumb.name}</span>
              ) : (
                <Link to={crumb.path} className="breadcrumb-link">{crumb.name}</Link>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumb;