// client/src/pages/LegalPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import the side menus – if logged in, use the customer version; if not, use the public version
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';

import styles from '../styles/LegalPage.module.css';

export default function LegalPage() {
  const navigate = useNavigate();

  // Determine login status (for showing the correct side menu)
  const token = localStorage.getItem('token');
  const accountType = localStorage.getItem('accountType');
  const isCustomer = token && accountType === 'customer';

  // Side menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Define the legal sections with sample text
  const sections = [
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      content: `
Welcome to Hyre! These Terms of Service ("Terms") govern your access to and use of the Hyre platform (the "Service"). By accessing or using our Service, you agree to these Terms. If you do not agree to these Terms, please do not use our Service.

1. Eligibility
You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you meet the eligibility requirements.

2. User Accounts
When you sign up for an account, you agree to provide accurate and complete information. You are responsible for safeguarding your account credentials and for any activity that occurs under your account.

3. Use of the Service
Hyre is a platform that connects local car rental businesses with customers. You agree to use the Service only for lawful purposes and in compliance with all applicable laws and regulations. You also agree not to use the Service to:

Transmit any harmful or illegal content.

Engage in fraudulent or deceptive practices.

Interfere with the operation of the Service or attempt to gain unauthorized access.

4. Bookings and Transactions
When you book a car through Hyre, you acknowledge that the final terms, pricing, and conditions are set by the rental business. Hyre is not a party to the rental agreement between you and the rental business. You agree to review and abide by the rental business’s terms and conditions before completing any booking.

5. Payment and Fees
Payments for bookings are processed through secure third-party providers. By using the Service, you consent to the collection and use of your payment information as described in our Privacy Policy. Any fees charged by Hyre will be clearly disclosed at the time of booking.

6. Content and Intellectual Property
All content on the Service (text, graphics, logos, images, etc.) is the property of Hyre or its licensors. You agree not to reproduce, distribute, or create derivative works without our prior written permission.

7. Disclaimers and Limitation of Liability
Hyre is provided on an “as is” and “as available” basis without any warranties of any kind. Hyre does not provide insurance for rental businesses or guarantee the quality, safety, or availability of any vehicle. In no event shall Hyre be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.

8. Indemnification
You agree to indemnify and hold Hyre harmless from any claims, damages, or expenses arising from your violation of these Terms or your use of the Service.

9. Modifications to Terms
Hyre reserves the right to update these Terms at any time. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.

10. Governing Law
These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction]. Any disputes arising from these Terms shall be resolved in the courts of [Your Jurisdiction].

If you have any questions about these Terms, please contact us at support@hyre.com.
      `,
    },
    {
      id: 'cancellation-policy',
      title: 'Cancellation Policy',
      content: `
Hyre aims to provide a seamless and transparent booking experience for both customers and local car rental businesses. This Cancellation Policy outlines your rights and responsibilities when cancelling a booking made through the Hyre platform.

1. Cancellation Process

Customer Responsibility: If you need to cancel a booking, you must do so directly through the Hyre platform. Follow the cancellation instructions provided in your booking confirmation email.

Rental Business Terms: Please note that each rental business sets its own cancellation terms and conditions. You are responsible for reviewing and adhering to the specific cancellation policies provided by the rental business when you make your booking.

Timeframe: Cancellations made within the timeframe specified by the rental business’s policy will be processed accordingly. Cancellations made after this period may be subject to cancellation fees or may be non-refundable.

2. Refunds and Charges

Refunds, if applicable, will be processed according to the rental business’s policy.

Any fees or charges related to the cancellation (as outlined by the rental business) will be deducted from your refund, if a refund is due.

3. Communication
Once you cancel a booking, you will receive a confirmation email outlining the cancellation details and any applicable fees or refund amounts. If you have any questions regarding a cancellation, please contact the rental business directly or reach out to Hyre support for assistance.

4. Modifications
Hyre reserves the right to modify this Cancellation Policy at any time. Any changes will be communicated through the Service and will apply to bookings made after the effective date of the update.

By making a booking through Hyre, you acknowledge that you have read, understood, and agree to be bound by this Cancellation Policy and the rental business’s own cancellation terms.
      `,
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      content: `
At Hyre, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.

1. Information We Collect

Personal Information: When you create an account or book a vehicle, we may collect your name, email address, phone number, and other contact information.

Usage Data: We collect data on how you interact with our platform, including pages visited, clicks, and other usage statistics.

Payment Information: We use secure third-party services to process payments. We do not store your full payment details on our servers.

2. How We Use Your Information

To provide, maintain, and improve our Service.

To process your bookings and transactions.

To communicate with you, including sending booking confirmations, support communications, and important updates.

To personalize your experience on our platform.

To comply with legal obligations.

3. Information Sharing

With Rental Businesses: Your personal information may be shared with the rental business when you make a booking, so that they can fulfill the rental agreement.

Third-Party Providers: We use trusted third-party services for payment processing, analytics, and email communication.

Legal Requirements: We may disclose your information if required to do so by law or in response to valid requests by public authorities.

4. Data Security
We implement robust security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.

5. Your Rights
You have the right to access, update, or delete your personal information. Please contact us at support@hyre.com to exercise your rights or if you have any questions regarding your personal data.

6. Changes to This Privacy Policy
Hyre may update this Privacy Policy from time to time. We will notify you of any changes by updating the “Last updated” date at the top of this policy. Your continued use of the Service after any changes constitutes your acceptance of the new Privacy Policy.

If you have any questions or concerns about this Privacy Policy, please contact us at support@hyre.com.
      `,
    },
    {
      id: 'insurance-disclaimers',
      title: 'Insurance Disclaimers',
      content: `
Hyre does NOT provide insurance for rental businesses on our platform.
Each rental business is solely responsible for securing its own insurance coverage.
Please ensure that you have appropriate insurance coverage when using our services.
[Insert any additional insurance disclaimers or liability limitations here.]
      `,
    },
    
  ];

  // Render quick navigation buttons for each section
  const renderSectionLinks = () =>
    sections.map((sec) => (
      <button
        key={sec.id}
        className={styles.sectionLink}
        onClick={() => {
          const element = document.getElementById(sec.id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        {sec.title}
      </button>
    ));

  // Render each legal section
  const renderSections = () =>
    sections.map((sec) => (
      <section key={sec.id} id={sec.id} className={styles.legalSection}>
        <h2 className={styles.sectionTitle}>{sec.title}</h2>
        <p className={styles.sectionContent}>{sec.content}</p>
      </section>
    ));

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
      {isCustomer ? (
        <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : (
        <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />
      )}

      {/* Hero Section with background image */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Insurance & Legal</h1>
          <p className={styles.heroSubtitle}>Learn about our policies, terms, and insurance disclaimers.</p>
          <div className={styles.sectionLinksContainer}>{renderSectionLinks()}</div>
        </div>
      </div>

      {/* Main Legal Content */}
      <div className={styles.mainContent}>{renderSections()}</div>
    </div>
  );
}
