// client/src/components/SideMenuAffiliate.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaUserCog,
  FaChartLine, // For the "Dashboard" icon
  FaSignOutAlt,
} from 'react-icons/fa';
import styles from '../styles/SideMenuCustomer.module.css'; 
// or create a new CSS file if you want different styling

export default function SideMenuAffiliate({ isOpen, toggleMenu, closeMenu }) {
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
        <li className={styles.menuItem} onClick={() => goTo('/profile')}>
          <FaUser className={styles.icon} />
          <span>Profile</span>
        </li>

        {/* New Dashboard menu item */}
        <li className={styles.menuItem} onClick={() => goTo('/dashboard/affiliate')}>
          <FaChartLine className={styles.icon} />
          <span>Dashboard</span>
        </li>
        {/* Logout */}
        <li className={styles.menuItem} onClick={handleLogout}>
          <FaSignOutAlt className={styles.icon} />
          <span>Log Out</span>
        </li>
      </ul>
    </div>
  );
}
