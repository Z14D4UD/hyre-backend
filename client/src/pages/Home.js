// client/src/pages/Home.js
import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SideMenu from '../components/SideMenu';
import FeaturedBusinesses from '../components/FeaturedBusinesses';
import LocationAutocomplete from '../components/LocationAutocomplete';
import Footer from '../components/Footer';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');
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
        <div className={styles.logo}>{t('header.logo')}</div>
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
            <FaSearch /> {t('home.hero.searchButton')}
          </button>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className={styles.featuredSection}>
        <h2 className={styles.featuredTitle}>{t('home.featured.title')}</h2>
        <FeaturedBusinesses />
      </section>

      {/* List Your Car Section */}
      <section className={styles.listYourCarSection}>
        <h2>{t('home.listYourCar.title')}</h2>
        <img
          src="/images/my-car.jpg"
          alt={t('home.listYourCar.title')}
          className={styles.listYourCarImage}
        />
        <p className={styles.listYourCarContent}>
          {t('home.listYourCar.description')}
        </p>
        <button className={styles.listYourCarButton} onClick={handleListYourCar}>
          {t('home.listYourCar.button')}
        </button>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
