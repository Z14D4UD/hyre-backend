// client/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/bookings/my`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setBookings(res.data);
        const earnings = res.data.reduce((acc, booking) => acc + booking.payout, 0);
        setTotalEarnings(earnings);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyBookings();
  }, []);

  return (
    <div>
      <h2>{t('dashboard')}</h2>
      <p>Total Earnings: ${totalEarnings.toFixed(2)}</p>
      <nav>
        <Link to="/upload-car">{t('uploadCar')}</Link> |{' '}
        <Link to="/verify-id">{t('verifyID')}</Link> |{' '}
        <Link to="/payment">{t('payment')}</Link> |{' '}
        <Link to="/chat">Chat</Link>
      </nav>
      <h3>My Bookings</h3>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking._id}>
              <p>
                Booking ID: {booking._id} | Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <a
                href={`${process.env.REACT_APP_BACKEND_URL}/bookings/invoice/${booking._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Invoice
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
