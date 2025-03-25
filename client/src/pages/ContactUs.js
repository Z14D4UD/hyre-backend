// client/src/pages/ContactUs.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Menus
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';

// Styles
import styles from '../styles/ContactUs.module.css';

export default function ContactUs() {
  const navigate = useNavigate();

  // Check if user is logged in as a customer
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Menu open/close
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log it or send to an endpoint
    console.log('Contact form submitted:', formData);
    alert('Thank you for contacting us. We will get back to you soon!');
    // Optionally reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
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
        {/* Left column: contact info */}
        <div className={styles.leftColumn}>
          <h2>Contact Us</h2>
          <p>
            Feel free to use the form or drop us an email. Old-fashioned phone calls work too.
          </p>
          <div className={styles.contactDetail}>
            <span className={styles.contactLabel}>Phone:</span> 
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </div>
          <div className={styles.contactDetail}>
            <span className={styles.contactLabel}>Email:</span> 
            <a href="mailto:support@hyre.com">support@hyre.com</a>
          </div>
          <div className={styles.contactDetail}>
            <span className={styles.contactLabel}>Address:</span> 
            <p>123 Main St,<br />Your City, ST 12345</p>
          </div>
        </div>

        {/* Right column: contact form */}
        <div className={styles.rightColumn}>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <label htmlFor="name" className={styles.formLabel}>Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.formInput}
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="email" className={styles.formLabel}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.formInput}
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="phone" className={styles.formLabel}>Phone (optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={styles.formInput}
                placeholder="xxx-xxx-xxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="message" className={styles.formLabel}>Message</label>
              <textarea
                id="message"
                name="message"
                className={styles.formTextarea}
                placeholder="Type your message..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
