import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Signup() {
  const { t } = useTranslation();
  const [accountType, setAccountType] = useState('business'); // default to business
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/signup`, {
        name,
        email,
        password,
        accountType, // send the type: "business" or "customer"
      });
      localStorage.setItem('token', res.data.token);
      alert(res.data.msg);
      if (accountType === 'business') {
        navigate('/dashboard'); // business dashboard
      } else {
        navigate('/customer-dashboard'); // customer dashboard
      }
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data.msg || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>{t('signup')}</h2>
      <form onSubmit={handleSignup}>
        <div>
          <label>
            <input
              type="radio"
              value="business"
              checked={accountType === 'business'}
              onChange={(e) => setAccountType(e.target.value)}
            />
            Business
          </label>
          <label>
            <input
              type="radio"
              value="customer"
              checked={accountType === 'customer'}
              onChange={(e) => setAccountType(e.target.value)}
            />
            Customer
          </label>
        </div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">{t('signup')}</button>
      </form>
    </div>
  );
}
