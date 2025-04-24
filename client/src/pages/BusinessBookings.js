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
  const navigate    = useNavigate();
  const token       = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  const isBusiness  = token && accountType === 'business';

  // Redirect if not logged in as a business user
  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business to view bookings.');
      navigate('/');
    }
  }, [isBusiness, navigate]);

  const [menuOpen,      setMenuOpen]      = useState(false);
  const [bookings,      setBookings]      = useState([]);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [pendingCount,  setPendingCount]  = useState(0);
  const [activeCount,   setActiveCount]   = useState(0);
  const [cancelledCount,setCancelledCount]= useState(0);
  const [monthlyData,   setMonthlyData]   = useState(Array(12).fill(0));

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const baseUrl    = backendUrl.replace('/api','');

  // Fetch bookings
  useEffect(() => {
    axios.get(`${backendUrl}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setBookings(res.data))
    .catch(err => {
      console.error('Error fetching bookings:', err);
      alert('Failed to fetch bookings.');
    });
  }, [backendUrl, token]);

  // Compute stats
  useEffect(() => {
    let up=0, pe=0, ac=0, ca=0;
    const months = Array(12).fill(0);
    bookings.forEach(b => {
      if (b.status==='Upcoming') up++;
      if (b.status==='Pending')   pe++;
      if (b.status==='Active')    ac++;
      if (b.status==='Cancelled') ca++;
      const m = new Date(b.startDate).getMonth();
      months[m]++;
    });
    setUpcomingCount(up);
    setPendingCount(pe);
    setActiveCount(ac);
    setCancelledCount(ca);
    setMonthlyData(months);
  }, [bookings]);

  // Approve / Reject (simplified)
  const handleStatusChange = (bookingId, newStatus) => {
    axios.patch(
      `${backendUrl}/bookings/${bookingId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      setBookings(bs =>
        bs.map(b => b._id===bookingId ? { ...b, status:newStatus } : b)
      );
    })
    .catch(err => {
      console.error('Error updating booking status:', err);
      alert('Failed to update status.');
    });
  };

  // Chart config
  const chartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{ label:'Bookings', data:monthlyData, backgroundColor:'#4f3cc9' }]
  };
  const chartOptions = { responsive:true, plugins:{ legend:{display:false} } };

  return (
    <div className={styles.bookingsContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={()=>navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
      </header>

      {/* Side Menu */}
      <SideMenuBusiness
        isOpen={menuOpen}
        toggleMenu={()=>setMenuOpen(o=>!o)}
        closeMenu={()=>setMenuOpen(false)}
      />

      {/* Main */}
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Bookings</h1>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}><h3>Upcoming</h3><p>{upcomingCount}</p></div>
          <div className={styles.statCard}><h3>Pending</h3><p>{pendingCount}</p></div>
          <div className={styles.statCard}><h3>Active</h3><p>{activeCount}</p></div>
          <div className={styles.statCard}><h3>Cancelled</h3><p>{cancelledCount}</p></div>
        </div>

        {/* Chart + Table Side by Side */}
        <div className={styles.middleSection}>
          <div className={styles.chartWrapper}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.bookingsTable}>
              <thead>
                <tr>
                  <th>Booking ID</th><th>Customer</th><th>Car</th>
                  <th>Start</th><th>End</th><th>Price</th>
                  <th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length===0
                  ? <tr><td colSpan="8" style={{ textAlign:'center' }}>No bookings found.</td></tr>
                  : bookings.map(b=>(
                      <tr key={b._id}>
                        <td>{b._id}</td>
                        <td>{b.customerName||'N/A'}</td>
                        <td>{b.car?.make + ' ' + b.car?.model || 'N/A'}</td>
                        <td>{new Date(b.startDate).toLocaleDateString()}</td>
                        <td>{new Date(b.endDate).toLocaleDateString()}</td>
                        <td>${b.totalAmount?.toFixed(2)||0}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[b.status?.toLowerCase()]}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.status==='Pending' ? (
                            <>
                              <button
                                className={styles.statusButton}
                                onClick={()=>handleStatusChange(b._id,'Active')}
                              >Approve</button>
                              <button
                                className={styles.statusButton}
                                onClick={()=>handleStatusChange(b._id,'Cancelled')}
                              >Reject</button>
                            </>
                          ) : <em>—</em>}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
