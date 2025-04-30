// client/src/pages/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import { useNavigate }        from 'react-router-dom';
import axios                  from 'axios';
import SideMenuBusiness       from '../components/SideMenuBusiness';
import styles                 from '../styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats]       = useState(null);
  const navigate                = useNavigate();
  const token                   = localStorage.getItem('token');
  const accountType             = localStorage.getItem('accountType');

  // guard on client
  useEffect(() => {
    if (!token || accountType !== 'admin') {
      alert('Admin login required');
      navigate('/login');
    }
  }, [token, accountType, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/admin/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(res.data);
      } catch (err) {
        console.error(err);
        alert('Failed to load admin stats');
      }
    })();
  }, [token]);

  if (!stats) return <p style={{ padding: '2rem' }}>Loading…</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>Hyre Admin</div>
        <button className={styles.menuIcon} onClick={() => setMenuOpen(o=>!o)}>☰</button>
      </header>

      <SideMenuBusiness 
        isOpen={menuOpen} 
        toggleMenu={() => setMenuOpen(o=>!o)} 
        closeMenu={() => setMenuOpen(false)} 
      />

      <main className={styles.main}>
        <h1>Platform Overview</h1>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Total Bookings</h3>
            <p>{stats.totalBookings}</p>
          </div>
          <div className={styles.card}>
            <h3>Total Booking-Fees</h3>
            <p>£{stats.totalBookingFees.toFixed(2)}</p>
          </div>
          <div className={styles.card}>
            <h3>Total Service-Fees</h3>
            <p>£{stats.totalServiceFees.toFixed(2)}</p>
          </div>
          <div className={styles.card}>
            <h3>Total Revenue</h3>
            <p>£{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className={styles.card}>
            <h3>Customers</h3>
            <p>{stats.totalCustomers}</p>
          </div>
          <div className={styles.card}>
            <h3>Businesses</h3>
            <p>{stats.totalBusinesses}</p>
          </div>
          <div className={styles.card}>
            <h3>Affiliates</h3>
            <p>{stats.totalAffiliates}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
