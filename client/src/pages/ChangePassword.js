// client/src/pages/ChangePassword.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ChangePassword.module.css';

export default function ChangePassword() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      return alert('Please fill in both fields.');
    }
    axios
      .put(`${backendUrl}/account/password`, 
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('Password updated successfully.');
        navigate('/account');
      })
      .catch((err) => {
        console.error('Error changing password:', err);
        alert(err.response?.data?.msg || 'Failed to change password.');
      });
  };

  return (
    <div className={styles.changePasswordContainer}>
      <h1>Change Password</h1>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Old Password</label>
        <input
          type="password"
          className={styles.inputField}
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>New Password</label>
        <input
          type="password"
          className={styles.inputField}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button className={styles.button} onClick={handleChangePassword}>
        Update Password
      </button>
    </div>
  );
}
