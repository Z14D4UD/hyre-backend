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

  /* ── state ─────────────────────────────────────────────────────── */
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [listing,       setListing]       = useState(null);
  const [method,        setMethod]        = useState('card');
  const [message,       setMessage]       = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [processing,    setProcessing]    = useState(false);

  /* ── auth guard ────────────────────────────────────────────────── */
  const token = localStorage.getItem('token') || '';
  useEffect(() => {
    if (!token) {
      alert('Please log in to continue booking.');
      navigate('/login');
    }
  }, [token, navigate]);

  /* ── fetch listing once ────────────────────────────────────────── */
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

  /* ── derived pricing ───────────────────────────────────────────── */
  const days     = daysBetween(fromDate, toDate);
  const base     = listing.pricePerDay || 0;
  const subtotal = days * base;
  const vat      = subtotal * 0.2;
  const service  = (subtotal / 1.2) * 0.05;
  const total    = subtotal + vat + service;
  const backendBase = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/, '');

  /* ── helper that records the booking and routes to confirmation ── */
  const recordBookingAndGo = async () => {
    const { data } = await api.post('/bookings', {
      listingId,
      startDate: fromISO,
      endDate:   toISO,
      basePrice: base,
      currency:  'GBP',
      affiliateCode: affiliateCode.trim() || undefined
    });
    const bookingId = data.booking?._id;                              // ← CHANGED
    navigate(`/payment/confirmation?bookingId=${bookingId}`);        // ← CHANGED
  };

  /* ── Stripe handler ────────────────────────────────────────────── */
  const handleCardPayment = async () => {
    if (processing) return;
    if (!message.trim()) return alert('Please leave a message to your local rental business before you pay.');

    try {
      setProcessing(true);

      // 1) create PaymentIntent
      const { data } = await api.post('/payment/stripe', {
        amount:   Math.round(total * 100),
        currency: 'GBP'
      });

      // 2) confirm
      const { error } = await stripe.confirmCardPayment(
        data.clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );
      if (error) {
        console.error('Stripe confirmCardPayment error:', error);
        alert(error.message);
        return;
      }

      // 3) record booking & redirect
      await recordBookingAndGo();                                     // ← CHANGED
    } catch (err) {
      console.error('Stripe payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  /* ──────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* header */}
      <header className={cls.header} style={{borderBottom:'1px solid #eee'}}>
        <div className={cls.logo} style={{color:'#38b6ff'}} onClick={()=>navigate('/')}>Hyre</div>
        <button className={cls.menuIcon} style={{color:'#38b6ff',borderRadius:8,padding:4}} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
      </header>

      {/* side-menu */}
      <SideMenuCustomer isOpen={menuOpen} toggleMenu={()=>setMenuOpen(o=>!o)} closeMenu={()=>setMenuOpen(false)} />

      <div className={cls.container}>
        <div className={cls.columns}>

          {/* ───────── left column ───────── */}
          <div className={cls.left}>

            {/* payment method */}
            <div className={cls.section} style={{borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)',padding:16}}>
              <h3>Payment method</h3>
              <label className={cls.breakdown}>
                <input type="radio" name="payment" value="card"   checked={method==='card'}   onChange={()=>setMethod('card')} /> Card
              </label>
              <label className={cls.breakdown}>
                <input type="radio" name="payment" value="paypal" checked={method==='paypal'} onChange={()=>setMethod('paypal')} /> PayPal
              </label>
            </div>

            {/* message */}
            <div className={cls.section} style={{borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)',padding:16}}>
              <h3>Write a message to the host</h3>
              <textarea className={cls.textarea} placeholder="Say hi to your local rental business…" value={message} onChange={e=>setMessage(e.target.value)} style={{borderRadius:8}}/>
            </div>

            {/* affiliate */}
            <div className={cls.section} style={{borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)',padding:16}}>
              <h3>Affiliate Code (optional)</h3>
              <input type="text" className={cls.textInput} placeholder="Enter affiliate code" value={affiliateCode} onChange={e=>setAffiliateCode(e.target.value)} style={{borderRadius:8,padding:8,width:'100%'}}/>
            </div>

            {/* Stripe */}
            {method==='card' && (
              <div className={cls.section} style={{borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)',padding:16}}>
                <CardElement options={{hidePostalCode:true}}/>
                <button
                  className={cls.payBtn}
                  onClick={handleCardPayment}
                  disabled={processing || !stripe || !elements}
                  style={{borderRadius:24,background:'#38b6ff',boxShadow:'0 4px 12px rgba(0,0,0,.1)',marginTop:16}}
                >{processing ? 'Processing…' : `Pay £${total.toFixed(2)}`}</button>
              </div>
            )}

            {/* PayPal */}
            {method==='paypal' && (
              <div className={cls.section} style={{borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)',padding:16}}>
                <PayPalButtons
                  style={{layout:'vertical'}}
                  createOrder={(_d,actions)=>{
                    if(!message.trim()){
                      alert('Please leave a message to your local rental business before you pay.');
                      return Promise.reject('Message required');
                    }
                    return api.post('/payment/paypal/create-order',{amount:total.toFixed(2),currency:'GBP'})
                              .then(r=>r.data.orderID);
                  }}
                  onApprove={({orderID})=>{
                    return api.post('/payment/paypal/capture-order',{orderID})
                              .then(async ()=>{
                                await recordBookingAndGo();           /* ← CHANGED */
                              });
                  }}
                  onError={err=>{
                    console.error('PayPal error:',err);
                    alert('PayPal checkout failed');
                  }}
                />
              </div>
            )}

          </div>

          {/* ───────── right column (summary) ───────── */}
          <div className={cls.right} style={{borderRadius:12,boxShadow:'0 2px 8px rgba(0,0,0,.05)'}}>
            <img
              src={listing.images?.[0] ? `${backendBase}/${listing.images[0]}` : '/avatar.svg'}
              alt="" className={cls.thumb} style={{borderRadius:8}}
            />
            <h3>{listing.make} {listing.model}</h3>
            <div className={cls.rating}>
              {(listing.reviews?.length
                ? (listing.reviews.reduce((s,r)=>s+(r.rating||0),0)/listing.reviews.length).toFixed(2)
                : '0.00')}★ ({listing.reviews?.length||0})
            </div>
            <p>This reservation is non-refundable. <a href="/legal">Full policy</a></p>

            <div className={cls.section}>
              <h4>Trip details</h4>
              <p>{fromDate.toLocaleDateString()} → {toDate.toLocaleDateString()}<br/>{days} days</p>
              <button onClick={()=>navigate(-1)} style={{borderRadius:8,padding:4}}>Change</button>
            </div>

            <div className={cls.section}>
              <h4>Price details</h4>
              <div className={cls.breakdown}><span>£{base.toFixed(2)} × {days} days</span><span>£{subtotal.toFixed(2)}</span></div>
              <div className={cls.breakdown}><span>Hyre service fee</span><span>£{service.toFixed(2)}</span></div>
              <div className={cls.breakdown}><span>VAT (20%)</span><span>£{vat.toFixed(2)}</span></div>
              <hr/>
              <div className={cls.totalRow}><span>Total</span><span>£{total.toFixed(2)}</span></div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
