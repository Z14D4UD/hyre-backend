// client/src/pages/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Signup.module.css';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default role

  // Click brand to go home
  const goHome = () => {
    navigate('/');
  };

  // Handle signup form
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/signup`, {
        name,
        email,
        password,
        accountType: role
      });

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data.redirectUrl) {
        navigate(res.data.redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <div className={styles.container}>
      {/* Left wave panel */}
      <div className={styles.leftPanel}>
        <div className={styles.desktopWave}></div>

        {/* Brand container in center of wave */}
        <div className={styles.brandContainer} onClick={goHome}>
          <div className={styles.brandTitle}>Hyre</div>
          {/* Optional subtext if you want the same style as login */}
          <div className={styles.brandSubtext}>
            {/* e.g. "Create Your Account" or any tagline */}
            Let your journey begin...
          </div>
        </div>
      </div>

      

      {/* Right panel: white background with signup form */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Sign Up</h2>
          <p className={styles.formSubtitle}>Create your account to continue</p>

          <form className={styles.form} onSubmit={handleSignup}>
            {/* Name field */}
            <input
              className={styles.inputField}
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* Email field */}
            <input
              className={styles.inputField}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password field */}
            <input
              className={styles.inputField}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Role dropdown */}
            <select
              className={styles.inputField}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="business">{t('Sign up as a Business')}</option>
              <option value="customer">{t('Sign up as a Customer')}</option>
              <option value="affiliate">{t('Sign up as an Affiliate')}</option>
            </select>

            <button className={styles.signupButton} type="submit">
              Sign Up
            </button>
          </form>

          <div className={styles.checkboxContainer}>
  <input
    type="checkbox"
    id="acceptTerms"
    className={styles.checkbox}
    required
  />
  <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
    I accept the terms and policy
  </label>
</div>


          <div className={styles.extraRow}>
            Already have an account?
            <a className={styles.extraLink} href="/login">
              Log In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
