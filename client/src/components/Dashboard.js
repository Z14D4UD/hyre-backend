// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Side menu & styling imports
import SideMenuBusiness from './SideMenuBusiness';
import styles from '../styles/Dashboard.module.css';

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

export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    rentedCars: 0,
    bookings: 0,
    activeCars: 0,
    balance: 0, // make sure we default it to 0
  });
  const [earningsData, setEarningsData] = useState([]);
  const [bookingsOverviewData, setBookingsOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Retrieve token
  const token = (localStorage.getItem('token') || '').trim();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  // Side menu
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Withdrawal modal
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('paypal');
  const [withdrawalDetails, setWithdrawalDetails] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) stats
        const statsRes = await axios.get(`${baseUrl}/business/stats`, axiosConfig);
        // ensure we got the data shape we expect:
        const newStats = statsRes.data || {};
        // fallback to 0 if balance is missing:
        newStats.balance = typeof newStats.balance === 'number' ? newStats.balance : 0;
        setStats(newStats);

        // 2) earnings
        const earningsRes = await axios.get(`${baseUrl}/business/earnings`, axiosConfig);
        setEarningsData(earningsRes.data || []);

        // 3) bookings overview
        const bookingsOverviewRes = await axios.get(`${baseUrl}/business/bookingsOverview`, axiosConfig);
        setBookingsOverviewData(bookingsOverviewRes.data || []);

        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        } else {
          console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
      }
    }

    if (token) fetchData();
  }, [token, baseUrl, navigate]);

  // Prepare chart data
  const earningsChartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{
      label: 'Earnings ($)',
      data: earningsData,
      fill: false,
      borderColor: '#4f3cc9',
      tension: 0.1,
    }],
  };

  const bookingsOverviewChartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{
      label: 'Bookings',
      data: bookingsOverviewData,
      backgroundColor: '#4f3cc9',
    }],
  };

  const rentStatusData = {
    labels: ['Hired', 'Pending', 'Cancelled'],
    datasets: [{
      data: [58, 24, 18],
      backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
    }],
  };

  // Withdrawal handler
  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    try {
      const payload = {
        amount,
        method: withdrawalMethod,
        details: withdrawalMethod === 'paypal'
          ? { paypalEmail: withdrawalDetails }
          : { bankAccount: withdrawalDetails },
      };
      await axios.post(`${baseUrl}/withdrawals`, payload, axiosConfig);
      alert('Withdrawal request submitted successfully!');
      setWithdrawalModalOpen(false);
      // optionally re-fetch stats to update the new balance
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Failed to submit withdrawal request.');
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
          <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
        </header>
        <div className={styles.mainContent}>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Safely handle stats.balance
  const balanceDisplay = (typeof stats.balance === 'number')
    ? stats.balance.toFixed(2)
    : '0.00';

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div
          className={styles.logo}
          onClick={() => navigate('/')}
          style={{ color: '#38b6ff' }}
        >
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1>Dashboard</h1>
          <span>Welcome back, here’s your business overview</span>
        </div>

        <div className={styles.statsCards}>
          <div className={styles.card}>
            <h3>Total Revenue</h3>
            <p>${(stats.totalRevenue || 0).toLocaleString()}</p>
          </div>
          <div className={styles.card}>
            <h3>Bookings</h3>
            <p>{stats.bookings || 0}</p>
          </div>
          <div className={styles.card}>
            <h3>Rented Cars</h3>
            <p>{stats.rentedCars || 0}</p>
          </div>
          <div className={styles.card}>
            <h3>Active Cars</h3>
            <p>{stats.activeCars || 0}</p>
          </div>
          <div className={styles.card}>
            <h3>Balance</h3>
            <p>${balanceDisplay}</p>
            <button
              className={styles.withdrawButton}
              onClick={() => setWithdrawalModalOpen(true)}
            >
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.leftColumn}>
            <div className={styles.chartCard}>
              <h2>Earnings Summary</h2>
              <Line data={earningsChartData} />
            </div>
            <div className={styles.chartCard}>
              <h2>Bookings Overview</h2>
              <Bar data={bookingsOverviewChartData} />
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.chartCard}>
              <h2>Rent Status</h2>
              <Doughnut data={rentStatusData} />
              <div className={styles.rentStatusLabels}>
                <div>Hired <span>58%</span></div>
                <div>Pending <span>24%</span></div>
                <div>Cancelled <span>18%</span></div>
              </div>
            </div>
            <div className={styles.remindersCard}>
              <h2>Reminders</h2>
              <ul>
                <li>Inspect and service the fleet</li>
                <li>Update the rental pricing packages</li>
                <li>Review customer feedback</li>
              </ul>
            </div>
          </div>
        </div>

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
              <label>
                {withdrawalMethod === 'paypal'
                  ? 'PayPal Email'
                  : 'Bank Account Details'}
              </label>
              <input
                type="text"
                value={withdrawalDetails}
                onChange={(e) => setWithdrawalDetails(e.target.value)}
                placeholder={
                  withdrawalMethod === 'paypal'
                    ? 'Enter your PayPal email'
                    : 'Enter bank account info'
                }
              />
              <div className={styles.modalButtons}>
                <button className={styles.buttonPrimary} onClick={handleWithdrawalSubmit}>
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
