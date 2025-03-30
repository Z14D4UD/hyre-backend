// client/src/pages/LegalPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import styles from '../styles/LegalPage.module.css';

export default function LegalPage() {
  const navigate = useNavigate();

  // Check if user is logged in as a customer
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

      {/* Side Menu: if logged in as customer, show SideMenuCustomer; else show SideMenu */}
      {isCustomer ? (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : (
        <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />
      )}

      <div className={styles.content}>
        <h1 className={styles.title}>Legal matters</h1>
        <div className={styles.navBar}>
          {/* Example sub-navigation (like Turo’s “Terms of service,” etc.) */}
          <ul className={styles.navLinks}>
            <li>Terms of service</li>
            <li>Cancellation policy</li>
            <li>Privacy policy</li>
            <li>Insurance disclaimers</li>
            <li>Additional policies</li>
            <li>Gift card terms</li>
          </ul>
        </div>

        <div className={styles.legalContent}>
          <h2>Terms of Service</h2>
          <p>Last revised: March 30, 2025</p>
          <p>
            PLEASE READ THESE TERMS OF SERVICE CAREFULLY. THEY CONTAIN IMPORTANT INFORMATION
            THAT AFFECTS YOUR RIGHTS, REMEDIES, AND OBLIGATIONS. THEY INCLUDE AN AGREEMENT
            TO ARBITRATE (UNLESS YOU OPT OUT), THEY MAY ALSO INCLUDE A PROHIBITION OF CLASS
            AND REPRESENTATIVE ACTIONS AND NON-INDIVIDUALIZED RELIEF FOR ALL MATTERS IN THEIR
            ENTIRETY OR THE EXTENT PERMITTED BY LAW. VARIOUS LIMITATIONS AND EXCLUSIONS.
          </p>
          <p>
            These terms apply to your use of the Hyre website, platform, and services
            (collectively, the &quot;Services&quot;). By accessing or using our Services, you
            agree to be bound by these Terms. If you do not agree, you may not access or
            use our Services.
          </p>

          <h3>Insurance Disclaimer</h3>
          <p>
            <strong>Hyre does not provide insurance</strong> for rental businesses. Rental
            businesses that list their vehicles on Hyre are solely responsible for obtaining
            any necessary insurance coverage to protect themselves and their customers.
            Hyre is not liable for any damages, losses, or claims arising out of or in
            connection with the rental transactions facilitated by our platform.
          </p>

          <h3>Eligibility, Registration, Verification</h3>
          <p>
            Users must meet certain criteria to use the Services, including being of legal
            driving age in your jurisdiction. You may be required to register for an account
            and provide certain personal information. You are responsible for the accuracy
            of this information.
          </p>

          <h3>Payment &amp; Fees</h3>
          <p>
            Some aspects of the Services may require payment of fees. All fees are stated in
            your local currency unless otherwise specified. You agree to pay any applicable
            fees or taxes. We may change our fees at any time; any fee changes will be
            disclosed in advance.
          </p>

          <h3>Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, HYRE SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF
            PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF
            DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>

          <h3>Governing Law &amp; Dispute Resolution</h3>
          <p>
            These Terms shall be governed by the laws of your jurisdiction. Any disputes
            arising out of or relating to these Terms or the Services shall be resolved
            through binding arbitration, except where prohibited by law.
          </p>

          <h3>Changes to These Terms</h3>
          <p>
            We may modify these Terms at any time. We will post the most current version on
            our website. By continuing to use or access the Services after any revisions
            become effective, you agree to be bound by the updated Terms.
          </p>

          <h3>Contact Us</h3>
          <p>
            If you have any questions about these Terms or any of our legal policies,
            please contact our support team at{' '}
            <a href="mailto:support@hyre.com">support@hyre.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
