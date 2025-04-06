// client/src/pages/BookingsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/CustomerBookingsPage.module.css';

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

  // Placeholder data – replace with your API call later
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);

  useEffect(() => {
    if (!isCustomer) {
      alert('Please log in as a customer to view your bookings.');
      navigate('/');
      return;
    }

    // For demonstration, we simulate fetching booking data.
    // Replace with real API call (e.g., axios.get('/api/bookings'))
    const mockActive = [
      // Example active booking (uncomment to test)
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
        <h1 className={styles.title}>Bookings</h1>

        {/* Empty State: No Active Bookings */}
        {!hasActive && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
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
          </div>
        )}

        {/* Active Bookings */}
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
