// client/src/components/SideMenuCustomer.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaUserCog,
  FaClipboardList,
  FaEnvelope,
  FaQuestionCircle,
  FaPhone,
  FaBalanceScale,
  FaSignOutAlt
} from 'react-icons/fa';
import styles from '../styles/SideMenuCustomer.module.css';

export default function SideMenuCustomer({ isOpen, toggleMenu, closeMenu }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    closeMenu();
    localStorage.removeItem('token');
    localStorage.removeItem('accountType');
    alert('You have logged out.');
    setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 1000);
  };

  // Navigate to any page
  const goTo = (path) => {
    closeMenu();
    navigate(path);
  };

  return (
    <div className={`${styles.sideMenu} ${isOpen ? styles.open : ''}`}>
      <div className={styles.menuHeader}>
        <button className={styles.closeIcon} onClick={toggleMenu}>
          &times;
        </button>
      </div>

      <ul className={styles.menuList}>
        {/* Profile link */}
        <li className={styles.menuItem} onClick={() => goTo('/profile')}>
          <FaUser className={styles.icon} />
          <span>Profile</span>
        </li>
        {/* Account link */}
        <li className={styles.menuItem} onClick={() => goTo('/account')}>
          <FaUserCog className={styles.icon} />
          <span>Account</span>
        </li>
        {/* My Bookings link */}
        <li className={styles.menuItem} onClick={() => goTo('/bookings')}>
          <FaClipboardList className={styles.icon} />
          <span>My Bookings</span>
        </li>
        {/* Messages link */}
        <li className={styles.menuItem} onClick={() => goTo('/messages')}>
          <FaEnvelope className={styles.icon} />
          <span>Messages</span>
        </li>
        <li className={styles.menuItem}>
          <FaQuestionCircle className={styles.icon} />
          <span>How Hyre Works</span>
        </li>
        <li className={styles.menuItem}>
          <FaPhone className={styles.icon} />
          <span>Contact Support</span>
        </li>
        <li className={styles.menuItem}>
          <FaBalanceScale className={styles.icon} />
          <span>Legal</span>
        </li>
        <li className={styles.menuItem} onClick={handleLogout}>
          <FaSignOutAlt className={styles.icon} />
          <span>Log Out</span>
        </li>
      </ul>
    </div>
  );
}
