// client/src/components/SideMenu.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import { 
  FaTimes, 
  FaSignInAlt, 
  FaUser, 
  FaShieldAlt
} from 'react-icons/fa';
import i18n from '../i18n';

export default function SideMenu({ isOpen, toggleMenu }) {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');

  // Navigate and close menu
  const handleNavigation = (path) => {
    toggleMenu();
    navigate(path);
  };

  // Language change
  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // Currency change
  const handleCurrencyChange = (e) => {
    const cur = e.target.value;
    setCurrency(cur);
    // Could store in localStorage or global context
  };

  return (
    <div className={`${styles.sideMenu} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sideMenuHeader}>
        <button className={styles.closeIcon} onClick={toggleMenu}>
          <FaTimes />
        </button>
      </div>
      <ul className={styles.sideMenuList}>
        <li 
          className={styles.sideMenuItem} 
          onClick={() => handleNavigation('/login')}
        >
          <FaSignInAlt />
          Log in
        </li>
        <li 
          className={styles.sideMenuItem} 
          onClick={() => handleNavigation('/signup')}
        >
          <FaUser />
          Sign up
        </li>
        <li 
          className={styles.sideMenuItem} 
          onClick={() => handleNavigation('/insurance-legal')}
        >
          <FaShieldAlt />
          Insurance & Legal
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
