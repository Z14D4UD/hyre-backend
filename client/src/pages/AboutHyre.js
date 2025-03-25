// client/src/pages/AboutHyre.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// If user is not logged in or not a customer, we show the normal side menu
import SideMenu from '../components/SideMenu';
// If user is a logged-in customer, we show the customer side menu
import SideMenuCustomer from '../components/SideMenuCustomer';

import styles from '../styles/AboutHyre.module.css';
import heroImage from '../assets/lambo.jpg'; // example hero background
import heroOverlay from '../assets/phone.jpg';  // optional overlay or you can do pure CSS

export default function AboutHyre() {
  const navigate = useNavigate();

  // Check login
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // State for toggling side menu
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

      {/* Conditionally render the side menu */}
      {isCustomer ? (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      ) : (
        <SideMenu
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
        />
      )}

      {/* Main content */}
      <div className={styles.content}>

        {/* Hero Section with background image and overlay */}
        <section
          className={styles.heroSection}
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* optional semi-transparent overlay via CSS or inline style */}
          <div className={styles.heroOverlay}></div>

          <div className={styles.heroText}>
            <h1>How Hyre Works</h1>
            <p>
              Skip the traditional car rental counter and connect directly with local car
              rental businesses for a streamlined experience.
            </p>
            <button className={styles.heroButton} onClick={() => navigate('/search')}>
              Find a car
            </button>
          </div>
        </section>

        {/* Compare Section: "Hyre vs Large car rental companies" */}
        <section className={styles.compareSection}>
          <h2>Hyre vs Large car rental companies</h2>
          <div className={styles.compareGrid}>
            {/* Left column */}
            <div className={styles.compareColumn}>
              <h3>Hyre</h3>
              <ul>
                <li className={styles.tick}>Easy online experience</li>
                <li className={styles.tick}>No waiting in line</li>
                <li className={styles.tick}>Thousands of unique makes &amp; models</li>
                <li className={styles.tick}>Get the exact car you choose</li>
                <li className={styles.tick}>Pickups &amp; flexible drop-offs</li>
                <li className={styles.tick}>Local small businesses</li>
                <li className={styles.tick}>Trusted hosts with real reviews</li>
              </ul>
            </div>
            {/* Right column */}
            <div className={styles.compareColumn}>
              <h3>Car rental</h3>
              <ul>
                <li className={styles.cross}>Standard rental counter experience</li>
                <li className={styles.cross}>Waiting in line</li>
                <li className={styles.cross}>Limited car selection</li>
                <li className={styles.cross}>"Car or similar" guarantee</li>
                <li className={styles.cross}>Pickup at rental depots only</li>
                <li className={styles.cross}>Mostly large corporations</li>
                <li className={styles.cross}>Credit check required</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Booking Steps Section with background + opacity */}
        <section className={styles.bookingStepsSection}>
          <h2>How to book a car</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepItem}>
              <h3>1. Find the perfect car</h3>
              <p>
                Just enter where and when you need a car, filter to find the best one for you,
                and read reviews from previous renters.
              </p>
            </div>
            <div className={styles.stepItem}>
              <h3>2. Select a pickup location</h3>
              <p>
                Grab a car nearby or get it delivered to various destinations, including many
                airports, train stations, hotels, or maybe even your home.
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
        </section>

        {/* Why choose Hyre section */}
        <section className={styles.whySection}>
          <h2>Why choose Hyre?</h2>
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
                Hyre hosts are everyday entrepreneurs who share cars in their communities.
              </p>
            </div>
            <div className={styles.whyItem}>
              <h3>Relax with support &amp; damage protection</h3>
              <p>
                24/7 support and roadside assistance mean help is just a call away, plus you
                can choose from a range of protection plans.
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
