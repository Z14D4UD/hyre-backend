// client/src/pages/PaymentSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import cls from '../styles/PaymentSuccessPage.module.css';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [qs]     = useSearchParams();

  /* ------------------------------------------------------------------ */
  /*  State                                                             */
  /* ------------------------------------------------------------------ */
  const bookingId = qs.get('bookingId');
  const [booking, setBooking] = useState(null);
  const backend = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';

  /* ------------------------------------------------------------------ */
  /*  Fetch booking for a few quick details to show on the slip          */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!bookingId) return;

    axios.get(`${backend}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(r => setBooking(r.data))
    .catch(err => {
      console.error('Booking fetch failed:', err);
      // We can still show the card – just without extra info
    });
  }, [bookingId, backend]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  const downloadInvoice = () => {
    window.open(`${backend}/bookings/invoice/${bookingId}`, '_blank');
  };

  const close = () => navigate('/');

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className={cls.backdrop}>
      <div className={cls.card}>
        <div className={cls.icon}>✔</div>
        <h2 className={cls.heading}>Payment successful</h2>

        <div className={cls.detailGrid}>
          <span>Booking ID:</span>   <span>{bookingId || '—'}</span>
          <span>Payment type:</span> <span>{booking?.paymentMethod || 'Card'}</span>
          <span>Amount paid:</span>  <span>
            {booking ? `${booking.currency.toUpperCase()} ${booking.totalAmount.toFixed(2)}` : '—'}
          </span>
          <span>Dates:</span>        <span>
            {booking
              ? `${new Date(booking.startDate).toLocaleDateString()} – `
                + `${new Date(booking.endDate).toLocaleDateString()}`
              : '—'}
          </span>
        </div>

        <div className={cls.actions}>
          <button onClick={downloadInvoice} className={cls.primary}>Download invoice</button>
          <button onClick={close} className={cls.secondary}>Close</button>
        </div>
      </div>
    </div>
  );
}
