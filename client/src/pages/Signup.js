import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Signup() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/auth/signup`, { name, email, password });
      localStorage.setItem('token', res.data.token);
      alert(res.data.msg);
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response.data);
      alert(error.response.data.msg || 'Signup failed');
    }
  };

  return (
    <div>
      <h2>{t('signup')}</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="Business Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{t('signup')}</button>
      </form>
    </div>
  );
}
