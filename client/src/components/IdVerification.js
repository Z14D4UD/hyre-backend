import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function IdVerification() {
  const [idDocument, setIdDocument] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (idDocument) formData.append('idDocument', idDocument);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/business/verify-id`, formData, {
        headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response.data);
      alert('ID verification failed');
    }
  };

  return (
    <div>
      <h2>ID Verification</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={(e) => setIdDocument(e.target.files[0])} required />
        <button type="submit">Upload ID Document</button>
      </form>
    </div>
  );
}
