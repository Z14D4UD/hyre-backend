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

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

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
    if (!Array.isArray(bookings)) return;

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

      const start = new Date(b.startDate);
      monthCounts[start.getMonth()] += 1;
    });

    setUpcomingCount(upcoming);
    setPendingCount(pending);
    setActiveCount(active);
    setCancelledCount(cancelled);
    setMonthlyData(monthCounts);
  }, [bookings]);

  // Handle real-time status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.patch(
        `${backendUrl}/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update status.');
    }
  };

  // Chart configuration
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
    maintainAspectRatio: false,
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
          {[
            ['Upcoming', upcomingCount, 'upcoming'],
            ['Pending', pendingCount, 'pending'],
            ['Active', activeCount, 'active'],
            ['Cancelled', cancelledCount, 'cancelled'],
          ].map(([label, count]) => (
            <div key={label} className={styles.statCard}>
              <h3>{label}</h3>
              <p>{count}</p>
            </div>
          ))}
        </div>

        {/* Chart & Table Section */}
        <div className={styles.middleSection}>
          <div className={styles.chartWrapper}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h2>Bookings Overview</h2>
                <span>Last 12 Months</span>
              </div>
              <div className={styles.chartInner}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <div className={styles.tableSection}>
              <h2 className={styles.tableTitle}>Bookings List</h2>
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
                    bookings.map((b) => {
                      const carLabel = b.car && b.car.make
                        ? `${b.car.make} ${b.car.model}`
                        : 'N/A';
                      return (
                        <tr key={b._id}>
                          <td>{b._id}</td>
                          <td>{b.customerName || 'N/A'}</td>
                          <td>{carLabel}</td>
                          <td>{new Date(b.startDate).toLocaleDateString()}</td>
                          <td>{new Date(b.endDate).toLocaleDateString()}</td>
                          <td>${b.totalAmount.toFixed(2)}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === 'Pending' ? (
                              <>
                                <button
                                  className={styles.approveBtn}
                                  onClick={() => handleStatusChange(b._id, 'Active')}
                                >
                                  Approve
                                </button>
                                <button
                                  className={styles.rejectBtn}
                                  onClick={() => handleStatusChange(b._id, 'Cancelled')}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
