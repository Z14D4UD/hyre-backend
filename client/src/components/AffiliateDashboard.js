// client/src/pages/AffiliateDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SideMenuAffiliate from '../components/SideMenuAffiliate';
import styles from '../styles/AffiliateDashboard.module.css';

// (Optional) Chart.js can be registered and used if you wish to display charts
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Stats states
  const [last30Days, setLast30Days] = useState({});
  const [allTime, setAllTime] = useState({});
  const [affiliateCode, setAffiliateCode] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);

  // Withdrawal modal states
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('paypal');
  const [paypalEmail, setPaypalEmail] = useState('');

  const navigate = useNavigate();
  const token = (localStorage.getItem('token') || '').trim();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Make sure your REACT_APP_BACKEND_URL includes the API prefix if necessary (e.g., "https://your-domain.com/api")
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    async function fetchAffiliateData() {
      try {
        const res = await axios.get(`${baseUrl}/affiliate/stats`, axiosConfig);
        setLast30Days(res.data.last30Days || {});
        setAllTime(res.data.allTime || {});
        setAffiliateCode(res.data.affiliateCode || '');
        setRecentActivity(res.data.recentActivity || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching affiliate data:', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          alert('Failed to load affiliate data.');
        }
        setLoading(false);
      }
    }
    if (token) {
      fetchAffiliateData();
    } else {
      navigate('/login');
    }
  }, [token, baseUrl, axiosConfig, navigate]);

  // Handle withdrawal submission for affiliates
  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }

    if (withdrawalMethod === 'bank') {
      // Redirect to Stripe Connect onboarding flow for bank withdrawals
      localStorage.setItem('pendingWithdrawalAmount', withdrawalAmount);
      navigate('/connect-bank');
      return;
    }

    try {
      const payload = {
        amount,
        method: 'paypal',
        details: { paypalEmail },
      };
      await axios.post(`${baseUrl}/withdrawals`, payload, axiosConfig);
      alert('Withdrawal request submitted successfully!');
      setWithdrawalModalOpen(false);
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Failed to submit withdrawal request.');
    }
  };

  // (Optional) Chart Data Example (you can customize based on your data)
  const earningsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Total Earnings ($)',
      data: allTime.totalEarnings ? [allTime.totalEarnings] : [],
      fill: false,
      borderColor: '#4f3cc9',
      tension: 0.1
    }]
  };

  if (loading) {
    return (
      <div className={styles.affiliateDashboardContainer}>
        <header className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
          <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
        </header>
        <div className={styles.mainContent}>
          <p>Loading affiliate data...</p>
        </div>
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

      {/* Side Menu */}
      <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1>Affiliate Dashboard</h1>
          <span>Welcome back, here’s your affiliate overview</span>
        </div>

        {/* Last 30 Days Section */}
        <div className={styles.statsSection}>
          <h2>Last 30 Days</h2>
          <div className={styles.statsCards}>
            <div className={styles.card}>
              <h3>Referrals</h3>
              <p>{last30Days.referrals || 0}</p>
            </div>
            <div className={styles.card}>
              <h3>Visits</h3>
              <p>{last30Days.visits || 0}</p>
            </div>
            <div className={styles.card}>
              <h3>Conversions</h3>
              <p>{last30Days.conversions || 0}</p>
            </div>
          </div>
        </div>

        {/* All-Time Section */}
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
            <div className={styles.card}>
              <h3>Unpaid Earnings</h3>
              <p>${allTime.unpaidEarnings?.toFixed(2) || '0.00'}</p>
            </div>
            <div className={styles.card}>
              <h3>Total Earnings</h3>
              <p>${allTime.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Affiliate Code Section */}
        <div className={styles.affiliateCodeSection}>
          <h2>Your Affiliate Code</h2>
          <div className={styles.affiliateCodeBox}>
            <span>{affiliateCode}</span>
          </div>
          <p>Share this code with customers to earn referral rewards!</p>
        </div>

        {/* (Optional) Recent Referral Activity Section */}
        <div className={styles.recentActivity}>
          <h2>Recent Referral Activity</h2>
          {recentActivity.length === 0 ? (
            <p>No recent activity.</p>
          ) : (
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
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

        {/* Withdraw Funds Section */}
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <button
            className={styles.withdrawButton}
            onClick={() => setWithdrawalModalOpen(true)}
          >
            Withdraw Funds
          </button>
        </div>

        {/* Withdrawal Modal */}
        {withdrawalModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Withdraw Funds</h2>
              <label>Amount</label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <label>Withdrawal Method</label>
              <select
                value={withdrawalMethod}
                onChange={(e) => setWithdrawalMethod(e.target.value)}
              >
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Account</option>
              </select>
              {withdrawalMethod === 'paypal' && (
                <>
                  <label>PayPal Email</label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="Enter your PayPal email"
                  />
                </>
              )}
              <div className={styles.modalButtons}>
                <button
                  className={styles.buttonPrimary}
                  onClick={handleWithdrawalSubmit}
                >
                  Submit Withdrawal
                </button>
                <button
                  className={styles.buttonDanger}
                  onClick={() => setWithdrawalModalOpen(false)}
                >
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
