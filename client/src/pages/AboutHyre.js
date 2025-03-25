// client/src/pages/AboutHyre.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer'; // If you want side menu for logged-in customers
import SideMenu from '../components/SideMenu';                 // If you want side menu for guests
import styles from '../styles/AboutHyre.module.css';

export default function AboutHyre() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');

  // If you want to show the "customer" side menu if a user is logged in as a customer,
  // otherwise show the "guest" side menu. (Optional)
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Decide which side menu to show
  const isCustomer = token && accountType === 'customer';

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

      {/* Side Menu(s) - optional */}
      {isCustomer ? (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : (
        <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />
      )}

      <div className={styles.content}>

        {/* HERO SECTION with background image */}
        <section className={styles.heroSection}>
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroContent}>
            <h1>How Hyre Works</h1>
            <p>
              Skip the traditional car rental counter and connect directly with local car rental
              businesses for a streamlined experience.
            </p>
            <button className={styles.heroButton} onClick={() => navigate('/search')}>
              Find a car
            </button>
          </div>
        </section>

        {/* Compare Section */}
        <section className={styles.compareSection}>
          <h2>Hyre vs. Car Rental</h2>
          <div className={styles.compareGrid}>
            {/* Left column (Hyre) */}
            <div className={styles.compareColumn}>
              <h3>Hyre</h3>
              <ul>
                <li className={styles.tickItem}>App-based experiences</li>
                <li className={styles.tickItem}>No waiting in line</li>
                <li className={styles.tickItem}>Thousands of unique makes &amp; models</li>
                <li className={styles.tickItem}>Get the exact car you choose</li>
                <li className={styles.tickItem}>Pickups &amp; flexible drop-offs</li>
                <li className={styles.tickItem}>Local small businesses</li>
                <li className={styles.tickItem}>Trusted hosts with real reviews</li>
              </ul>
            </div>

            {/* Right column (Car Rental) */}
            <div className={styles.compareColumn}>
              <h3>Car rental</h3>
              <ul>
                <li className={styles.crossItem}>Standard rental counter experience</li>
                <li className={styles.crossItem}>Waiting in line</li>
                <li className={styles.crossItem}>Limited car selection</li>
                <li className={styles.crossItem}>"Car or similar" guarantee</li>
                <li className={styles.crossItem}>Pickup at retail depots only</li>
                <li className={styles.crossItem}>Mostly large corporations</li>
                <li className={styles.crossItem}>No direct communication with hosts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Booking Steps Section */}
        <section className={styles.bookingStepsSection}>
          <div className={styles.bookingOverlay}></div>
          <div className={styles.bookingContent}>
            <h2>How to Book a Car</h2>
            <div className={styles.stepsGrid}>
              <div className={styles.stepItem}>
                <h3>1. Find the perfect car</h3>
                <p>
                  Just enter where and when you need a car, filter to find the best one for you, and
                  read reviews from previous renters.
                </p>
              </div>
              <div className={styles.stepItem}>
                <h3>2. Select a pickup location</h3>
                <p>
                  Grab a car nearby or get it delivered to various destinations, including many
                  airports, train stations, or your home.
                </p>
              </div>
              <div className={styles.stepItem}>
                <h3>3. Rent &amp; hit the road</h3>
                <p>
                  Your host sends you pickup details, and you’re all set! If you have questions,
                  you can easily chat with your host or contact support.
                </p>
              </div>
            </div>
            <button className={styles.browseCarsBtn} onClick={() => navigate('/search')}>
              Browse cars
            </button>
          </div>
        </section>

        {/* Why Choose Hyre Section */}
        <section className={styles.whySection}>
          <h2>Why Choose Hyre?</h2>
          <div className={styles.whyGrid}>
            <div className={styles.whyItem}>
              <h3>Enjoy a streamlined airport experience</h3>
              <p>
                Many airports across the US and beyond let Hyre businesses bring cars to airport
                parking lots and garages for easy pickup.
              </p>
            </div>
            <div className={styles.whyItem}>
              <h3>Get personalized service from a local host</h3>
              <p>
                Hyre hosts are local car rental businesses in your community, ready to help with your
                travel needs.
              </p>
            </div>
            <div className={styles.whyItem}>
              <h3>Relax with support &amp; protection</h3>
              <p>
                24/7 support and roadside assistance means help is just a call away. Choose from a
                range of coverage options.
              </p>
            </div>
          </div>
          <button className={styles.findCarBtn} onClick={() => navigate('/search')}>
            Find a car
          </button>
        </section>
      </div>
    </div>
  );
}
