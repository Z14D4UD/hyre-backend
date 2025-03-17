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
        <button type="submit">{t('login')}</button>
      </form>
    </div>
  );
}
