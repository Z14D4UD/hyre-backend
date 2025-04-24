// client/src/pages/BusinessBookings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/BusinessBookings.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function BusinessBookings() {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  const isBusiness  = token && accountType === 'business';

  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business to view bookings.');
      navigate('/');
    }
  }, [isBusiness, navigate]);

  const [menuOpen, setMenuOpen]       = useState(false);
  const [bookings, setBookings]       = useState([]);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [counts, setCounts]           = useState({
    upcoming: 0,
    pending:  0,
    active:   0,
    cancelled:0
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios
      .get(`${backendUrl}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setBookings(res.data))
      .catch(() => alert('Failed to fetch bookings.'));
  }, [backendUrl, token]);

  useEffect(() => {
    const stats = { upcoming:0, pending:0, active:0, cancelled:0 };
    const months= Array(12).fill(0);
    bookings.forEach(b => {
      stats[b.status.toLowerCase()] += 1;
      const m = new Date(b.startDate).getMonth();
      months[m]++;
    });
    setCounts(stats);
    setMonthlyData(months);
  }, [bookings]);

  const handleStatusChange = (id, newStatus) => {
    axios
      .patch(`${backendUrl}/bookings/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setBookings(bs => bs.map(b => (
          b._id === id ? { ...b, status: newStatus } : b
        )));
      })
      .catch(() => alert('Failed to update status.'));
  };

  const chartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets:[{
      label: 'Bookings',
      data: monthlyData,
      backgroundColor: '#38b6ff',
    }]
  };

  return (
    <div className={styles.bookingsContainer}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
      </header>

      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={()=>setMenuOpen(o=>!o)}
        closeMenu={()=>setMenuOpen(false)}
      />

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Bookings</h1>

        <div className={styles.statsRow}>
          {['upcoming','pending','active','cancelled'].map(key=>(
            <div key={key} className={styles.statCard}>
              <h3>{key.charAt(0).toUpperCase()+key.slice(1)}</h3>
              <p>{counts[key]}</p>
            </div>
          ))}
        </div>

        <div className={styles.topSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2>Bookings Overview</h2>
              <span>Last 12 Months</span>
            </div>
            <div className={styles.chartWrapper}>
              <Bar data={chartData} options={{ responsive:true, plugins:{ legend:{ display:false } } }} />
            </div>
          </div>
        </div>

        <section className={styles.tableSection}>
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
                {bookings.length === 0
                  ? <tr><td colSpan="8" style={{textAlign:'center'}}>No bookings found.</td></tr>
                  : bookings.map(b => (
                    <tr key={b._id}>
                      <td>{b._id}</td>
                      <td>{b.customerName}</td>
                      <td>{b.car ? `${b.car.make} ${b.car.model}` : 'N/A'}</td>
                      <td>{new Date(b.startDate).toLocaleDateString()}</td>
                      <td>{new Date(b.endDate).toLocaleDateString()}</td>
                      <td>${b.basePrice.toFixed(2)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className={styles.actionCell}>
                        {b.status === 'Pending' && (
                          <>
                            <button
                              className={styles.approveBtn}
                              onClick={()=>handleStatusChange(b._id,'Active')}
                            >
                              Approve
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={()=>handleStatusChange(b._id,'Cancelled')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {b.status !== 'Pending' && '—'}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
