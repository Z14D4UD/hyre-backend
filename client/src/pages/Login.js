// client/src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Login.module.css';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clicking the brand takes the user home
  const goHome = () => {
    navigate('/');
  };

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        email,
        password,
      });

      // Destructure the fields from the server response
      const { token, accountType } = res.data;

      // Save the token and accountType in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('accountType', accountType);


      // For customers, businesses, and affiliates, navigate to the home page.
      if (token && accountType) {
        navigate('/');
        return;
      }

      // Fallback for any other account types if necessary
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel (Desktop wave, Mobile gradient) */}
      <div className={styles.leftPanel}>
        {/* Desktop wave shape */}
        <div className={styles.desktopWave}></div>

        {/* Brand container (click to go home) */}
        <div className={styles.brandContainer} onClick={goHome}>
          <div className={styles.brandTitle}>Hyre</div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Welcome</h2>
          <p className={styles.formSubtitle}>Login to your account to continue</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.inputField}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.inputField}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Changed forgot password link to navigate to ChangePassword page */}
            <Link className={styles.forgotPassword} to="/change-password">
              Forgot your password?
            </Link>

            <button className={styles.loginButton} type="submit">
              {t('Login')}
            </button>
          </form>

          <div className={styles.signupRow}>
            Don't have an account?
            <Link className={styles.signupLink} to="/signup">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
