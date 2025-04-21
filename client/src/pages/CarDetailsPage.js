// client/src/pages/CarDetailsPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api   from '../api';

import SideMenu           from '../components/SideMenu';
import SideMenuCustomer   from '../components/SideMenuCustomer';
import SideMenuBusiness   from '../components/SideMenuBusiness';
import SideMenuAffiliate  from '../components/SideMenuAffiliate';

import DatePicker     from 'react-datepicker';
import GoogleMapReact from 'google-map-react';
import 'react-datepicker/dist/react-datepicker.css';

import cls from '../styles/CarDetailsPage.module.css';

// tiny red map marker
const Marker = () => <div style={{ color: '#c00', fontWeight: 700 }}>⬤</div>;

// ensure at least 1 day difference
const daysBetween = (a, b) => Math.max(1, Math.ceil((b - a) / 86400000));

export default function CarDetailsPage() {
  const { id }            = useParams();
  const [qs]              = useSearchParams();
  const navigate          = useNavigate();

  // ── side‑menu state ───────────────────────────
  const [menuOpen, setMenuOpen] = useState(false);
  const token    = (localStorage.getItem('token')||'').trim();
  const acct     = (localStorage.getItem('accountType')||'').toLowerCase();
  const toggle   = () => setMenuOpen(o=>!o);
  const close    = () => setMenuOpen(false);

  let sideMenu = <SideMenu isOpen={menuOpen} toggleMenu={toggle}/>;
  if (token && acct === 'customer')  sideMenu = <SideMenuCustomer  isOpen={menuOpen} toggleMenu={toggle} closeMenu={close}/>;
  if (token && acct === 'business')  sideMenu = <SideMenuBusiness  isOpen={menuOpen} toggleMenu={toggle} closeMenu={close}/>;
  if (token && acct === 'affiliate') sideMenu = <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggle} closeMenu={close}/>;

  // ── listing + form state ───────────────────────
  const [item, setItem]               = useState(null);
  const [picsIdx, setPicsIdx]         = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const today    = new Date();
  const qFrom    = qs.get('from') ? new Date(qs.get('from')) : today;
  const qUntil   = qs.get('to')   ? new Date(qs.get('to'))   : new Date(today.getTime() + 2*86400000);

  const [name, setName]             = useState('');
  const [startDate, setStartDate]   = useState(qFrom);
  const [startTime, setStartTime]   = useState('10:00');
  const [endDate, setEndDate]       = useState(qUntil);
  const [endTime, setEndTime]       = useState('10:00');
  const [confirmManual, setConfirm] = useState(false);
  const [error, setError]           = useState('');

  // ── fetch listing (public) ──────────────────────
  useEffect(() => {
    (async () => {
      try {
        const API_ROOT = process.env.REACT_APP_BACKEND_URL; // e.g. https://hyre-backend.onrender.com/api
        // ← here we call the correct public route:
        const { data } = await axios.get(`${API_ROOT}/listings/${id}`);
        setItem(data);
      } catch (err) {
        console.error('Details fetch error:', err);
        alert('Failed to load listing.');
      }
    })();
  }, [id]);

  // ── ESC closes gallery ──────────────────────────
  const escHandler = useCallback(e => {
    if (e.key === 'Escape') setGalleryOpen(false);
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [escHandler]);

  // ── booking submit ──────────────────────────────
  const handleBooking = async e => {
    e.preventDefault();
    setError('');
    if (item.transmission.toLowerCase() === 'manual' && !confirmManual) {
      return setError('Please confirm you can drive a manual vehicle.');
    }
    try {
      const s = new Date(`${startDate.toISOString().slice(0,10)}T${startTime}`);
      const eD= new Date(`${endDate.toISOString().slice(0,10)}T${endTime}`);
      await api.post('/bookings', {
        carId:        id,
        customerName: name,
        startDate:    s,
        endDate:      eD,
        basePrice:    item.pricePerDay,
        currency:     'gbp'
      });
      alert('Booking created!');
      navigate('/bookings/customer');
    } catch (err) {
      console.error(err);
      alert('Booking failed');
    }
  };

  // ── loading state ──────────────────────────────
  if (!item) {
    return (
      <>
        <header className={cls.header}>
          <div className={cls.logo} onClick={()=>navigate('/')}>Hyre</div>
        </header>
        <p className={cls.loading}>Loading…</p>
      </>
    );
  }

  // ── derived values ──────────────────────────────
  const ROOT     = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/,'');
  const pictures = item.images?.length ? item.images : [item.imageUrl].filter(Boolean);
  const leadImg  = pictures[picsIdx];
  const lat      = item.latitude  ?? item.location?.lat;
  const lng      = item.longitude ?? item.location?.lng;
  const days     = daysBetween(startDate, endDate);
  const subtotal = (days * parseFloat(item.pricePerDay||0)).toFixed(0);

  const revs      = item.reviews || [];
  const tripCount = revs.length;
  const avgRating = tripCount > 0
    ? (revs.reduce((sum,r)=>(sum + (r.rating||0)),0)/tripCount).toFixed(2)
    : (item.rating || 0).toFixed(2);

  return (
    <>
      {/* fixed header */}
      <header className={cls.header}>
        <div className={cls.logo} onClick={()=>navigate('/')}>Hyre</div>
        <button className={cls.menuIcon} onClick={toggle}>☰</button>
      </header>
      {sideMenu}

      {/* fullscreen gallery */}
      {galleryOpen && (
        <div className={cls.modalBackdrop} onClick={()=>setGalleryOpen(false)}>
          <div className={cls.modalContent} onClick={e=>e.stopPropagation()}>
            <div className={cls.modalTop}>
              <h3>{item.make} {item.model} • {avgRating}⭐</h3>
              <button className={cls.closeBtn} onClick={()=>setGalleryOpen(false)}>✕</button>
            </div>
            <img src={`${ROOT}/${leadImg}`} alt="full"/>
            <div className={cls.modalThumbs}>
              {pictures.map((p,i)=>(
                <img
                  key={i}
                  src={`${ROOT}/${p}`}
                  className={i===picsIdx?cls.modalActive:''}
                  onClick={()=>setPicsIdx(i)}
                  alt="thumb"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={cls.page}>
        {/* gallery */}
        <section className={cls.gallery}>
          <div className={cls.mainImage} onClick={()=>setGalleryOpen(true)}>
            <img src={`${ROOT}/${leadImg}`} alt="vehicle"/>
          </div>
          <div className={cls.sideImages}>
            {pictures.slice(0,4).map((p,i)=>(
              <img
                key={i}
                src={`${ROOT}/${p}`}
                className={i===picsIdx?cls.activeThumb:''}
                onClick={()=>setPicsIdx(i)}
                alt="thumb"
              />
            ))}
          </div>
        </section>

        {/* details + booking */}
        <section className={cls.content}>
          <div className={cls.details}>
            <h1>{item.make} {item.model}{item.year && ` · ${item.year}`}</h1>
            <div className={cls.meta}>
              <span className={cls.rating}>{avgRating}⭐</span>
              <span>{tripCount} trips</span>
            </div>

            {/* host info */}
            <div className={cls.hostedBy}>
              {item.business.avatarUrl
                ? <img src={`${ROOT}/${item.business.avatarUrl}`} alt="host"/>
                : <div className={cls.placeholderAvatar}>{item.business.name[0]}</div>}
              <div>
                <strong>{item.business.name}</strong><br/>
                Joined {new Date(item.business.createdAt)
                  .toLocaleDateString('en-GB',{month:'short',year:'numeric'})}
              </div>
            </div>

            {/* features */}
            <div className={cls.section}>
              <h2>Features</h2>
              <ul className={cls.featureList}>
                {[
                  'gps','bluetooth','heatedSeats','parkingSensors','backupCamera',
                  'appleCarPlay','androidAuto','keylessEntry','childSeat','leatherSeats',
                  'tintedWindows','convertible','roofRack','petFriendly','smokeFree',
                  'seatCovers','dashCam'
                ].filter(f=>item[f]).map(f=>(
                  <li key={f}>{f.replace(/([A-Z])/g,' $1')}</li>
                ))}
              </ul>
            </div>

            {/* description */}
            {item.description && (
              <div className={cls.section}>
                <h2>Description</h2>
                <p style={{whiteSpace:'pre-line'}}>{item.description}</p>
              </div>
            )}

            {/* reviews */}
            {tripCount>0 && (
              <div className={cls.section}>
                <h2>Reviews</h2>
                {revs.map(r=>(
                  <div key={r._id} className={cls.review}>
                    <img
                      src={r.client?.avatarUrl ? `${ROOT}/${r.client.avatarUrl}` : '/avatar.svg'}
                      alt="user"
                    />
                    <div>
                      <div className={cls.stars}>
                        {'★'.repeat(Math.round(r.rating||0))}
                      </div>
                      <small>
                        {r.client?.name || 'Guest'} • {new Date(r.createdAt)
                          .toLocaleDateString('en-GB')}
                      </small>
                      <p>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* map */}
            {lat != null && lng != null && (
              <div className={cls.section}>
                <h2>Pickup location</h2>
                <div style={{height:'280px'}}>
                  <GoogleMapReact
                    bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
                    defaultCenter={{ lat, lng }}
                    defaultZoom={12}
                  >
                    <Marker lat={lat} lng={lng}/>
                  </GoogleMapReact>
                </div>
              </div>
            )}
          </div>

          <aside className={cls.sidebar}>
            <form onSubmit={handleBooking} className={cls.priceBox}>
              <div className={cls.priceRow}>
                <span className={cls.price}>£{parseFloat(item.pricePerDay).toFixed(0)}</span>
                <span className={cls.priceUnit}>/ day</span>
              </div>
              <div className={cls.subTotal}>£{subtotal} excl. taxes & fees</div>
              <hr/>

              <h3>Your trip</h3>
              <label>Name</label>
              <input
                required
                className={cls.textInput}
                placeholder="Your name"
                value={name}
                onChange={e=>setName(e.target.value)}
              />

              <label>Trip start</label>
              <div className={cls.row}>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  minDate={today}
                  dateFormat="dd/MM/yyyy"
                  className={cls.dateInput}
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={e=>setStartTime(e.target.value)}
                  className={cls.timeInput}
                />
              </div>

              <label>Trip end</label>
              <div className={cls.row}>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  minDate={startDate}
                  dateFormat="dd/MM/yyyy"
                  className={cls.dateInput}
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={e=>setEndTime(e.target.value)}
                  className={cls.timeInput}
                />
              </div>

              {item.transmission.toLowerCase()==='manual' && (
                <label className={cls.manualCheck}>
                  <input
                    type="checkbox"
                    checked={confirmManual}
                    onChange={e=>setConfirm(e.target.checked)}
                  /> This car is manual – I can drive a manual vehicle
                </label>
              )}

              {error && <p className={cls.error}>{error}</p>}
              <button className={cls.bookBtn}>Continue</button>
            </form>
          </aside>
        </section>
      </div>
    </>
  );
}
