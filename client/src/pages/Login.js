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
      localStorage.setItem('token', res.data.token);
      navigate(res.data.redirectUrl || '/dashboard');
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
          <div className={styles.brandSubtext}>We make it for you</div>
        </div>
      </div>

      {/* Right Panel: white background on desktop,
          no background on mobile (we overlap a white card) */}
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
