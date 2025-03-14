import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Signup.module.css';

export default function Signup() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default role
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/signup`, {
        name,
        email,
        password,
        accountType: role
      });
      localStorage.setItem('token', res.data.token);
      // Redirect based on role – adjust routes as needed
      if (role === 'business') {
        navigate('/dashboard');
      } else if (role === 'customer') {
        navigate('/dashboard');
      } else if (role === 'affiliate') {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error.response.data);
      alert(error.response.data.msg || 'Signup failed');
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2>{t('signup')}</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>{t('name')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>{t('email')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>{t('password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>{t('signupAs')}</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="business">{t('signupAsBusiness')}</option>
            <option value="customer">{t('signupAsCustomer')}</option>
            <option value="affiliate">{t('signupAsAffiliate')}</option>
          </select>
        </div>
        <button type="submit">{t('signup')}</button>
      </form>
    </div>
  );
}
