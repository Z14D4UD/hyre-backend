import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import SideMenu         from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import cls              from '../styles/PaymentPage.module.css';

const daysBetween = (a, b) => Math.max(1, Math.ceil((b - a) / 86400000));

export default function PaymentPage() {
  const [qs]      = useSearchParams();
  const navigate  = useNavigate();
  const token     = (localStorage.getItem('token')||'').trim();

  const listingId = qs.get('listingId');
  const fromISO   = qs.get('from');
  const toISO     = qs.get('to');
  const fromDate  = new Date(fromISO);
  const toDate    = new Date(toISO);

  // redirect if not logged in
  useEffect(() => {
    if (!token) {
      alert('Please log in to continue booking.');
      navigate('/login');
    }
  }, [token, navigate]);

  // side‐menu
  const [menuOpen, setMenuOpen] = useState(false);
  const acct = (localStorage.getItem('accountType')||'').toLowerCase();
  let sideMenu = <SideMenu isOpen={menuOpen} toggleMenu={()=>setMenuOpen(o=>!o)}/>;
  if (token && acct==='customer')
    sideMenu = <SideMenuCustomer isOpen={menuOpen} toggleMenu={()=>setMenuOpen(o=>!o)}/>;

  // listing data
  const [listing, setListing] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const API = process.env.REACT_APP_BACKEND_URL;
        const { data } = await axios.get(`${API}/listings/public/${listingId}`);
        setListing(data);
      } catch (err) {
        console.error('Payment page fetch error:', err);
        alert('Failed to load booking info.');
        navigate('/');
      }
    })();
  }, [listingId, navigate]);

  if (!listing) return <p className={cls.loading}>Loading booking…</p>;

  // compute pricing
  const days     = daysBetween(fromDate, toDate);
  const base     = listing.pricePerDay;
  const total    = days * base;
  const exclVAT  = total / 1.2;            // remove 20% VAT
  const hyreFee  = exclVAT * 0.05;         // 5% service fee excl VAT
  const vatOnFee = hyreFee * 0.2;
  const grandTotal = total + hyreFee + vatOnFee;

  return (
    <>
      <header className={cls.header}>
        <button className={cls.back} onClick={()=>navigate(-1)}>←</button>
        <h2>Confirm & Pay</h2>
      </header>
      {sideMenu}
      <div className={cls.container}>
        <div className={cls.summary}>
          <h3>{listing.make} {listing.model}</h3>
          <p>{days} day{days>1?'s':''} • {fromDate.toLocaleDateString()} → {toDate.toLocaleDateString()}</p>
          <hr/>

          <div className={cls.line}>
            <span>£{base.toFixed(2)} × {days} day{days>1?'s':''}</span>
            <span>£{total.toFixed(2)}</span>
          </div>

          <div className={cls.line}>
            <span>VAT (20%)</span>
            <span>£{(total * 0.2).toFixed(2)}</span>
          </div>

          <div className={cls.line}>
            <span>Hyre service fee (5% excl VAT)</span>
            <span>£{hyreFee.toFixed(2)}</span>
          </div>

          <div className={cls.line}>
            <span>VAT on fee</span>
            <span>£{vatOnFee.toFixed(2)}</span>
          </div>

          <hr/>
          <div className={cls.total}>
            <strong>Total</strong>
            <strong>£{grandTotal.toFixed(2)}</strong>
          </div>

          <button className={cls.payBtn}>Pay Now</button>
        </div>
      </div>
    </>
  );
}
