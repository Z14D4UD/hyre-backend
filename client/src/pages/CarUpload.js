// client/src/pages/CarUpload.js
import React, { useState } from 'react';
import axios from 'axios';

export default function CarUpload() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('make', make);
      formData.append('model', model);
      formData.append('year', year);
      formData.append('price', price);
      if (image) formData.append('image', image);

      const token = localStorage.getItem('token'); // Example auth check
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/cars/upload`,
        formData,
        { headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } }
      );
      alert('Car uploaded successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to upload car.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Upload a Car</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Make:</label>
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Model:</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price per day:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Upload Car</button>
      </form>
    </div>
  );
}
