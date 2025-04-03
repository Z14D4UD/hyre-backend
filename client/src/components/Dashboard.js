// client/src/components/Dashboard.js

// 1. All imports at the very top
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

// 2. Chart.js registration (still near the top, but after all imports)
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

// 3. Define your component
export default function Dashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    rentedCars: 0,
    bookings: 0,
    activeCars: 0
  });
  const [earningsData, setEarningsData] = useState([]);
  const [bookingsOverviewData, setBookingsOverviewData] = useState([]);
  const [carBookings, setCarBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // Retrieve token from localStorage
  const token = (localStorage.getItem('token') || '').trim();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const baseUrl = process.env.REACT_APP_BACKEND_URL;
        // Example calls to fetch data:
        const statsRes = await axios.get(`${baseUrl}/api/business/stats`, axiosConfig);
        setStats(statsRes.data);

        const earningsRes = await axios.get(`${baseUrl}/api/business/earnings`, axiosConfig);
        setEarningsData(earningsRes.data);

        const bookingsOverviewRes = await axios.get(`${baseUrl}/api/business/bookingsOverview`, axiosConfig);
        setBookingsOverviewData(bookingsOverviewRes.data);

        const bookingsRes = await axios.get(`${baseUrl}/api/bookings/mybookings`, axiosConfig);
        setCarBookings(bookingsRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [token]);

  // Prepare chart data
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

  const bookingsOverviewChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Bookings',
      data: bookingsOverviewData,
      backgroundColor: '#4f3cc9'
    }]
  };

  const rentStatusData = {
    labels: ['Hired', 'Pending', 'Cancelled'],
    datasets: [{
      data: [58, 24, 18],
      backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c']
    }]
  };

  // Filter bookings based on search query
  const filteredBookings = carBookings.filter((booking) =>
    booking._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (booking.customerName && booking.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (booking.car && booking.car.make && booking.car.make.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderHeader = () => (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
      <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
    </header>
  );

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        {renderHeader()}
        <div className={styles.mainContent}>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {renderHeader()}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
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
                <li>Update the car rental pricing packages</li>
                <li>Review customer feedback and take action</li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2>Car Bookings</h2>
            <div className={styles.tableSearch}>
              <input
                type="text"
                placeholder="Search booking, name, car..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Customer</th>
                <th>Car</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, idx) => (
                <tr key={idx}>
                  <td>{booking._id}</td>
                  <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                  <td>{booking.customerName}</td>
                  <td>{booking.car ? `${booking.car.make} ${booking.car.model}` : 'N/A'}</td>
                  <td>{booking.duration || 'N/A'}</td>
                  <td>{booking.cost || '$' + booking.totalAmount}</td>
                  <td>
                    <span
                      className={
                        booking.status === 'Hired'
                          ? styles.hired
                          : booking.status === 'Pending'
                          ? styles.pending
                          : styles.cancelled
                      }
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
