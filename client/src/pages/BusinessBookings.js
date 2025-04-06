// client/src/pages/BusinessBookings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Side menu for business users
import SideMenuBusiness from '../components/SideMenuBusiness';

// Import CSS module for styling
import styles from '../styles/BusinessBookings.module.css';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BusinessBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  const isBusiness = token && accountType === 'business';

  // Redirect if not logged in as a business user
  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business to view bookings.');
      navigate('/');
    }
  }, [isBusiness, navigate]);

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // State for bookings and stats
  const [bookings, setBookings] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // e.g., "https://hyre-backend.onrender.com/api"
  // Remove '/api' for static files if necessary:
  const baseUrl = backendUrl.replace('/api', '');

  // Fetch bookings data from the backend
  useEffect(() => {
    axios
      .get(`${backendUrl}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBookings(res.data);
      })
      .catch((err) => {
        console.error('Error fetching bookings:', err);
        alert('Failed to fetch bookings.');
      });
  }, [backendUrl, token]);

  // Process bookings to compute stats and monthly data
  useEffect(() => {
    if (!bookings || !Array.isArray(bookings)) return;

    let upcoming = 0,
      pending = 0,
      active = 0,
      cancelled = 0;
    const monthCounts = Array(12).fill(0);

    bookings.forEach((b) => {
      if (b.status === 'Upcoming') upcoming++;
      if (b.status === 'Pending') pending++;
      if (b.status === 'Active') active++;
      if (b.status === 'Cancelled') cancelled++;

      // Use the startDate for monthly grouping (adjust as needed)
      const start = new Date(b.startDate);
      const monthIndex = start.getMonth(); // 0-based index
      monthCounts[monthIndex] += 1;
    });

    setUpcomingCount(upcoming);
    setPendingCount(pending);
    setActiveCount(active);
    setCancelledCount(cancelled);
    setMonthlyData(monthCounts);
  }, [bookings]);

  // Handle real-time status change (assumes a PATCH endpoint exists)
  const handleStatusChange = (bookingId, newStatus) => {
    axios
      .patch(`${backendUrl}/bookings/${bookingId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Update local state to reflect the status change
        const updatedBookings = bookings.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus } : b
        );
        setBookings(updatedBookings);
      })
      .catch((err) => {
        console.error('Error updating booking status:', err);
        alert('Failed to update status.');
      });
  };

  // Prepare chart data for Bookings Overview
  const chartData = {
    labels: [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ],
    datasets: [
      {
        label: 'Bookings',
        data: monthlyData,
        backgroundColor: '#4f3cc9',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
  };

  return (
    <div className={styles.bookingsContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {/* Side Menu */}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      {/* Main Content */}
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Bookings</h1>

        {/* Top Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <h3>Upcoming</h3>
            <p>{upcomingCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pending</h3>
            <p>{pendingCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Active</h3>
            <p>{activeCount}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Cancelled</h3>
            <p>{cancelledCount}</p>
          </div>
        </div>

        {/* Chart & Add Booking Button */}
        <div className={styles.topSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2>Bookings Overview</h2>
              <span>Last 12 Months</span>
            </div>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className={styles.addBookingContainer}>
            {/* Uncomment and update this if you have an Add Booking page */}
            {/* <button className={styles.addBookingButton} onClick={() => navigate('/add-booking')}>
              Add Booking
            </button> */}
          </div>
        </div>

        {/* Bookings Table */}
        <div className={styles.tableSection}>
          <h2 className={styles.tableTitle}>Bookings List</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.bookingsTable}>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b._id}</td>
                      <td>{b.customerName || 'N/A'}</td>
                      <td>{b.carModel || 'N/A'}</td>
                      <td>{new Date(b.startDate).toLocaleDateString()}</td>
                      <td>{new Date(b.endDate).toLocaleDateString()}</td>
                      <td>${b.price || 0}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[b.status?.toLowerCase()]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'Cancelled' ? (
                          <button
                            className={styles.statusButton}
                            onClick={() => handleStatusChange(b._id, 'Active')}
                          >
                            Re-Activate
                          </button>
                        ) : (
                          <button
                            className={styles.statusButton}
                            onClick={() => handleStatusChange(b._id, 'Cancelled')}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
