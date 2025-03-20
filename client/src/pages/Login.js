// client/src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Login.module.css';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Click brand to go home
  const goHome = () => {
    navigate('/');
  };

  // Handle login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        email,
        password
      });

      // Destructure the fields from the server response
      const { token, user, accountType, redirectUrl } = res.data;

      // Save the token in localStorage
      localStorage.setItem('token', token);

      // Also store the accountType in localStorage
      localStorage.setItem('accountType', accountType);

      console.log('Server returned accountType:', accountType);
      console.log('Server returned redirectUrl:', redirectUrl);

      // If accountType is "customer", ALWAYS go to home page ("/")
      if (accountType?.toLowerCase() === 'customer') {
        navigate('/');
        return;
      }

      // Otherwise, use the server's redirectUrl if present,
      // or fallback to "/dashboard"
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
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

        {/* Brand container in center (desktop), near bottom (mobile) */}
        <div className={styles.brandContainer} onClick={goHome}>
          <div className={styles.brandTitle}>Hyre</div>
        </div>
      </div>

      {/* Right Panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Welcome</h2>
          <p className={styles.formSubtitle}>Login in your account to continue</p>

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

            <a className={styles.forgotPassword} href="/forgot-password">
              Forgot your password?
            </a>

            <button className={styles.loginButton} type="submit">
              {t('login')}
            </button>
          </form>

          <div className={styles.signupRow}>
            Don't have an account?
            <a className={styles.signupLink} href="/signup">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
