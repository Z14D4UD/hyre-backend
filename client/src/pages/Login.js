// client/src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Add accountType selection with default value, e.g., customer
  const [accountType, setAccountType] = useState('customer');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
        email,
        password,
        accountType
      });
      localStorage.setItem('token', res.data.token);
      
      // Use the redirectUrl provided in the response, or fallback to /dashboard
      if (res.data.redirectUrl) {
        navigate(res.data.redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div>
      <h2>{t('login')}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select value={accountType} onChange={(e) => setAccountType(e.target.value)} required>
          <option value="customer">{t('signupAsCustomer') || 'Customer'}</option>
          <option value="business">{t('signupAsBusiness') || 'Business'}</option>
          <option value="affiliate">{t('signupAsAffiliate') || 'Affiliate'}</option>
        </select>
        <button type="submit">{t('login')}</button>
      </form>
    </div>
  );
}
