// client/src/pages/ContactUs.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// If user is logged in as a customer, we show SideMenuCustomer; otherwise SideMenu
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';

import styles from '../styles/ContactUs.module.css';
import axios from 'axios';

export default function ContactUs() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu states
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  });

  // Adjust your backend URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  // Handle changes in inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form => call our backend endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send POST request to the backend
      const res = await axios.post(
        `${backendUrl}/support/contact`,
        formData
      );

      // If success
      alert('Thank you for contacting Hyre! We will get back to you soon.');
      // Clear fields
      setFormData({ name: '', email: '', company: '' });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Conditionally show side menu */}
      {isCustomer ? (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      ) : (
        <SideMenu
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
        />
      )}

      {/* Main content */}
      <div className={styles.content}>
        {/* Left side: heading + form */}
        <div className={styles.leftSection}>
          <h1 className={styles.mainHeading}>Let's build something great together.</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className={styles.inputField}
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={styles.inputField}
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              className={styles.inputField}
              value={formData.company}
              onChange={handleChange}
            />

            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        </div>

        {/* Right side: contact info */}
        <div className={styles.rightSection}>
          <div className={styles.contactItem}>
            <h2 className={styles.contactLabel}>Email</h2>
            <a href="mailto:support@hyre.com" className={styles.contactLink}>
              support@hyre.com
            </a>
          </div>
          <div className={styles.contactItem}>
            <h2 className={styles.contactLabel}>Phone</h2>
            <a href="tel:+1234567890" className={styles.contactLink}>
              +1 (234) 567-890
            </a>
          </div>
          <div className={styles.contactItem}>
            <h2 className={styles.contactLabel}>Instagram</h2>
            <a href="https://instagram.com/hyre" className={styles.contactLink}>
              @hyre
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
