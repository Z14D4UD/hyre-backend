import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';

export default function CarUpload() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('');
  const [features, setFeatures] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [image, setImage] = useState(null);
  const [availability, setAvailability] = useState([new Date(), new Date()]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const [availableFrom, availableTo] = availability;
    const formData = new FormData();
    formData.append('make', make);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('type', type);
    formData.append('features', features);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('price_per_day', pricePerDay);
    formData.append('availableFrom', availableFrom.toISOString());
    formData.append('availableTo', availableTo.toISOString());
    if (image) formData.append('image', image);
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/cars/upload`,
        formData,
        {
          headers: { 'x-auth-token': localStorage.getItem('token'), 'Content-Type': 'multipart/form-data' }
        }
      );
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response.data);
      alert('Car upload failed');
    }
  };

  return (
    <div>
      <h2>Upload a Car</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Make" value={make} onChange={(e) => setMake(e.target.value)} required />
        <input type="text" placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} required />
        <input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} required />
        <input type="text" placeholder="Vehicle Type (e.g., SUV, Sedan)" value={type} onChange={(e) => setType(e.target.value)} />
        <input type="text" placeholder="Features (comma-separated)" value={features} onChange={(e) => setFeatures(e.target.value)} />
        <input type="text" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} required />
        <input type="text" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} required />
        <input type="text" placeholder="Price per Day" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        <p>Select Availability Dates:</p>
        <DatePicker
          selectsRange
          startDate={availability[0]}
          endDate={availability[1]}
          onChange={(update) => setAvailability(update)}
          isClearable={true}
        />
        <button type="submit">Upload Car</button>
      </form>
    </div>
  );
}
