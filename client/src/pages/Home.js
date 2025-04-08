// client/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJsApiLoader } from '@react-google-maps/api';

// Import all menus
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import FeaturedBusinesses from '../components/FeaturedBusinesses';
import LocationAutocomplete from '../components/LocationAutoComplete';
import Footer from '../components/Footer';

import styles from '../styles/Home.module.css';
import heroImage from '../assets/hero.jpg';

const libraries = ['places'];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [fromDateTime, setFromDateTime] = useState('2025-03-25T10:00');
  const [toDateTime, setToDateTime] = useState('2025-03-27T10:00');
  const [mapCenter, setMapCenter] = useState(null);

  const navigate = useNavigate();
  const { t } = useTranslation();

  // Load Google Maps API (for geocoding)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Retrieve token and accountType from localStorage
  const token = (localStorage.getItem('token') || '').trim();
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();

  // Determine login status
  const isCustomerLoggedIn = token !== '' && accountType === 'customer';
  const isBusinessLoggedIn = token !== '' && accountType === 'business';
  const isAffiliateLoggedIn = token !== '' && accountType === 'affiliate';

  // Toggle menu open/closed
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Geocode function: resolves address to lat/lng using Google Maps Geocoder
  const geocodeAddress = async (address) => {
    if (!window.google) return null;
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          resolve({ lat, lng });
        } else {
          reject(status);
        }
      });
    });
  };

  // Handle search: geocode the address then navigate to search page with query parameters
  const handleSearch = async () => {
    try {
      let lat = '';
      let lng = '';
      if (location && isLoaded) {
        // Attempt to geocode the location. If it fails, continue with only the location string.
        try {
          const coords = await geocodeAddress(location);
          lat = coords.lat;
          lng = coords.lng;
          setMapCenter({ lat, lng });
        } catch (error) {
          console.error('Geocode error:', error);
        }
      }
      // Navigate to the search page with location, lat and lng as query parameters
      navigate(
        `/search?location=${encodeURIComponent(location)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&from=${encodeURIComponent(fromDateTime)}&to=${encodeURIComponent(toDateTime)}`
      );
    } catch (err) {
      console.error('Error in search handling:', err);
    }
  };

  const handleListYourCar = () => {
    if (isBusinessLoggedIn) {
      navigate('/upload-car');
    } else if (token) {
      alert('You must be logged in as a business to list your car.');
    } else {
      alert('Please log in to list your car.');
      navigate('/login');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Render appropriate side menu based on user account type */}
      {isBusinessLoggedIn ? (
        <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : isCustomerLoggedIn ? (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : isAffiliateLoggedIn ? (
        <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : (
        <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />
      )}

      {/* Hero Section */}
      <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.searchContainer}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Where</label>
            <LocationAutocomplete location={location} setLocation={setLocation} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>From</label>
            <input
              type="datetime-local"
              className={styles.searchInput}
              value={fromDateTime}
              onChange={(e) => setFromDateTime(e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Until</label>
            <input
              type="datetime-local"
              className={styles.searchInput}
              value={toDateTime}
              onChange={(e) => setToDateTime(e.target.value)}
            />
          </div>
          <button
            className={styles.searchIconButton}
            onClick={handleSearch}
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className={styles.featuredSection}>
        <h2 className={styles.featuredTitle}>Featured Businesses</h2>
        <FeaturedBusinesses />
      </section>

      {/* Promo Section */}
      <section className={styles.promoSection}>
        <div className={styles.promoItem}>
          <div className={styles.promoIcon}>🎉</div>
          <h3>Enjoy Great Freebies</h3>
          <p>Get free services, maintenance checks, and more for your car.</p>
          <a href="/signup" className={styles.promoLink}>
            Sign up now &gt;
          </a>
        </div>
        <div className={styles.promoItem}>
          <div className={styles.promoIcon}>🚀</div>
          <h3>Sign Up Now</h3>
          <p>Accelerate your membership and get the best deals instantly!</p>
          <a href="/signup" className={styles.promoLink}>
            Sign up now &gt;
          </a>
        </div>
      </section>

      {/* List Your Car Section */}
      <section className={styles.listYourCarSection}>
        <h2>List Your Car</h2>
        <p className={styles.listYourCarContent}>
          Earn extra income by listing your car on Hyre. Set your own rates and availability, and we'll connect you with local customers looking for the perfect ride.
        </p>
        <button className={styles.listYourCarButton} onClick={handleListYourCar}>
          List Your Car
        </button>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
