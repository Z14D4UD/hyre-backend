// client/src/pages/Home.js
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useJsApiLoader } from '@react-google-maps/api';

import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import FeaturedBusinesses from '../components/FeaturedBusinesses';
import PlaceAutocomplete from '../components/PlaceAutocomplete';
import Footer from '../components/Footer';

import styles from '../styles/Home.module.css';
import heroImage from '../assets/hero.jpg';

// We'll geocode the location on the Home page to pass lat & lng in the URL:
async function geocodeAddress(address) {
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
}

const libraries = ['places'];

/**
 * Helper to format the current local time in yyyy-mm-ddThh:mm
 * so that it can be used as a default value for <input type="datetime-local" />
 */
function getLocalDateTimeString(date) {
  // Convert the Date object to local time by adjusting for time zone offset
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  // Then slice off the seconds, leaving yyyy-mm-ddThh:mm
  return local.toISOString().slice(0, 16);
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Load Google Maps for geocoding + autocomplete
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Compute default "From" = Now, and "Until" = 2 days from now
  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const [location, setLocation] = useState('');
  const [fromDateTime, setFromDateTime] = useState(getLocalDateTimeString(now));
  const [toDateTime, setToDateTime] = useState(getLocalDateTimeString(twoDaysLater));

  const [menuOpen, setMenuOpen] = useState(false);

  // side menu login status
  const token = (localStorage.getItem('token') || '').trim();
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  const isCustomerLoggedIn = token !== '' && accountType === 'customer';
  const isBusinessLoggedIn = token !== '' && accountType === 'business';
  const isAffiliateLoggedIn = token !== '' && accountType === 'affiliate';

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Callback from PlaceAutocomplete
  const handlePlaceSelect = (prediction) => {
    setLocation(prediction.description);
  };

  // On user pressing "Search"
  const handleSearch = async () => {
    let lat = '';
    let lng = '';
    if (location && isLoaded && window.google) {
      try {
        const coords = await geocodeAddress(location);
        if (coords) {
          lat = coords.lat;
          lng = coords.lng;
          console.log('Home → handleSearch: geocoded to', { lat, lng });
        }
      } catch (err) {
        console.error('Geocode error on Home page:', err);
      }
    }

    // Pass location & lat/lng in URL
    navigate(
      `/search?location=${encodeURIComponent(location)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&from=${encodeURIComponent(fromDateTime)}&to=${encodeURIComponent(toDateTime)}`
    );
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

  // Determine which side menu to render
  let sideMenuComponent = <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />;
  if (isBusinessLoggedIn) {
    sideMenuComponent = (
      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
    );
  } else if (isCustomerLoggedIn) {
    sideMenuComponent = (
      <SideMenuCustomer
        isOpen={menuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
    );
  } else if (isAffiliateLoggedIn) {
    sideMenuComponent = (
      <SideMenuAffiliate
        isOpen={menuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {sideMenuComponent}

      {/* Hero */}
      <section className={styles.hero} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.searchContainer}>
          {/* Where field */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Where</label>
            <PlaceAutocomplete
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Enter a location..."
            />
          </div>
          {/* From field */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>From</label>
            <input
              type="datetime-local"
              className={styles.searchInput}
              value={fromDateTime}
              onChange={(e) => setFromDateTime(e.target.value)}
            />
          </div>
          {/* Until field */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Until</label>
            <input
              type="datetime-local"
              className={styles.searchInput}
              value={toDateTime}
              onChange={(e) => setToDateTime(e.target.value)}
            />
          </div>
          {/* Search button */}
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

      {/* List Your Car */}
      <section className={styles.listYourCarSection}>
        <h2>List Your Car</h2>
        <p className={styles.listYourCarContent}>
          Earn extra income by listing your car on Hyre. Set your own rates and availability, and we'll connect you with local customers looking for the perfect ride.
        </p>
        <button className={styles.listYourCarButton} onClick={handleListYourCar}>
          List Your Car
        </button>
      </section>

      <Footer />
    </div>
  );
}
