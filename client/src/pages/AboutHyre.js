import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/AboutHyre.module.css';

// Example images (placeholders). Replace with your own image paths in src/assets or external URLs.
import phoneImage from '../assets/phone.jpg';   // For "How Hyre Works" hero
// import compareBg from '../assets/compareBg.jpg'; // Removed usage, no image needed for compare section
import bookingSteps from '../assets/bookingSteps.jpg'; // Example usage, remove if you have your own
import airportImage from '../assets/airport.jpg';      // Example usage, remove if you have your own

export default function AboutHyre() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');

  // If you only want the side menu for logged-in customers:
  const isCustomer = token && accountType === 'customer';

  // For toggling the side menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

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

      {/* Side Menu (if user is a customer) */}
      {isCustomer && (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      <div className={styles.content}>
        {/* Section 1: Hero / "How Hyre Works" */}
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1>How Hyre Works</h1>
            <p>
              Skip the traditional car rental counter and connect directly
              with local car rental businesses for a streamlined experience.
            </p>
            <button
              className={styles.heroButton}
              onClick={() => navigate('/search')}
            >
              Find a car
            </button>
          </div>
          <div className={styles.heroImageWrapper}>
            <img
              src={phoneImage}
              alt="Hyre phone app"
              className={styles.heroImage}
            />
          </div>
        </section>

        {/* Section 2: "Hyre vs. car rental" (no background image) */}
        <section className={styles.compareSection}>
          <h2>Hyre vs. car rental</h2>
          <div className={styles.compareGrid}>
            <div className={styles.compareColumn}>
              <h3>Hyre</h3>
              <ul>
                <li>App-based experiences</li>
                <li>No waiting in line</li>
                <li>Thousands of unique makes &amp; models</li>
                <li>Get the exact car you choose</li>
                <li>Pickups &amp; flexible drop-offs</li>
                <li>Local small businesses</li>
                <li>Trusted hosts with real reviews</li>
              </ul>
            </div>
            <div className={styles.compareColumn}>
              <h3>Car rental</h3>
              <ul>
                <li>Standard rental counter experience</li>
                <li>Waiting in line</li>
                <li>Limited car selection</li>
                <li>“Car or similar” guarantee</li>
                <li>Pickup at rental depots only</li>
                <li>Mostly large corporations</li>
                <li>No direct communication with hosts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: "How to book a car" */}
        <section className={styles.bookingStepsSection}>
          <h2>How to book a car</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <h3>1. Find the perfect car</h3>
              <p>
                Just enter where and when you need a car, filter to find the
                best one for you, and read reviews from previous renters.
              </p>
            </div>
            <div className={styles.stepItem}>
              <h3>2. Select a pickup location</h3>
              <p>
                Grab a car nearby or get one delivered to various destinations,
                like airports, hotels, or even your home.
              </p>
            </div>
            <div className={styles.stepItem}>
              <h3>3. Rent &amp; hit the road</h3>
              <p>
                Your host sends you pickup details, and you’re all set! If you
                have questions, you can easily chat with your host or contact
                support.
              </p>
            </div>
          </div>
          <button
            className={styles.browseCarsBtn}
            onClick={() => navigate('/search')}
          >
            Browse cars
          </button>
        </section>

        {/* Section 4: "Why choose Hyre?" */}
        <section className={styles.whySection}>
          <h2>Why choose Hyre?</h2>
          <div className={styles.whyGrid}>
            <div className={styles.whyItem}>
              <h3>Enjoy a streamlined airport experience</h3>
              <p>
                Many airports let Hyre hosts bring cars to airport parking lots
                and garages. Some smaller airports even allow curbside pickup
                by your host.
              </p>
            </div>
            <div className={styles.whyItem}>
              <h3>Get personalized service from a local host</h3>
              <p>
                Hyre hosts are everyday entrepreneurs who share cars in their
                communities, offering local expertise and personalized service.
              </p>
            </div>
            <div className={styles.whyItem}>
              <h3>Relax with support &amp; damage protection</h3>
              <p>
                24/7 support and roadside assistance mean help is just a call
                away. Choose from a range of protection plans for extra peace
                of mind.
              </p>
            </div>
          </div>
          <button
            className={styles.findCarBtn}
            onClick={() => navigate('/search')}
          >
            Find a car
          </button>
        </section>
      </div>
    </div>
  );
}
