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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [fromDateTime, setFromDateTime] = useState('2025-03-25T10:00');
  const [toDateTime, setToDateTime] = useState('2025-03-27T10:00');

  const navigate = useNavigate();
  const { t } = useTranslation();

  // load google maps for geocoding + autocomplete
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // side menu logic
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

    // pass location & lat/lng in URL
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

  // side menu
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
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Where</label>
            {/* Live suggestions */}
            <PlaceAutocomplete
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Enter a location..."
            />
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

      <section className={styles.featuredSection}>
        <h2 className={styles.featuredTitle}>Featured Businesses</h2>
        <FeaturedBusinesses />
      </section>

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
