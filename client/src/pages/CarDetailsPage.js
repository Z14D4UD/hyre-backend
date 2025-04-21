// ──────────────────────────────────────────────────────────────
//  Vehicle‑details page
//  • /details/car/:id
//  • /details/listing/:id
// ──────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }     from 'react-router-dom';
import axios  from 'axios';   // public GET
import api    from '../api';  // authorised POST /bookings

// side menus
import SideMenu            from '../components/SideMenu';
import SideMenuCustomer    from '../components/SideMenuCustomer';
import SideMenuBusiness    from '../components/SideMenuBusiness';
import SideMenuAffiliate   from '../components/SideMenuAffiliate';

import DatePicker     from 'react-datepicker';
import GoogleMapReact from 'google-map-react';
import 'react-datepicker/dist/react-datepicker.css';

import cls from '../styles/CarDetailsPage.module.css';

// tiny red map marker
const Marker = () => <div style={{ color: '#c00', fontWeight: 700 }}>⬤</div>;

export default function CarDetailsPage() {
  /* ─── URL params ─────────────────────────────────────────── */
  const { type, id } = useParams();   // "car" | "listing"
  const navigate      = useNavigate();

  /* ─── header / side‑menu state ───────────────────────────── */
  const [menuOpen, setMenuOpen] = useState(false);
  const token       = (localStorage.getItem('token') || '').trim();
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu  = () => setMenuOpen(false);

  let sideMenu = <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />;
  if (token && accountType === 'customer') {
    sideMenu = <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  } else if (token && accountType === 'business') {
    sideMenu = <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  } else if (token && accountType === 'affiliate') {
    sideMenu = <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  }

  /* ─── page state ─────────────────────────────────────────── */
  const [item,  setItem]  = useState(null);
  const [leadImgIdx, setLeadImgIdx] = useState(0);

  /* booking card */
  const today            = new Date();
  const [name, setName]  = useState('');
  const [startDate, setStart] = useState(today);
  const [startTime, setStartTime] = useState('10:00');
  const [endDate,   setEnd]   = useState(today);
  const [endTime,   setEndTime] = useState('10:00');
  const [confirmManual, setConfirmManual] = useState(false);
  const [error, setError] = useState('');

  /* ─── fetch listing / car document ───────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const base = process.env.REACT_APP_BACKEND_URL;
        const url  =
          type === 'listing'
            ? `${base}/listings/${id}`     // ← public route (no auth)
            : `${base}/cars/${id}`;
        const { data } = await axios.get(url);
        setItem(data);
      } catch (err) {
        console.error('Details page fetch error:', err);
      }
    })();
  }, [type, id]);

  /* ─── booking submit ─────────────────────────────────────── */
  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');

    if (item?.transmission?.toLowerCase() === 'manual' && !confirmManual) {
      setError('Please confirm you can drive a manual vehicle.');
      return;
    }

    try {
      const sDate = new Date(
        `${startDate.toISOString().slice(0, 10)}T${startTime}`
      );
      const eDate = new Date(
        `${endDate.toISOString().slice(0, 10)}T${endTime}`
      );

      await api.post('/bookings', {
        carId: id,
        customerName: name,
        startDate: sDate,
        endDate: eDate,
        basePrice: item.pricePerDay,
        currency: 'gbp'
      });
      alert('Booking created!');
      navigate('/bookings/customer');
    } catch (err) {
      console.error(err);
      alert('Booking failed');
    }
  };

  /* ─── early loading state ────────────────────────────────── */
  if (!item) return <p className={cls.loading}>Loading…</p>;

  /* ─── derived helpers  ───────────────────────────────────── */
  const staticBase = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/, '');
  const pictures   = item.images?.length ? item.images : [item.imageUrl];
  const heroImg    = pictures[leadImgIdx];

  const lat = item.latitude  ?? item.location?.lat;
  const lng = item.longitude ?? item.location?.lng;

  const rating    = item.rating    || 4.94;
  const tripCount = item.tripCount || 33;
  const reviews   = item.reviews   || []; // from controller

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <>
      {/* ───────── Header ───────── */}
      <header className={cls.header}>
        <div className={cls.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={cls.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {sideMenu}

      <div className={cls.page}>
        {/* ───────── Gallery ───────── */}
        <section className={cls.gallery}>
          <div className={cls.mainImage}>
            <img src={`${staticBase}/${heroImg}`} alt="vehicle" />
          </div>
          <div className={cls.sideImages}>
            {pictures.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={`${staticBase}/${img}`}
                alt="thumb"
                className={i === leadImgIdx ? cls.activeThumb : ''}
                onClick={() => setLeadImgIdx(i)}
              />
            ))}
          </div>
        </section>

        {/* ───────── Twin columns ───────── */}
        <section className={cls.content}>
          <div className={cls.details}>
            {/* title & meta */}
            <h1>
              {(item.carMake || item.make)} {item.model}
              {item.year && ` · ${item.year}`}
            </h1>
            <div className={cls.meta}>
              <span className={cls.rating}>{rating.toFixed(2)}⭐</span>
              <span>{tripCount} trips</span>
            </div>

            {/* host */}
            {item.business && (
              <div className={cls.hostedBy}>
                <img src="/avatar.svg" alt="host" />
                <div>
                  <strong>{item.business.name}</strong>
                  <br />
                  {new Date(item.business.createdAt).toLocaleDateString(
                    'en-GB',
                    { month: 'short', year: 'numeric' }
                  )}
                </div>
              </div>
            )}

            {/* description */}
            {item.description && (
              <div className={cls.section}>
                <h2>Description</h2>
                <p style={{ whiteSpace: 'pre-line' }}>{item.description}</p>
              </div>
            )}

            {/* map */}
            {lat && lng && (
              <div className={cls.section}>
                <h2>Pickup location</h2>
                <div style={{ height: '280px' }}>
                  <GoogleMapReact
                    bootstrapURLKeys={{
                      key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
                    }}
                    defaultCenter={{ lat, lng }}
                    defaultZoom={12}
                  >
                    <Marker lat={lat} lng={lng} />
                  </GoogleMapReact>
                </div>
              </div>
            )}

            {/* reviews */}
            {reviews.length > 0 && (
              <div className={cls.section}>
                <h2>Ratings and reviews</h2>
                {reviews.map((r, i) => (
                  <div key={i} className={cls.review}>
                    <img src="/avatar.svg" alt="user" />
                    <div>
                      <div className={cls.stars}>★★★★★</div>
                      <small>
                        {r.name} ·{' '}
                        {new Date(r.date).toLocaleDateString('en-GB')}
                      </small>
                      <p>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ───────── Sidebar (booking card) ───────── */}
          <aside className={cls.sidebar}>
            <form onSubmit={handleBooking} className={cls.priceBox}>
              <div className={cls.price}>
                £{parseFloat(item.pricePerDay).toFixed(0)}
                <small> / day</small>
              </div>
              <a
                href="#"
                className={cls.feeLink}
                onClick={(e) => e.preventDefault()}
              >
                £{(item.pricePerDay * 3).toFixed(0)} excl. taxes & fees
              </a>

              <hr style={{ margin: '1rem 0' }} />

              <h3 className={cls.boxHeading}>Your trip</h3>

              <label className={cls.label}>Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cls.textInput}
                placeholder="Your name"
              />

              {/* Trip‑start */}
              <label className={cls.label} style={{ marginTop: '1rem' }}>
                Trip start
              </label>
              <div className={cls.row}>
                <DatePicker
                  selected={startDate}
                  onChange={(d) => setStart(d)}
                  minDate={today}
                  dateFormat="dd/MM/yyyy"
                  className={cls.dateInput}
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={cls.timeInput}
                />
              </div>

              {/* Trip‑end */}
              <label className={cls.label}>Trip end</label>
              <div className={cls.row}>
                <DatePicker
                  selected={endDate}
                  onChange={(d) => setEnd(d)}
                  minDate={startDate}
                  dateFormat="dd/MM/yyyy"
                  className={cls.dateInput}
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={cls.timeInput}
                />
              </div>

              {item.transmission?.toLowerCase() === 'manual' && (
                <label className={cls.manualCheck}>
                  <input
                    type="checkbox"
                    checked={confirmManual}
                    onChange={(e) => setConfirmManual(e.target.checked)}
                  />{' '}
                  This car is manual – I can drive a manual vehicle
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
