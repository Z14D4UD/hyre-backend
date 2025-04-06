// client/src/components/SideMenuBusiness.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt, // Dashboard icon
  FaUser,          // My Profile icon
  FaListUl,        // My Listings icon
  FaPlusSquare,    // Add New Listing icon
  FaClipboardList, // Bookings icon
  FaEnvelope,      // Messages icon
  FaSignOutAlt     // Log Out icon
} from 'react-icons/fa';
import styles from '../styles/SideMenuBusiness.module.css';

export default function SideMenuBusiness({ isOpen, toggleMenu, closeMenu }) {
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

  // Navigate to a given path and then close the menu
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
        <li className={styles.menuItem} onClick={() => goTo('/dashboard/business')}>
          <FaTachometerAlt className={styles.icon} />
          <span>Dashboard</span>
        </li>
        <li className={styles.menuItem} onClick={() => goTo('/profile/business')}>
          <FaUser className={styles.icon} />
          <span>My Profile</span>
        </li>
        <li className={styles.menuItem} onClick={() => goTo('/my-listings')}>
          <FaListUl className={styles.icon} />
          <span>My Listings</span>
        </li>
        <li className={styles.menuItem} onClick={() => goTo('/add-listing')}>
          <FaPlusSquare className={styles.icon} />
          <span>Add New Listing</span>
        </li>
        {/* Updated Bookings route for business users */}
        <li className={styles.menuItem} onClick={() => goTo('/bookings/business')}>
          <FaClipboardList className={styles.icon} />
          <span>Bookings</span>
        </li>
        <li className={styles.menuItem} onClick={() => goTo('/messages')}>
          <FaEnvelope className={styles.icon} />
          <span>Messages</span>
        </li>
        <li className={styles.menuItem} onClick={handleLogout}>
          <FaSignOutAlt className={styles.icon} />
          <span>Log Out</span>
        </li>
      </ul>
    </div>
  );
}
