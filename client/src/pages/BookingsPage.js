import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/BookingsPage.module.css';

/**
 * Example component for showing active and past bookings in a Turo-like style.
 */
export default function BookingsPage() {
  const navigate = useNavigate();

  // Auth checks
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu toggling
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Placeholder for demonstration:
  // In a real app, you'd fetch these from your backend (e.g., GET /api/bookings).
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  // Simulate a fetch call on mount
  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your bookings.');
      navigate('/');
      return;
    }

    // Example: replace with real API call
    // Suppose we have an array of active and past booking objects
    const mockActive = [
      // Uncomment to test an active booking
      // {
      //   id: 'abc123',
      //   location: 'London, UK',
      //   hostName: 'Daud',
      //   startDate: '15 Sep 2023',
      //   endDate: '17 Sep 2023',
      //   imageUrl: '/uploads/myCar.jpg',
      // },
    ];
    const mockPast = [
      {
        id: 'p1',
        location: 'Dublin 11',
        hostName: 'Aoife',
        dateRange: '14 Sept 2022 – 18 Sept 2022',
        imageUrl: '/uploads/dublin.jpg',
      },
      {
        id: 'p2',
        location: 'Ebbet Fahmy',
        hostName: 'Yasser',
        dateRange: '15 Sept 2022 – 20 Sept 2022',
        imageUrl: '/uploads/ebbet.jpg',
      },
      {
        id: 'p3',
        location: 'Greater London',
        hostName: 'Jovanna Gabriela',
        dateRange: '30 Aug 2023 – 31 Aug 2023',
        imageUrl: '/uploads/london.jpg',
      },
    ];

    setActiveBookings(mockActive);
    setPastBookings(mockPast);
  }, [isCustomer, navigate]);

  if (!isCustomer) {
    return <div className={styles.loading}>Loading bookings...</div>;
  }

  // If no active bookings, show empty state
  const hasActive = activeBookings.length > 0;
  const hasPast = pastBookings.length > 0;

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
      {isCustomer && (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      <div className={styles.content}>
        <h1 className={styles.title}>Trips</h1>

        {/* If no active bookings */}
        {!hasActive && (
          <div className={styles.emptyState}>
            <h2>No trips booked... yet!</h2>
            <p>
              Time to dust off your bags and start planning your next adventure.
            </p>
            <button
              className={styles.startSearchingBtn}
              onClick={() => navigate('/search')}
            >
              Start searching
            </button>
          </div>
        )}

        {/* If active bookings exist, show them */}
        {hasActive && (
          <section className={styles.section}>
            <h2 className={styles.sectionHeading}>Active Bookings</h2>
            <div className={styles.bookingGrid}>
              {activeBookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <img
                    src={booking.imageUrl}
                    alt="Booking"
                    className={styles.bookingImage}
                  />
                  <div className={styles.bookingInfo}>
                    <h3>{booking.location}</h3>
                    <p>Hosted by {booking.hostName}</p>
                    <p>
                      {booking.startDate} – {booking.endDate}
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
              {pastBookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <img
                    src={booking.imageUrl}
                    alt="Past Booking"
                    className={styles.bookingImage}
                  />
                  <div className={styles.bookingInfo}>
                    <h3>{booking.location}</h3>
                    <p>Hosted by {booking.hostName}</p>
                    <p>{booking.dateRange}</p>
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
