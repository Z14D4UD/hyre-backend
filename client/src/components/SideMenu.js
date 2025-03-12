// client/src/components/SideMenu.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Home.module.css';
import { FaTimes, FaSignInAlt, FaUser, FaShieldAlt } from 'react-icons/fa';

export default function SideMenu({ isOpen, toggleMenu }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');

  const handleNavigation = (path) => {
    toggleMenu();
    navigate(path);
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleCurrencyChange = (e) => {
    const cur = e.target.value;
    setCurrency(cur);
    // Optionally persist currency in localStorage or context.
  };

  return (
    <div className={`${styles.sideMenu} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sideMenuHeader}>
        <button className={styles.closeIcon} onClick={toggleMenu}>
          <FaTimes />
        </button>
      </div>
      <ul className={styles.sideMenuList}>
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/login')}>
          <FaSignInAlt />
          {t('header.menu.login')}
        </li>
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/signup')}>
          <FaUser />
          {t('header.menu.signup')}
        </li>
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/insurance-legal')}>
          <FaShieldAlt />
          {t('header.menu.insuranceLegal')}
        </li>
      </ul>
      <div className={styles.languageCurrencyToggle}>
        <select value={language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
        <select value={currency} onChange={handleCurrencyChange}>
          <option value="USD">USD</option>
          <option value="AED">AED</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
      </div>
    </div>
  );
}
