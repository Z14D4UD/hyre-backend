//  client/src/pages/CarDetailsPage.js
//  “Turo‑style” details page for both /details/car/:id and /details/listing/:id

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';     // public GET
import api   from '../api';    // authorised POST /bookings
import cls   from '../styles/CarDetailsPage.module.css';

import DatePicker     from 'react-datepicker';
import GoogleMapReact from 'google-map-react';
import 'react-datepicker/dist/react-datepicker.css';

const Marker = () => <div style={{ color:'#c00', fontWeight:700 }}>⬤</div>;

export default function CarDetailsPage() {
  /* ─ URL params ─ */
  const { type, id } = useParams();          // "car" | "listing"
  const navigate     = useNavigate();

  /* ─ state ─ */
  const [item,  setItem]   = useState(null);
  const [lead,  setLead]   = useState(0);

  const [name,  setName]   = useState('');
  const [range, setRange]  = useState([new Date(), new Date()]);
  const [confirmManual, setConfirmManual] = useState(false);
  const [error, setError]  = useState('');

  /* ─ fetch public doc ─ */
  useEffect(()=>{ (async()=>{
    try {
      const base = process.env.REACT_APP_BACKEND_URL;
      const url  = type==='listing'
        ? `${base}/api/listings/${id}`   // PUBLIC   ← ■■■ this changed
        : `${base}/api/cars/${id}`;      // PUBLIC
      const { data } = await axios.get(url);
      setItem(data);
    } catch (err) { console.error(err); }
  })(); }, [type, id]);

  /* ─ booking ─ */
  const handleBooking = async e => {
    e.preventDefault();
    if (item.transmission?.toLowerCase()==='manual' && !confirmManual) {
      setError('Please confirm you can drive manual.');
      return;
    }
    try {
      const [startDate, endDate] = range;
      await api.post('/bookings', {
        carId:      id,
        customerName: name,
        startDate, endDate,
        basePrice:  item.pricePerDay,
        currency:   'gbp',
      });
      alert('Booking created!');
      navigate('/bookings/customer');
    } catch (err) {
      console.error(err);
      alert('Booking failed');
    }
  };

  if (!item) return <p className={cls.loading}>Loading…</p>;

  /* ─ helpers ─ */
  const staticBase = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/,'');
  const pics   = item.images?.length ? item.images : [item.imageUrl];
  const hero   = pics[lead];
  const lat    = item.latitude  ?? item.location?.lat;
  const lng    = item.longitude ?? item.location?.lng;

  const rating = item.business?.rating || 4.94;
  const joined = item.business?.createdAt
    ? new Date(item.business.createdAt).toLocaleString('en-UK',{month:'short',year:'numeric'})
    : '—';

  /* ─ render ─ */
  return (
    <div className={cls.page}>
      {/* Gallery */}
      <section className={cls.gallery}>
        <div className={cls.mainImage}>
          <img src={`${staticBase}/${hero}`} alt="vehicle"/>
        </div>
        <div className={cls.sideImages}>
          {pics.slice(0,4).map((img,i)=>(
            <img key={i}
                 src={`${staticBase}/${img}`}
                 alt="thumb"
                 className={i===lead ? cls.activeThumb : ''}
                 onClick={()=>setLead(i)}
            />
          ))}
        </div>
      </section>

      {/* Columns */}
      <section className={cls.content}>
        {/* left */}
        <div className={cls.details}>
          <h1>{(item.carMake||item.make)} {item.model} {item.year && `· ${item.year}`}</h1>

          <div className={cls.meta}>
            <span className={cls.rating}>{rating.toFixed(2)}⭐</span>
            <span>{item.tripCount || 0} trips</span>
          </div>

          {/* Host */}
          {item.business && (
            <div className={cls.hostedBy}>
              <img src={item.business.avatar || '/avatar.svg'} alt="host"/>
              <div>
                <strong>{item.business.name}</strong><br/>
                Joined {joined}
              </div>
              <span className={cls.hostRating}>{rating.toFixed(1)}⭐</span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className={cls.section}>
              <h2>Description</h2>
              <p style={{whiteSpace:'pre-line'}}>{item.description}</p>
            </div>
          )}

          {/* Map */}
          {lat && lng && (
            <div className={cls.section}>
              <h2>Pickup location</h2>
              <div style={{height:'280px'}}>
                <GoogleMapReact
                  bootstrapURLKeys={{key:process.env.REACT_APP_GOOGLE_MAPS_API_KEY}}
                  defaultCenter={{lat,lng}}
                  defaultZoom={12}
                >
                  <Marker lat={lat} lng={lng}/>
                </GoogleMapReact>
              </div>
            </div>
          )}
        </div>

        {/* right – booking box */}
        <aside className={cls.sidebar}>
          <form onSubmit={handleBooking} className={cls.priceBox}>
            <div className={cls.priceRow}>
              <span className={cls.today}>£{parseFloat(item.pricePerDay).toFixed(0)}</span>
              <span className={cls.unit}>/ day</span>
            </div>

            <label className={cls.label}>Name</label>
            <input
              required
              value={name}
              onChange={e=>setName(e.target.value)}
              className={cls.textInput}
              placeholder="Your name"
            />

            <label className={cls.label} style={{marginTop:'1rem'}}>Trip dates</label>
            <DatePicker
              selectsRange
              startDate={range[0]}
              endDate={range[1]}
              minDate={new Date()}
              onChange={update=>setRange(update)}
              inline
            />

            {item.transmission?.toLowerCase()==='manual' && (
              <label className={cls.manualCheck}>
                <input
                  type="checkbox"
                  checked={confirmManual}
                  onChange={e=>setConfirmManual(e.target.checked)}
                />
                &nbsp;This car is manual – I can drive a manual vehicle
              </label>
            )}

            {error && <p className={cls.error}>{error}</p>}
            <button className={cls.bookBtn}>Continue</button>
          </form>
        </aside>
      </section>
    </div>
  );
}
