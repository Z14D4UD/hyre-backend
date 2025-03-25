// client/src/components/SideMenu.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/SideMenu.module.css';
import {
  FaTimes,
  FaSignInAlt,
  FaUser,
  FaShieldAlt,
  FaQuestionCircle,
  FaPhone
} from 'react-icons/fa';

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
  };

  return (
    <div className={`${styles.sideMenu} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sideMenuHeader}>
        <button className={styles.closeIcon} onClick={toggleMenu}>
          <FaTimes />
        </button>
      </div>

      <ul className={styles.sideMenuList}>
        {/* Non-logged in: Login/Signup */}
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/login')}>
          <FaSignInAlt />
          Log in
        </li>
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/signup')}>
          <FaUser />
          Sign up
        </li>

        {/* "How Hyre Works" (AboutHyre) */}
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/about-hyre')}>
          <FaQuestionCircle />
          How Hyre Works
        </li>

        {/* "Contact Support" */}
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/contact-support')}>
          <FaPhone />
          Contact Support
        </li>

        {/* Insurance & Legal */}
        <li className={styles.sideMenuItem} onClick={() => handleNavigation('/insurance-legal')}>
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
