// client/src/pages/Home.js
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SideMenu from '../components/SideMenu';
import FeaturedBusinesses from '../components/FeaturedBusinesses';
import LocationAutocomplete from '../components/LocationAutoComplete';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';
import heroImage from '../assets/hero.jpg'; // Ensure this file exists in client/src/assets

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Default date/time for "From" and "Until"
  const [location, setLocation] = useState('');
  const [fromDateTime, setFromDateTime] = useState('2025-03-25T10:00');
  const [toDateTime, setToDateTime] = useState('2025-03-27T10:00');

  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleSearch = () => {
    alert(`Searching: ${location}, from: ${fromDateTime}, to: ${toDateTime}`);
  };

  const handleListYourCar = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/upload-car');
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

      {/* Side Menu */}
      <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />

      {/* Hero Section with Inline Background Image */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.heroOverlay}></div>

        {/* Search Container: Turo-style row with 3 labeled fields + icon */}
        <div className={styles.searchContainer}>
          {/* Location Field */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Where</label>
            <LocationAutocomplete location={location} setLocation={setLocation} />
          </div>

          {/* From Date/Time */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>From</label>
            <input
              type="datetime-local"
              className={styles.searchInput}
              value={fromDateTime}
              onChange={(e) => setFromDateTime(e.target.value)}
            />
          </div>

          {/* Until Date/Time */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Until</label>
            <input
              type="datetime-local"
              className={styles.searchInput}
              value={toDateTime}
              onChange={(e) => setToDateTime(e.target.value)}
            />
          </div>

          {/* Magnifying Glass Button */}
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
          Earn extra income by listing your car on Hyre. Set your own rates and
          availability, and we'll connect you with local customers looking for
          the perfect ride.
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