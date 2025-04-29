// client/src/pages/PaymentSuccessPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import cls from '../styles/PaymentSuccessPage.module.css';

export default function PaymentSuccessPage() {
  const navigate   = useNavigate();
  const [qs]       = useSearchParams();
  const bookingId  = qs.get('bookingId');
  const [booking, setBooking] = useState(null);
  const backend    = process.env.REACT_APP_BACKEND_URL || 'https://hyre-backend.onrender.com/api';
  const token      = localStorage.getItem('token');

  useEffect(() => {
    if (!bookingId) return;

    axios.get(`${backend}/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => setBooking(r.data))
    .catch(err => {
      console.error('Booking fetch failed:', err);
      // we still render the card without extra info
    });
  }, [bookingId, backend, token]);

  const downloadInvoice = async () => {
    try {
      const res = await axios.get(
        `${backend}/bookings/invoice/${bookingId}`,
        {
          headers:      { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Failed to download invoice.');
    }
  };

  const close = () => navigate('/');

  return (
    <div className={cls.backdrop}>
      <div className={cls.card}>
        <div className={cls.icon}>✔</div>
        <h2 className={cls.heading}>Payment successful</h2>

        <div className={cls.detailGrid}>
          <span>Booking ID:</span>
            <span>{bookingId || '—'}</span>
          <span>Payment type:</span>
            <span>{booking?.paymentMethod || 'Card'}</span>
          <span>Amount paid:</span>
            <span>
              {booking
                ? `${booking.currency.toUpperCase()} ${booking.totalAmount.toFixed(2)}`
                : '—'}
            </span>
          <span>Dates:</span>
            <span>
              {booking
                ? `${new Date(booking.startDate).toLocaleDateString()} – `
                  + `${new Date(booking.endDate).toLocaleDateString()}`
                : '—'}
            </span>
        </div>

        <div className={cls.actions}>
          <button onClick={downloadInvoice} className={cls.primary}>
            Download invoice
          </button>
          <button onClick={close} className={cls.secondary}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
