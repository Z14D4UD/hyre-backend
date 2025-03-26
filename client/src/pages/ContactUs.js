import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Show SideMenu for not logged in, and SideMenuCustomer for logged-in customers.
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import { FaInstagram } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import styles from '../styles/ContactUs.module.css';

export default function ContactUs() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
  });

  // Use your backend URL (set in your client .env)
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send POST request to the /support/contact endpoint
      await axios.post(`${backendUrl}/support/contact`, formData);
      alert('Thank you for contacting Hyre! We will get back to you soon.');
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

      {/* Side menu: show customer version if logged in, else the general side menu */}
      {isCustomer ? (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : (
        <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />
      )}

      {/* Main content */}
      <div className={styles.content}>
        {/* Left Section: Heading and Contact Form */}
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
              placeholder="Enter your message"
              className={styles.inputField}
              value={formData.company}
              onChange={handleChange}
            />
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        </div>

        {/* Right Section: Contact Info with Social Icons */}
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
            <a href="https://instagram.com/hyre" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
              <FaInstagram className={styles.socialIcon} />
            </a>
          </div>
          <div className={styles.contactItem}>
            <h2 className={styles.contactLabel}>TikTok</h2>
            <a href="https://www.tiktok.com/@hyre" className={styles.contactLink} target="_blank" rel="noopener noreferrer">
              <SiTiktok className={styles.socialIcon} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
