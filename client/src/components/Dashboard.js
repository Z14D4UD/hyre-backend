// client/src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Chart.js components
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

// Register Chart.js modules
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

// Import your business side menu & header
import SideMenuBusiness from './SideMenuBusiness'; 
// If your Header is a separate component, import it, otherwise replicate your "Home" header code
// import Header from './Header';

import styles from '../styles/DashboardBusiness.module.css';

export default function BusinessDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Example placeholders for dashboard data
  const [stats, setStats] = useState({
    totalRevenue: 8450,
    rentedCars: 230,
    bookings: 386,
    activeCars: 89
  });

  const [earningsData, setEarningsData] = useState([]);
  const [bookingsOverviewData, setBookingsOverviewData] = useState([]);
  const [carBookings, setCarBookings] = useState([]);

  const navigate = useNavigate();

  // Retrieve token and accountType from localStorage (if you want to verify user)
  const token = (localStorage.getItem('token') || '').trim();
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();

  // Toggle menu open/closed
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // ---------------------------
  // Example: Fetch data on mount
  // ---------------------------
  useEffect(() => {
    // In real usage, fetch from your backend:
    // e.g. axios.get('/api/business/stats', { headers: { Authorization: `Bearer ${token}` } })
    //   .then(response => setStats(response.data))
    //   .catch(err => console.error(err));

    // Placeholder line chart data for "Earnings Summary"
    setEarningsData([12000, 14500, 10000, 18500, 21000, 16500, 18000, 22000, 24000, 20000, 25000, 27000]);

    // Placeholder bar chart data for "Bookings Overview"
    setBookingsOverviewData([985, 760, 890, 700, 1100, 900, 1200, 950, 780, 650, 1000, 1150]);

    // Placeholder table data
    setCarBookings([
      {
        id: 'BK-W1201',
        start: 'Aug 1 2028',
        end: 'Aug 2 2028',
        customer: 'John Doe',
        car: 'Toyota Corolla',
        duration: '2 Days',
        cost: '$150',
        status: 'Hired'
      },
      {
        id: 'BK-W1202',
        start: 'Aug 3 2028',
        end: 'Aug 5 2028',
        customer: 'Sarah Johnson',
        car: 'Honda Civic',
        duration: '3 Days',
        cost: '$210',
        status: 'Pending'
      },
      {
        id: 'BK-W1203',
        start: 'Aug 6 2028',
        end: 'Aug 10 2028',
        customer: 'Charlie Davis',
        car: 'BMW 3 Series',
        duration: '5 Days',
        cost: '$500',
        status: 'Cancelled'
      },
      // Add more if you want...
    ]);
  }, []);

  // Chart configurations
  const earningsChartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Earnings ($)',
        data: earningsData,
        fill: false,
        borderColor: '#4f3cc9',
        tension: 0.1
      }
    ]
  };

  const bookingsOverviewChartData = {
    labels: [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    datasets: [
      {
        label: 'Bookings',
        data: bookingsOverviewData,
        backgroundColor: '#4f3cc9'
      }
    ]
  };

  const rentStatusData = {
    labels: ['Hired', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [58, 24, 18],
        backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c']
      }
    ]
  };

  // Render the header that appears on every page
  // (If you already have a separate Header component, use it instead)
  const renderHeader = () => {
    return (
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>
    );
  };

  // If the user is not logged in or not business, you could optionally redirect:
  // useEffect(() => {
  //   if (!token || accountType !== 'business') {
  //     navigate('/login');
  //   }
  // }, [token, accountType, navigate]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Render the header */}
      {renderHeader()}

      {/* Render the SideMenuBusiness for business users */}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      {/* Main content area */}
      <div className={styles.mainContent}>
        {/* Dashboard Title */}
        <div className={styles.pageTitle}>
          <h1>Dashboard</h1>
          <span>Welcome back, here’s your business overview</span>
        </div>

        {/* Top stats cards */}
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

        {/* Charts & Side panels row */}
        <div className={styles.row}>
          {/* Left column: Earnings Summary (Line) & Bookings Overview (Bar) */}
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

          {/* Right column: Rent Status (Doughnut) & Reminders */}
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

        {/* Car Bookings Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2>Car Bookings</h2>
            <div className={styles.tableSearch}>
              <input type="text" placeholder="Search booking, name, car..." />
              <button>Filter</button>
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
              {carBookings.map((booking, idx) => (
                <tr key={idx}>
                  <td>{booking.id}</td>
                  <td>{booking.start}</td>
                  <td>{booking.end}</td>
                  <td>{booking.customer}</td>
                  <td>{booking.car}</td>
                  <td>{booking.duration}</td>
                  <td>{booking.cost}</td>
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
