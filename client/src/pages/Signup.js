// client/src/pages/Signup.js
import React, { useState }     from 'react';
import axios                   from 'axios';
import jwtDecode               from 'jwt-decode';      // ← new
import { useNavigate }         from 'react-router-dom';
import { useTranslation }      from 'react-i18next';
import styles                  from '../styles/Signup.module.css';

export default function Signup() {
  const { t }    = useTranslation();
  const navigate = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState('customer');   // default

  const goHome = () => navigate('/');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/auth/signup`,
        { name, email, password, accountType: role }
      );

      /* save stuff ---------------------------------- */
      localStorage.setItem('token',       data.token);
      localStorage.setItem('accountType', role);

      try {
        const id  = jwtDecode(data.token).id;
        const key = role === 'business' ? 'businessId' : 'userId';
        if (id) localStorage.setItem(key, id);
      } catch { /* ignore */ }

      /* redirect ------------------------------------ */
      if (role === 'business')   navigate('/dashboard/business');
      else if (role === 'affiliate') navigate('/dashboard/affiliate');
      else                        navigate('/account');
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.msg || 'Signup failed');
    }
  };

  return (
    <div className={styles.container}>
      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.desktopWave}/>
        <div className={styles.brandContainer} onClick={goHome}>
          <div className={styles.brandTitle}>Hyre</div>
          <div className={styles.brandSubtext}>Let your journey begin...</div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Sign Up</h2>
          <p  className={styles.formSubtitle}>Create your account to continue</p>

          <form className={styles.form} onSubmit={handleSignup}>
            <input
              className={styles.inputField}
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              className={styles.inputField}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.inputField}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <select
              className={styles.inputField}
              value={role}
              onChange={e => setRole(e.target.value)}
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
            <input id="acceptTerms" type="checkbox" className={styles.checkbox} required />
            <label htmlFor="acceptTerms" className={styles.checkboxLabel}>
              I accept the terms and policy
            </label>
          </div>

          <div className={styles.extraRow}>
            Already have an account?
            <a className={styles.extraLink} href="/login">Log In</a>
          </div>
        </div>
      </div>
    </div>
  );
}
