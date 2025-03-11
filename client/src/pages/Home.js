// client/src/pages/Home.js
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import FeaturedBusinesses from '../components/FeaturedBusinesses';
import LocationAutocomplete from '../components/LocationAutoComplete';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');

  const navigate = useNavigate();

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

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.searchContainer}>
          <LocationAutocomplete location={location} setLocation={setLocation} />

          <input
            type="datetime-local"
            className={styles.searchInput}
            value={fromDateTime}
            onChange={(e) => setFromDateTime(e.target.value)}
          />

          <input
            type="datetime-local"
            className={styles.searchInput}
            value={toDateTime}
            onChange={(e) => setToDateTime(e.target.value)}
          />

          <button className={styles.searchIconButton} onClick={handleSearch}>
            <FaSearch />
          </button>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className={styles.featuredSection}>
        <h2 className={styles.featuredTitle}>Featured Businesses</h2>
        <FeaturedBusinesses />
      </section>

      {/* List Your Car Section */}
      <section className={styles.listYourCarSection}>
        <h2>List Your Car</h2>
        <img
          src="/images/my-car.jpg"
          alt="List your car"
          className={styles.listYourCarImage}
        />
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
