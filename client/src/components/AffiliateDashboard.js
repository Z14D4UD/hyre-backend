// client/src/pages/AffiliateDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideMenuAffiliate from '../components/SideMenuAffiliate';
import styles from '../styles/AffiliateDashboard.module.css';

// Chart.js (optional)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AffiliateDashboard() {
  const [menuOpen, setMenuOpen]             = useState(false);
  const [loading, setLoading]               = useState(true);

  const [last30Days, setLast30Days]         = useState({});
  const [allTime, setAllTime]               = useState({});
  const [affiliateCode, setAffiliateCode]   = useState('');
  const [recentActivity, setRecentActivity] = useState([]);

  /* withdraw-modal state (unchanged) */
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount,    setWithdrawalAmount]    = useState('');
  const [withdrawalMethod,    setWithdrawalMethod]    = useState('paypal');
  const [paypalEmail,         setPaypalEmail]         = useState('');

  const navigate     = useNavigate();
  const token        = (localStorage.getItem('token') || '').trim();
  const axiosConfig  = { headers: { Authorization: `Bearer ${token}` } };
  const baseUrl      = process.env.REACT_APP_BACKEND_URL;

  const toggleMenu = () => setMenuOpen(o => !o);
  const closeMenu  = () => setMenuOpen(false);

  /* ───────────────────────────────────────────────────────────── */
  /*  Fetch affiliate stats                                       */
  /* ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    async function fetchAffiliateData() {
      try {
        const res = await axios.get(`${baseUrl}/affiliate/stats`, axiosConfig);
        setLast30Days(res.data.last30Days || {});
        setAllTime(res.data.allTime || {});
        setAffiliateCode(res.data.affiliateCode || '');
        setRecentActivity(res.data.recentActivity || []);
      } catch (err) {
        console.error('Error fetching affiliate data:', err);
        if (err.response?.status === 401) return navigate('/login');
        alert('Failed to load affiliate data.');
      } finally {
        setLoading(false);
      }
    }
    token ? fetchAffiliateData() : navigate('/login');
  }, [token, baseUrl, axiosConfig, navigate]);

  /* ───────────────────────────────────────────────────────────── */
  /*  Withdraw submit (unchanged)                                 */
  /* ───────────────────────────────────────────────────────────── */
  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      return alert('Please enter a valid withdrawal amount.');
    }
    if (withdrawalMethod === 'bank') {
      localStorage.setItem('pendingWithdrawalAmount', withdrawalAmount);
      navigate('/connect-bank');
      return;
    }
    try {
      await axios.post(
        `${baseUrl}/withdrawals`,
        { amount, method: 'paypal', details: { paypalEmail } },
        axiosConfig
      );
      alert('Withdrawal request submitted successfully!');
      setWithdrawalModalOpen(false);
    } catch (err) {
      console.error('Error submitting withdrawal:', err);
      alert('Failed to submit withdrawal.');
    }
  };

  /* ───────────────────────────────────────────────────────────── */
  /*  Render                                                      */
  /* ───────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.affiliateDashboardContainer}>
        <header className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
          <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
        </header>
        <div className={styles.mainContent}><p>Loading affiliate data…</p></div>
      </div>
    );
  }

  return (
    <div className={styles.affiliateDashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {/* Side-menu */}
      <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      {/* Main */}
      <div className={styles.mainContent}>

        {/* Greeting */}
        <div className={styles.pageTitle}>
          <h1>Affiliate Dashboard</h1>
          <span>Welcome back, here’s your affiliate overview</span>
        </div>

        {/* Code */}
        <div className={styles.affiliateCodeSection}>
          <h2>Your Affiliate Code</h2>
          <div className={styles.affiliateCodeBox}>{affiliateCode || 'N/A'}</div>
          <p>Share this code with customers to earn referral rewards!</p>
        </div>

        {/* Last 30 Days */}
        <div className={styles.statsSection}>
          <h2>Last 30 Days</h2>
          <div className={styles.statsCards}>
            <div className={styles.card}><h3>Referrals</h3><p>{last30Days.referrals || 0}</p></div>
            <div className={styles.card}><h3>Visits</h3><p>{last30Days.visits || 0}</p></div>
            <div className={styles.card}><h3>Conversions</h3><p>{last30Days.conversions || 0}</p></div>
          </div>
        </div>

        {/* All-time */}
        <div className={styles.statsSection}>
          <h2>All-Time</h2>
          <div className={styles.statsCards}>
            <div className={styles.card}>
              <h3>Referrals</h3>
              <p>{allTime.referrals || 0}</p>
            </div>
            <div className={styles.card}>
              <h3>Paid Referrals</h3>
              <p>{allTime.paidReferrals || 0}</p>
            </div>
            {/* ‼️ wording changed here */}
            <div className={styles.card}>
              <h3>Pending payment</h3>
              <p>${allTime.unpaidEarnings?.toFixed(2) || '0.00'}</p>
            </div>
            <div className={styles.card}>
              <h3>Total Earnings</h3>
              <p>${allTime.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Recent activity (unchanged) */}
        <div className={styles.recentActivity}>
          <h2>Recent Referral Activity</h2>
          {recentActivity.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <table className={styles.activityTable}>
              <thead>
                <tr><th>ID</th><th>Amount</th><th>Description</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentActivity.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>${item.amount?.toFixed(2)}</td>
                    <td>{item.description}</td>
                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Withdraw button / modal (unchanged) */}
        <div style={{ textAlign:'center', margin:'1.5rem 0' }}>
          <button className={styles.withdrawButton} onClick={() => setWithdrawalModalOpen(true)}>
            Withdraw Funds
          </button>
        </div>

        {withdrawalModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Withdraw Funds</h2>
              <label>Amount</label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={e => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <label>Withdrawal Method</label>
              <select value={withdrawalMethod} onChange={e => setWithdrawalMethod(e.target.value)}>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Account</option>
              </select>
              {withdrawalMethod === 'paypal' && (
                <>
                  <label>PayPal Email</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={e => setPaypalEmail(e.target.value)}
                    placeholder="Enter your PayPal email"
                  />
                </>
              )}
              <div className={styles.modalButtons}>
                <button className={styles.buttonPrimary} onClick={handleWithdrawalSubmit}>
                  Submit Withdrawal
                </button>
                <button className={styles.buttonDanger} onClick={() => setWithdrawalModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
