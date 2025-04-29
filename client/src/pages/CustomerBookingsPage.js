// client/src/pages/CustomerBookingsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';                               // ← NEW
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/CustomerBookingsPage.module.css';

export default function CustomerBookingsPage() {        // ← keep filename & export aligned
  const navigate = useNavigate();

  /* ───── auth guard ───── */
  const token        = localStorage.getItem('token');
  const accountType  = localStorage.getItem('accountType');
  const isCustomer   = Boolean(token && accountType === 'customer');

  /* ───── side-menu ───── */
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(o => !o);
  const closeMenu  = () => setMenuOpen(false);

  /* ───── bookings ───── */
  const [activeBookings, setActive] = useState([]);
  const [pastBookings,   setPast]   = useState([]);
  const backend = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your bookings.');
      navigate('/');
      return;
    }

    (async () => {
      try {
        const { data } = await axios.get(`${backend}/bookings/customer`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        /* ── normalise + defensive checks ───────────────────────────── */
        const upcoming = [];
        const history  = [];
        const nowMs    = Date.now();

        data.forEach(b => {
          /* skip if car ref was deleted → avoids “images of null” */
          if (!b.car) return;

          const img0 = Array.isArray(b.car.images) && b.car.images.length
            ? `${backend.replace(/\/api$/, '')}/${b.car.images[0]}`
            : '/avatar.svg';

          const card = {
            id:        b._id,
            location:  `${b.car.make ?? ''} ${b.car.model ?? ''}`.trim() || '—',
            hostName:  b.business?.name || 'Host',
            startDate: new Date(b.startDate).toLocaleDateString('en-GB'),
            endDate:   new Date(b.endDate).toLocaleDateString('en-GB'),
            imageUrl:  img0
          };

          (new Date(b.endDate).getTime() >= nowMs ? upcoming : history).push(card);
        });

        setActive(upcoming);
        setPast(history);
      } catch (err) {
        console.error('Booking fetch error:', err);
        alert('Failed to load your bookings.');
      }
    })();
  }, [isCustomer, navigate, backend, token]);

  if (!isCustomer) return <div className={styles.loading}>Loading bookings...</div>;

  const hasActive = activeBookings.length > 0;
  const hasPast   = pastBookings.length   > 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {/* Side Menu */}
      <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      <div className={styles.content}>
        <h1 className={styles.title}>Bookings</h1>

        {/* Empty-state */}
        {!hasActive && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>No trips booked... yet!</h2>
              <p>Time to dust off your bags and start planning your next adventure.</p>
              <button
                className={styles.startSearchingBtn}
                onClick={() => navigate('/search')}
              >Start searching</button>
            </div>
          </div>
        )}

        {/* Active bookings */}
        {hasActive && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Active Bookings</h2>
            <div className={styles.bookingGrid}>
              {activeBookings.map(b => (
                <div key={b.id} className={styles.bookingCard}>
                  <img src={b.imageUrl} alt="booking" className={styles.bookingImage}/>
                  <div className={styles.bookingInfo}>
                    <h3>{b.location}</h3>
                    <p>Hosted by {b.hostName}</p>
                    <p>{b.startDate} – {b.endDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past bookings */}
        {hasPast && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Where you’ve been</h2>
            <div className={styles.bookingGrid}>
              {pastBookings.map(b => (
                <div key={b.id} className={styles.bookingCard}>
                  <img src={b.imageUrl} alt="past booking" className={styles.bookingImage}/>
                  <div className={styles.bookingInfo}>
                    <h3>{b.location}</h3>
                    <p>Hosted by {b.hostName}</p>
                    <p>{b.startDate} – {b.endDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
