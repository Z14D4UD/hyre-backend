// client/src/pages/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import api from '../api';

import SideMenuCustomer from '../components/SideMenuCustomer';
import cls from '../styles/PaymentPage.module.css';

const daysBetween = (a, b) => Math.max(1, Math.ceil((b - a) / 86400000));

export default function PaymentPage() {
  const [qs]      = useSearchParams();
  const navigate  = useNavigate();
  const stripe    = useStripe();
  const elements  = useElements();
  const listingId = qs.get('listingId');
  const fromISO   = qs.get('from');
  const toISO     = qs.get('to');
  const fromDate  = new Date(fromISO);
  const toDate    = new Date(toISO);

  // –– State
  const [menuOpen,      setMenuOpen]       = useState(false);
  const [listing,       setListing]        = useState(null);
  const [method,        setMethod]         = useState('card');
  const [message,       setMessage]        = useState('');
  const [affiliateCode, setAffiliateCode]  = useState('');   // ← ADDED

  // –– Auth guard
  const token = localStorage.getItem('token') || '';
  useEffect(() => {
    if (!token) {
      alert('Please log in to continue booking.');
      navigate('/login');
    }
  }, [token, navigate]);

  // –– Fetch
  useEffect(() => {
    api.get(`/listings/${listingId}`)
      .then(r => setListing(r.data))
      .catch(err => {
        console.error('Payment page fetch error:', err);
        alert(
          err.response?.status === 404
            ? 'Listing not found.'
            : 'Failed to load booking info.'
        );
        navigate('/');
      });
  }, [listingId, navigate]);

  if (!listing) return <p className={cls.loading}>Loading booking…</p>;

  // –– Pricing
  const days     = daysBetween(fromDate, toDate);
  const base     = listing.pricePerDay || 0;
  const subtotal = days * base;
  const vat      = subtotal * 0.2;
  const service  = (subtotal / 1.2) * 0.05;
  const total    = subtotal + vat + service;

  // –– Backend base URL (for images)
  const backendBase = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/, '');

  // –– Pay handler
  const handleCardPayment = async () => {
    if (!message.trim()) {
      return alert('Please leave a message to your local rental business before you pay.');
    }

    try {
      // 1) Create PaymentIntent
      const { data } = await api.post('/payment/stripe', {
        amount: Math.round(total * 100),
        currency: 'GBP'
      });
      console.log('stripe intent response:', data);

      // 2) Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {}
          }
        }
      );
      if (error) {
        console.error(error);
        return alert(error.message);
      }

      // 3) Record booking, passing affiliateCode
      await api.post('/bookings', {
        listingId,
        startDate: fromISO,
        endDate: toISO,
        basePrice: base,
        currency: 'GBP',
        affiliateCode: affiliateCode.trim() || undefined   // ← ADDED
      });

      // 4) Navigate on success
      navigate(`/confirmation?paymentIntent=${paymentIntent.id}`);
    } catch (err) {
      console.error('Stripe payment error:', err);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <>
      {/* Header */}
      <header className={cls.header} style={{ borderBottom: '1px solid #eee' }}>
        <div
          className={cls.logo}
          style={{ color: '#38b6ff' }}
          onClick={() => navigate('/')}
        >
          Hyre
        </div>
        <button
          className={cls.menuIcon}
          style={{ color: '#38b6ff', borderRadius: '8px', padding: '4px' }}
          onClick={() => setMenuOpen(o => !o)}
        >
          ☰
        </button>
      </header>

      {/* Side Menu */}
      <SideMenuCustomer
        isOpen={menuOpen}
        toggleMenu={() => setMenuOpen(o => !o)}
        closeMenu={() => setMenuOpen(false)}
      />

      <div className={cls.container}>
        <div className={cls.columns}>

          {/* Left Column */}
          <div className={cls.left}>

            {/* Payment Method */}
            <div className={cls.section} style={{ borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:16 }}>
              <h3>Payment method</h3>
              <label className={cls.breakdown}>
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={method === 'card'}
                  onChange={() => setMethod('card')}
                /> Card
              </label>
              <label className={cls.breakdown}>
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={method === 'paypal'}
                  onChange={() => setMethod('paypal')}
                /> PayPal
              </label>
            </div>

            {/* Message to Host */}
            <div className={cls.section} style={{ borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:16 }}>
              <h3>Write a message to the host</h3>
              <textarea
                className={cls.textarea}
                placeholder="Say hi to your local rental business…"
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ borderRadius:8 }}
              />
            </div>

            {/* Affiliate Code */}
            <div className={cls.section} style={{ borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:16 }}>
              <h3>Affiliate Code (optional)</h3>
              <input
                type="text"
                className={cls.textInput}
                placeholder="Enter affiliate code"
                value={affiliateCode}
                onChange={e => setAffiliateCode(e.target.value)}
                style={{ borderRadius:8, padding:'8px', width:'100%' }}
              />
            </div>

            {/* Stripe CardElement */}
            {method === 'card' && (
              <div className={cls.section} style={{ borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:16 }}>
                <CardElement options={{ hidePostalCode: true }} />
                <button
                  className={cls.payBtn}
                  onClick={handleCardPayment}
                  disabled={!stripe || !elements}
                  style={{ borderRadius:24, backgroundColor:'#38b6ff', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', marginTop:16 }}
                >
                  Pay £{total.toFixed(2)}
                </button>
              </div>
            )}

            {/* PayPal Buttons */}
            {method === 'paypal' && (
              <div className={cls.section} style={{ borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)', padding:16 }}>
                <PayPalButtons
                  style={{ layout:'vertical' }}
                  createOrder={(_data, actions) => {
                    if (!message.trim()) {
                      alert('Please leave a message to your local rental business before you pay.');
                      return Promise.reject('Message required');
                    }
                    return api.post('/payment/paypal/create-order', {
                      amount: total.toFixed(2),
                      currency: 'GBP'
                    })
                    .then(res => res.data.orderID);
                  }}
                  onApprove={({ orderID }) => {
                    return api.post('/payment/paypal/capture-order', { orderID })
                      .then(async res => {
                        await api.post('/bookings', {
                          listingId,
                          startDate: fromISO,
                          endDate: toISO,
                          basePrice: base,
                          currency: 'GBP',
                          affiliateCode: affiliateCode.trim() || undefined
                        });
                        navigate(`/confirmation?paypalCaptureId=${res.data.capture.id}`);
                      });
                  }}
                  onError={err => {
                    console.error('PayPal error:', err);
                    alert('PayPal checkout failed');
                  }}
                />
              </div>
            )}

          </div>

          {/* Right Column (Summary) */}
          <div className={cls.right} style={{ borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
            <img
              src={
                listing.images?.[0]
                  ? `${backendBase}/${listing.images[0]}`
                  : '/avatar.svg'
              }
              alt=""
              className={cls.thumb}
              style={{ borderRadius:8 }}
            />
            <h3>{listing.make} {listing.model}</h3>
            <div className={cls.rating}>
              {(listing.reviews?.length
                ? (listing.reviews.reduce((sum,r)=>sum+(r.rating||0),0)/listing.reviews.length).toFixed(2)
                : '0.00')}★ ({listing.reviews?.length||0})
            </div>
            <p>This reservation is non‑refundable. <a href="/legal">Full policy</a></p>

            <div className={cls.section}>
              <h4>Trip details</h4>
              <p>
                {fromDate.toLocaleDateString()} → {toDate.toLocaleDateString()}<br/>
                {days} days
              </p>
              <button onClick={()=>navigate(-1)} style={{ borderRadius:8, padding:4 }}>Change</button>
            </div>

            <div className={cls.section}>
              <h4>Price details</h4>
              <div className={cls.breakdown}>
                <span>£{base.toFixed(2)} × {days} days</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className={cls.breakdown}>
                <span>Hyre service fee</span>
                <span>£{service.toFixed(2)}</span>
              </div>
              <div className={cls.breakdown}>
                <span>VAT (20%)</span>
                <span>£{vat.toFixed(2)}</span>
              </div>
              <hr/>
              <div className={cls.totalRow}>
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
