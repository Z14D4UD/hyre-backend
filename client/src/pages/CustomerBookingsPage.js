// client/src/pages/BookingsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate }            from 'react-router-dom';
import axios                      from 'axios';               // NEW
import SideMenuCustomer           from '../components/SideMenuCustomer';
import styles                     from '../styles/CustomerBookingsPage.module.css';

export default function BookingsPage() {
  const navigate = useNavigate();

  // Auth checks
  const token       = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer  = token && accountType === 'customer';

  // Side menu toggling
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu  = () => setMenuOpen(false);

  // Live data
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings,   setPastBookings]   = useState([]);

  const BACKEND = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your bookings.');
      navigate('/');
      return;
    }

    /* ── fetch real bookings ── */
    (async () => {
      try {
        const { data } = await axios.get(`${BACKEND}/bookings/customer`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const today = new Date().setHours(0,0,0,0);
        const upcoming = [];
        const past     = [];

        data.forEach(b => {
          const end = new Date(b.endDate).setHours(0,0,0,0);
          (end >= today ? upcoming : past).push(b);
        });

        setActiveBookings(upcoming);
        setPastBookings(past);
      } catch (err) {
        console.error('Fetch bookings error:', err);
      }
    })();
  }, [isCustomer, navigate, token, BACKEND]);

  if (!isCustomer) {
    return <div className={styles.loading}>Loading bookings…</div>;
  }

  const hasActive = activeBookings.length > 0;
  const hasPast   = pastBookings.length > 0;

  /* helpers to build card content */
  const leadPhoto = car => {
    const base = BACKEND.replace(/\/api$/,'');
    return car.images?.[0] ? `${base}/${car.images[0]}` : '/avatar.svg';
  };
  const hostName = b => b.business?.name || 'Host';

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Side Menu */}
      <SideMenuCustomer
        isOpen={menuOpen}
        toggleMenu={toggleMenu}
        closeMenu={closeMenu}
      />

      <div className={styles.content}>
        <h1 className={styles.title}>Bookings</h1>

        {/* Empty State: No Active Bookings */}
        {!hasActive && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>No trips booked… yet!</h2>
              <p>Time to dust off your bags and start planning your next adventure.</p>
              <button
                className={styles.startSearchingBtn}
                onClick={() => navigate('/search')}
              >
                Start searching
              </button>
            </div>
          </div>
        )}

        {/* Active Bookings */}
        {hasActive && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Active bookings</h2>
            <div className={styles.bookingGrid}>
              {activeBookings.map(b => (
                <div
                  key={b._id}
                  className={styles.bookingCard}
                  onClick={() => navigate(`/booking/${b._id}`)}
                >
                  <img
                    src={leadPhoto(b.car)}
                    alt="Booking"
                    className={styles.bookingImage}
                  />
                  <div className={styles.bookingInfo}>
                    <h3>{b.car.make} {b.car.model}</h3>
                    <p>Hosted by {hostName(b)}</p>
                    <p>
                      {new Date(b.startDate).toLocaleDateString()} –{' '}
                      {new Date(b.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past Bookings */}
        {hasPast && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Where you’ve been</h2>
            <div className={styles.bookingGrid}>
              {pastBookings.map(b => (
                <div key={b._id} className={styles.bookingCard}>
                  <img
                    src={leadPhoto(b.car)}
                    alt="Past Booking"
                    className={styles.bookingImage}
                  />
                  <div className={styles.bookingInfo}>
                    <h3>{b.car.make} {b.car.model}</h3>
                    <p>Hosted by {hostName(b)}</p>
                    <p>
                      {new Date(b.startDate).toLocaleDateString()} –{' '}
                      {new Date(b.endDate).toLocaleDateString()}
                    </p>
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
