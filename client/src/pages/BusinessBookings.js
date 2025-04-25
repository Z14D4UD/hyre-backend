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
  const acctType = (localStorage.getItem('accountType')||'').toLowerCase();
  const isBiz    = token && acctType === 'business';

  useEffect(() => {
    if (!isBiz) {
      alert('Please log in as a business to view bookings.');
      navigate('/');
    }
  }, [isBiz, navigate]);

  const [menuOpen, setMenuOpen]     = useState(false);
  const [bookings, setBookings]     = useState([]);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [counts, setCounts]         = useState({
    upcoming: 0,
    pending:  0,
    active:   0,
    cancelled:0
  });

  const API = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios.get(`${API}/bookings`, { headers:{ Authorization:`Bearer ${token}` }})
      .then(r => setBookings(r.data))
      .catch(() => alert('Failed to fetch bookings.'));
  }, [API, token]);

  useEffect(() => {
    const stats = { upcoming:0, pending:0, active:0, cancelled:0 };
    const months= Array(12).fill(0);
    bookings.forEach(b => {
      stats[b.status.toLowerCase()] += 1;
      months[new Date(b.startDate).getMonth()]++;
    });
    setCounts(stats);
    setMonthlyData(months);
  }, [bookings]);

  const handleStatusChange = (id, newStatus) => {
    axios.patch(`${API}/bookings/${id}/status`, { status:newStatus },
      { headers:{ Authorization:`Bearer ${token}` }})
      .then(() => {
        setBookings(bs => bs.map(b => b._id===id ? {...b, status:newStatus} : b));
      })
      .catch(() => alert('Failed to update status.'));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this booking?')) return;
    axios.delete(`${API}/bookings/${id}`, { headers:{ Authorization:`Bearer ${token}` }})
      .then(() => setBookings(bs => bs.filter(b => b._id!==id)))
      .catch(err => alert(err.response?.data?.msg || 'Delete failed.'));
  };

  const chartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets:[{ data: monthlyData, backgroundColor:'#38b6ff' }]
  };

  const now = new Date();

  return (
    <div className={styles.bookingsContainer}>
      <header className={styles.header}>
        <div className={styles.logo} onClick={()=>navigate('/')}>Hyre</div>
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
          {Object.entries(counts).map(([key,val])=>(
            <div key={key} className={styles.statCard}>
              <h3>{key.charAt(0).toUpperCase()+key.slice(1)}</h3>
              <p>{val}</p>
            </div>
          ))}
        </div>

        <div className={styles.middleSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h2>Bookings Overview</h2>
              <span>Last 12 Months</span>
            </div>
            <div className={styles.chartWrapper}>
              <Bar
                data={chartData}
                options={{ responsive:true, plugins:{ legend:{ display:false } } }}
              />
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
                  {bookings.length===0
                    ? <tr><td colSpan="8" style={{textAlign:'center'}}>No bookings found.</td></tr>
                    : bookings.map(b=> {
                        const ended = new Date(b.endDate) < now;
                        const canDelete = b.status==='Cancelled' || ended;
                        return (
                          <tr key={b._id}>
                            <td>{b._id}</td>
                            <td>{b.customerName}</td>
                            <td>{b.car?`${b.car.make} ${b.car.model}`:'N/A'}</td>
                            <td>{new Date(b.startDate).toLocaleDateString()}</td>
                            <td>{new Date(b.endDate).toLocaleDateString()}</td>
                            <td>${b.basePrice.toFixed(2)}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles[b.status.toLowerCase()]}`}>
                                {b.status}
                              </span>
                            </td>
                            <td className={styles.actionCell}>
                              {b.status==='Pending'
                                ? <>
                                    <button
                                      className={styles.approveBtn}
                                      onClick={()=>handleStatusChange(b._id,'Active')}
                                    >Approve</button>
                                    <button
                                      className={styles.rejectBtn}
                                      onClick={()=>handleStatusChange(b._id,'Cancelled')}
                                    >Reject</button>
                                  </>
                                : canDelete
                                  ? <span
                                      className={styles.deleteIcon}
                                      onClick={()=>handleDelete(b._id)}
                                    >×</span>
                                  : '—'
                              }
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
