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

import SideMenuBusiness from './SideMenuBusiness';
import styles from '../styles/Dashboard.module.css';

// Register Chart.js components
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
    balance: 0,
  });
  const [earningsData, setEarningsData] = useState([]);
  const [bookingsOverviewData, setBookingsOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = (localStorage.getItem('token') || '').trim();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const baseUrl = process.env.REACT_APP_BACKEND_URL;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Withdrawal modal states
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('paypal');
  const [paypalEmail, setPaypalEmail] = useState(''); // For PayPal only

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsRes = await axios.get(`${baseUrl}/business/stats`, axiosConfig);
        setStats(statsRes.data);

        // Fetch earnings data
        const earningsRes = await axios.get(`${baseUrl}/business/earnings`, axiosConfig);
        setEarningsData(earningsRes.data);

        // Fetch bookings overview
        const bookingsOverviewRes = await axios.get(`${baseUrl}/business/bookingsOverview`, axiosConfig);
        setBookingsOverviewData(bookingsOverviewRes.data);

        setLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Unauthorized, redirect to login
          navigate('/login');
        } else {
          console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
      }
    }
    if (token) {
      fetchData();
    }
  }, [token, baseUrl, navigate]);

  // Chart data for Earnings
  const earningsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Earnings ($)',
      data: earningsData,
      fill: false,
      borderColor: '#4f3cc9',
      tension: 0.1
    }]
  };

  // Chart data for Bookings Overview
  const bookingsOverviewChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Bookings',
      data: bookingsOverviewData,
      backgroundColor: '#4f3cc9'
    }]
  };

  // Example Rent Status chart (static or replace with dynamic data)
  const rentStatusData = {
    labels: ['Hired', 'Pending', 'Cancelled'],
    datasets: [{
      data: [58, 24, 18],
      backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c']
    }]
  };

  // Handle withdrawal submission
  const handleWithdrawalSubmit = async () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }

    // If the user selected bank account, we'll skip the usual POST to /withdrawals
    // and redirect them to connect bank. Alternatively, you could do a partial check
    // if they have a stripeAccountId, etc.
    if (withdrawalMethod === 'bank') {
      // Here, you might want to store the intended withdrawal amount in session/localStorage
      // or pass it as a query param to /connect-bank
      localStorage.setItem('pendingWithdrawalAmount', withdrawalAmount);
      navigate('/connect-bank');
      return;
    }

    // If PayPal was selected, we call /withdrawals
    try {
      const payload = {
        amount,
        method: 'paypal',
        details: {
          paypalEmail,
        },
      };
      await axios.post(`${baseUrl}/withdrawals`, payload, axiosConfig);
      alert('Withdrawal request submitted successfully!');
      setWithdrawalModalOpen(false);
      // Optionally refresh stats or do something else
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Failed to submit withdrawal request.');
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            Hyre
          </div>
          <button className={styles.menuIcon} onClick={toggleMenu}>
            ☰
          </button>
        </header>
        <div className={styles.mainContent}>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div
          className={styles.logo}
          onClick={() => navigate('/')}
          style={{ color: '#38b6ff' }}
        >
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Side Menu */}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.pageTitle}>
          <h1>Dashboard</h1>
          <span>Welcome back, here’s your business overview</span>
        </div>

        <div className={styles.statsCards}>
          <div className={styles.card}>
            <h3>Total Revenue</h3>
            <p>${stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className={styles.card}>
            <h3>Bookings</h3>
            <p>{stats.bookings}</p>
          </div>
          <div className={styles.card}>
            <h3>Rented Cars</h3>
            <p>{stats.rentedCars}</p>
          </div>
          <div className={styles.card}>
            <h3>Active Cars</h3>
            <p>{stats.activeCars}</p>
          </div>
          <div className={styles.card}>
            <h3>Balance</h3>
            <p>${stats.balance.toFixed(2)}</p>
            {/* A nicely styled "round" button for withdrawals */}
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
                <div>
                  Hired <span>58%</span>
                </div>
                <div>
                  Pending <span>24%</span>
                </div>
                <div>
                  Cancelled <span>18%</span>
                </div>
              </div>
            </div>

            <div className={styles.remindersCard}>
              <h2>Reminders</h2>
              <ul>
                <li>Inspect and service the fleet</li>
                <li>Update the rental pricing packages</li>
                <li>Review customer feedback</li>
              </ul>
              {/* Add an Edit button to manage reminders, if needed */}
            </div>
          </div>
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
                onChange={(e) => {
                  setWithdrawalMethod(e.target.value);
                }}
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
              {/* 
                If user selects bank, we do NOT show any bank details field,
                since we will redirect them to /connect-bank upon submit.
              */}

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
