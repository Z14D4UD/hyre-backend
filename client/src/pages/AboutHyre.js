// client/src/pages/AboutHyre.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/AboutHyre.module.css';

export default function AboutHyre() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu state
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

      {/* If user is a customer, show side menu */}
      {isCustomer && (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      <div className={styles.content}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          {/* The overlay over the background image */}
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
          <h2>Hyre vs. car rental</h2>
          <div className={styles.compareGrid}>
            {/* Hyre Column */}
            <div className={styles.compareColumn}>
              <h3>Hyre</h3>
              <ul>
                <li className={styles.tickItem}>Online experiences</li>
                <li className={styles.tickItem}>No waiting in line</li>
                <li className={styles.tickItem}>Thousands of unique makes & models</li>
                <li className={styles.tickItem}>Get the exact car you choose</li>
                <li className={styles.tickItem}>Pickups & flexible drop-offs</li>
                <li className={styles.tickItem}>Great Rewards for boooking on Hyre</li>
                <li className={styles.tickItem}>Trusted local businesses with real reviews</li>
              </ul>
            </div>
            {/* Car Rental Column */}
            <div className={styles.compareColumn}>
              <h3>Car rental</h3>
              <ul>
                <li className={styles.xItem}>Standard rental counter experience</li>
                <li className={styles.xItem}>Waiting in line</li>
                <li className={styles.xItem}>Limited car selection</li>
                <li className={styles.xItem}>"Car or similar" guarantee</li>
                <li className={styles.xItem}>Pickup at rental depots only</li>
                <li className={styles.xItem}>Mostly large corporations</li>
                <li className={styles.xItem}>Limited Support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Booking Steps Section */}
        <section className={styles.bookingStepsSection}>
          {/* Opacity overlay for background */}
          <div className={styles.stepsOverlay}></div>

          <div className={styles.stepsContent}>
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
                  Grab a car nearby or get delivered to various destinations, including many
                  airports, train stations, or even your home.
                </p>
              </div>
              <div className={styles.stepItem}>
                <h3>3. Rent & hit the road</h3>
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

        {/* Why Section */}
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
                Hyre hosts are local small businesses who share cars in their communities,
                offering more flexible arrangements.
              </p>
            </div>
            <div className={styles.whyItem}>
              <h3>Relax with support & damage protection</h3>
              <p>
                24/7 support and roadside assistance mean help is just a call away. You can choose
                from a range of protection plans.
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
