// client/src/pages/AccountPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/AccountPage.module.css';

export default function AccountPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const [user, setUser] = useState(null);

  // Local fields
  const [transmission, setTransmission] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');

  // Suppose your backend is at:
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your account.');
      navigate('/');
      return;
    }
    // Fetch account data
    axios
      .get(`${backendUrl}/account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setTransmission(res.data.transmission || '');
      })
      .catch((err) => {
        console.error('Error fetching account:', err);
        alert('Failed to load account data.');
      });
  }, [isCustomer, navigate, backendUrl, token]);

  const handleUseAffiliateCode = () => {
    if (!affiliateCode) return alert('Please enter a code.');
    axios
      .post(
        `${backendUrl}/account/use-affiliate-code`,
        { code: affiliateCode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert(res.data.msg || 'Affiliate code applied!');
      })
      .catch((err) => {
        console.error('Error applying code:', err);
        alert(err.response?.data?.msg || 'Failed to apply code.');
      });
  };

  const handleSaveTransmission = () => {
    axios
      .put(
        `${backendUrl}/account`,
        { transmission },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setUser(res.data);
        alert('Transmission preference saved.');
      })
      .catch((err) => {
        console.error('Error updating transmission:', err);
        alert('Failed to update transmission.');
      });
  };

  const handleDownloadData = () => {
    // Trigger a download
    window.location.href = `${backendUrl}/account/download?token=${token}`;
  };

  const handleCloseAccount = () => {
    if (!window.confirm('Are you sure you want to close your account?')) {
      return;
    }
    axios
      .delete(`${backendUrl}/account`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Account closed.');
        localStorage.removeItem('token');
        localStorage.removeItem('accountType');
        navigate('/');
      })
      .catch((err) => {
        console.error('Error closing account:', err);
        alert('Failed to close account.');
      });
  };

  if (!user) {
    return <div className={styles.accountContainer}>Loading account...</div>;
  }

  // Side menu toggling
  return (
    <div className={styles.accountContainer}>
      <header>
        <h1>Account</h1>
      </header>

      {/* The side menu */}
      <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      {/* Contact Information */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Information</h2>
        <p>Email: <strong>{user.email}</strong> <span style={{ color: 'green' }}>(Verified)</span></p>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => navigate('/change-password')}
        >
          Change Password
        </button>
      </div>

      {/* Transmission */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Transmission</h2>
        <p>Some cars on Turo do not have automatic transmissions. Are you an expert at driving manual transmissions?</p>
        <select
          className={styles.selectField}
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
        >
          <option value="">Select your skill level</option>
          <option value="No, I am not an expert">No, I am not an expert</option>
          <option value="Yes, I am an expert">Yes, I am an expert</option>
        </select>
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={handleSaveTransmission}>
            Save changes
          </button>
        </div>
      </div>

      {/* Affiliate code */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Use an affiliate code</h2>
        <p>Enter an affiliate code to get 10% off your next booking, and the affiliate’s balance is updated.</p>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Enter affiliate code"
          value={affiliateCode}
          onChange={(e) => setAffiliateCode(e.target.value)}
        />
        <div className={styles.buttonRow}>
          <button className={styles.button} onClick={handleUseAffiliateCode}>
            Apply
          </button>
        </div>
      </div>

      {/* Points */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Loyalty Points</h2>
        <p>You earn 10 points for each booking. Once you reach 500 points, you can request a reward by emailing us.</p>
        <p>Your current points: <strong>{user.points || 0}</strong></p>
        {user.points >= 500 && (
          <p className={styles.loyaltyNote}>
            Congratulations! You have enough points to claim a reward. Please email us to redeem.
          </p>
        )}
      </div>

      {/* Download data */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Download account data</h2>
        <p>You can download a copy of all information we have about your account.</p>
        <button className={styles.button} onClick={handleDownloadData}>
          Download my data
        </button>
      </div>

      {/* Close account */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Close account</h2>
        <p>Once you close your account, all your data will be deleted permanently.</p>
        <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleCloseAccount}>
          Close my account
        </button>
      </div>
    </div>
  );
}
