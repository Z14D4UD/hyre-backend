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

  // For toggling the side menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Local user data and transmission
  const [user, setUser] = useState(null);
  const [transmission, setTransmission] = useState('');

  // Adjust this URL if needed
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your account.');
      navigate('/');
      return;
    }

    // Fetch account data from /api/account
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

  // Save Transmission to DB
  const handleSaveTransmission = () => {
    axios
      .put(
        `${backendUrl}/account`,
        { transmission },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        // The server responds with the updated user object
        setUser(res.data);
        setTransmission(res.data.transmission || '');
        alert('Transmission preference saved.');
      })
      .catch((err) => {
        console.error('Error updating transmission:', err);
        alert('Failed to update transmission.');
      });
  };

  // Download account data as PDF
  const handleDownloadData = () => {
    axios
      .get(`${backendUrl}/account/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // important for binary data
      })
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'MyHyreData.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Error downloading PDF:', err);
        alert('Failed to download data.');
      });
  };

  // Close account
  const handleCloseAccount = () => {
    if (!window.confirm('Are you sure you want to close your account?')) return;

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
    return <div className={styles.container}>Loading account...</div>;
  }

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

      {/* Side Menu */}
      {isCustomer && (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      )}

      <div className={styles.content}>
        <h1>Account</h1>

        {/* Contact Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Information</h2>
          <p>
            Email: <strong>{user.email}</strong>{' '}
            <span style={{ color: 'green' }}>(Verified)</span>
          </p>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => navigate('/change-password')}
          >
            Change Password
          </button>
        </div>

        {/* Transmission Section */}
<div className={styles.section}>
  <h2 className={styles.sectionTitle}>Transmission</h2>
  <p>
    Some cars on Hyre do not have automatic transmissions. Can you drive a manual car?
  </p>

  {user.transmission && user.transmission !== '' ? (
    <p>
      <strong>Your transmission setting:</strong> {user.transmission}
    </p>
  ) : (
    <>
      <select
        className={styles.selectField}
        value={transmission}
        onChange={(e) => setTransmission(e.target.value)}
      >
        <option value="">Select your option</option>
        <option value="No, I am not an expert">No, I am not an expert</option>
        <option value="Yes, I can drive manual">Yes, I can drive manual</option>
      </select>
      <div className={styles.buttonRow}>
        <button
          className={styles.button}
          onClick={() => {
            axios
              .put(
                `${backendUrl}/account`,
                { transmission },
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then((res) => {
                setUser(res.data); // 🔁 update frontend view
                setTransmission(res.data.transmission || '');
              })
              .catch((err) => {
                console.error('Error updating transmission:', err);
                alert('Failed to update transmission.');
              });
          }}
        >
          Save changes
        </button>
      </div>
    </>
  )}
</div>

        {/* Loyalty Points */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Loyalty Points</h2>
          <p>
            You earn 10 points for each booking. Once you reach 500 points, you can request a
            reward by emailing us.
          </p>
          <p>
            Your current points: <strong>{user.points || 0}</strong>
          </p>
          {user.points >= 500 && (
            <p className={styles.loyaltyNote}>
              Congratulations! You have enough points to claim a reward. Please email us to redeem.
            </p>
          )}
        </div>

        {/* Download Data */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Download account data</h2>
          <p>Download a PDF copy of all information we have about your account.</p>
          <button className={styles.button} onClick={handleDownloadData}>
            Download my data
          </button>
        </div>

        {/* Close Account */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Close account</h2>
          <p>Once you close your account, all your data will be deleted permanently.</p>
          <button className={`${styles.button} ${styles.buttonDanger}`} onClick={handleCloseAccount}>
            Close my account
          </button>
        </div>
      </div>
    </div>
  );
}
