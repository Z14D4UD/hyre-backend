// client/src/pages/ConnectBank.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/ConnectBank.module.css';

export default function ConnectBank() {
  const navigate = useNavigate();
  const token = (localStorage.getItem('token') || '').trim();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function createOnboarding() {
      try {
        // Call backend endpoint to create the onboarding link
        const res = await axios.post(`${baseUrl}/connect-bank`, {}, axiosConfig);
        // If the account already exists, you might want to notify the user
        if (res.data.stripeAccountId) {
          // Already connected – you can redirect back to dashboard or show a message
          alert('Your bank account is already connected.');
          navigate('/dashboard/business');
        } else if (res.data.url) {
          // Redirect the user to the Stripe Connect onboarding link
          window.location.href = res.data.url;
        }
      } catch (err) {
        console.error('Error during Stripe Connect onboarding:', err);
        setError('Failed to initiate bank account connection. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    createOnboarding();
  }, [baseUrl, axiosConfig, navigate]);

  if (loading) {
    return <div className={styles.container}>Loading...</div>;
  }
  if (error) {
    return <div className={styles.container}>{error}</div>;
  }
  return <div className={styles.container}>Redirecting...</div>;
}
