import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import GoogleMapReact from 'google-map-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';

const Marker = ({ text }) => (
  <div style={{ color: 'red', fontWeight: 'bold' }}>{text}</div>
);

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [bookingRange, setBookingRange] = useState([new Date(), new Date()]);
  const [customerName, setCustomerName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/${id}`);
        setCar(res.data);
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    };
    fetchCar();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    const [startDate, endDate] = bookingRange;
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/bookings`, {
        carId: id,
        customerName,
        startDate,
        endDate,
        basePrice: 100,
        currency: 'usd'
      });
      alert('Booking created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error("Booking error:", error.response ? error.response.data : error);
      alert('Booking failed');
    }
  };

  if (!car) return <p>Loading...</p>;

  const defaultCenter = { lat: car.location.lat, lng: car.location.lng };
  const defaultZoom = 12;

  return (
    <div>
      <h2>{car.make} {car.model}</h2>
      <p>Type: {car.type}</p>
      <p>Features: {car.features.join(', ')}</p>
      <div style={{ height: '400px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
        >
          <Marker lat={car.location.lat} lng={car.location.lng} text="Car" />
        </GoogleMapReact>
      </div>
      <h3>Book This Car</h3>
      <form onSubmit={handleBooking}>
        <input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
        <p>Select Booking Dates:</p>
        <DatePicker
          selectsRange
          startDate={bookingRange[0]}
          endDate={bookingRange[1]}
          onChange={(update) => setBookingRange(update)}
          isClearable={true}
        />
        <button type="submit">Book Now</button>
      </form>
    </div>
  );
}
