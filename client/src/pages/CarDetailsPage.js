// client/src/pages/CarDetailsPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api   from '../api';

import SideMenu            from '../components/SideMenu';
import SideMenuCustomer    from '../components/SideMenuCustomer';
import SideMenuBusiness    from '../components/SideMenuBusiness';
import SideMenuAffiliate   from '../components/SideMenuAffiliate';

import DatePicker     from 'react-datepicker';
import GoogleMapReact from 'google-map-react';
import 'react-datepicker/dist/react-datepicker.css';

import cls from '../styles/CarDetailsPage.module.css';

// red map marker
const Marker = () => <div style={{ color: '#c00', fontWeight: 700 }}>⬤</div>;

// at least 1 day
const daysBetween = (a, b) => Math.max(1, Math.ceil((b - a) / 86400000));

export default function CarDetailsPage() {
  const { id }      = useParams();          // always listing
  const [qs]        = useSearchParams();
  const navigate    = useNavigate();
  const API_ROOT    = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/,'');

  // side‑menu state
  const [menuOpen, setMenuOpen]   = useState(false);
  const token                     = (localStorage.getItem('token')||'').trim();
  const accountType               = (localStorage.getItem('accountType')||'').toLowerCase();
  const toggleMenu  = ()=>setMenuOpen(o=>!o);
  const closeMenu   = ()=>setMenuOpen(false);
  let sideMenu      = <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu}/>;
  if (token && accountType==='customer')    sideMenu = <SideMenuCustomer isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  if (token && accountType==='business')    sideMenu = <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  if (token && accountType==='affiliate')   sideMenu = <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;

  // data state
  const [item,     setItem]     = useState(null);
  const [picsIdx, setPicsIdx]   = useState(0);
  const [gallery,  setGallery]  = useState(false);

  // booking form
  const today       = new Date();
  const qsFrom      = qs.get('from') ? new Date(qs.get('from')) : today;
  const qsUntil     = qs.get('to')   ? new Date(qs.get('to'))   : new Date(today.getTime()+2*86400000);
  const [name,         setName]        = useState('');
  const [startDate,    setStartDate]   = useState(qsFrom);
  const [startTime,    setStartTime]   = useState('10:00');
  const [endDate,      setEndDate]     = useState(qsUntil);
  const [endTime,      setEndTime]     = useState('10:00');
  const [confirmManual,setConfirmManual] = useState(false);
  const [error,        setError]       = useState('');

  // fetch listing + reviews in one go
  useEffect(()=>{
    (async()=>{
      try {
        const res = await axios.get(`${API_ROOT}/api/public/${id}`);
        // expects { ...listing, business: { name, avatarUrl, createdAt }, reviews: [ { client:{name,avatarUrl},rating,comment,createdAt } ] }
        setItem(res.data);
      } catch(err) {
        console.error('Details fetch error:', err);
      }
    })();
  },[id, API_ROOT]);

  // close gallery on ESC
  const escHandler = useCallback(e=>{
    if(e.key==='Escape') setGallery(false);
  },[]);
  useEffect(()=>{
    window.addEventListener('keydown', escHandler);
    return ()=>window.removeEventListener('keydown', escHandler);
  },[escHandler]);

  // booking submit
  const handleBooking = async e => {
    e.preventDefault();
    setError('');
    if (item.transmission.toLowerCase()==='manual' && !confirmManual) {
      setError('Please confirm you can drive a manual vehicle.');
      return;
    }
    try {
      const s = new Date(`${startDate.toISOString().slice(0,10)}T${startTime}`);
      const eD= new Date(`${endDate.toISOString().slice(0,10)}T${endTime}`);
      await api.post('/bookings',{
        carId: id,
        customerName: name,
        startDate: s,
        endDate: eD,
        basePrice: item.pricePerDay,
        currency: 'gbp'
      });
      alert('Booking created!');
      navigate('/bookings/customer');
    } catch(err){
      console.error(err);
      alert('Booking failed');
    }
  };

  // loading
  if(!item){
    return <>
      <header className={cls.header}>
        <div className={cls.logo} onClick={()=>navigate('/')}>Hyre</div>
      </header>
      <p className={cls.loading}>Loading…</p>
    </>;
  }

  // derived
  const pictures = item.images.length ? item.images : [item.imageUrl];
  const heroImg  = pictures[picsIdx];
  const lat      = item.latitude  ?? item.location.lat;
  const lng      = item.longitude ?? item.location.lng;

  // features grouping
  const safety = [], device = [], conv = [], extra = [];
  if(item.adaptiveCruiseControl) safety.push('Adaptive cruise control');
  if(item.blindSpotWarning)      safety.push('Blind spot warning');
  if(item.bluetooth)             device.push('Bluetooth');
  if(item.appleCarPlay)          device.push('Apple CarPlay');
  if(item.usbInput)              device.push('USB input');
  if(item.gps)                   conv.push('GPS');
  if(item.childSeat)             extra.push('Child seat');
  if(item.heatedSeats)           extra.push('Heated seats');

  // reviews
  const reviewsCount = item.reviews.length;
  const avgRating = reviewsCount>0
    ? (item.reviews.reduce((sum,r)=>sum + r.rating, 0)/reviewsCount).toFixed(2)
    : '0.00';

  // pricing
  const days = daysBetween(startDate,endDate);
  const subtotal = (days * parseFloat(item.pricePerDay)).toFixed(0);

  return (
    <>
      {/* header */}
      <header className={cls.header}>
        <div className={cls.logo} onClick={()=>navigate('/')}>Hyre</div>
        <button className={cls.menuIcon} onClick={toggleMenu}>☰</button>
      </header>
      {sideMenu}

      {/* gallery modal */}
      {gallery && (
        <div className={cls.modalBackdrop} onClick={()=>setGallery(false)}>
          <div className={cls.modalContent} onClick={e=>e.stopPropagation()}>
            <div className={cls.modalTop}>
              <h3>{item.make} {item.model} · {avgRating}⭐</h3>
              <button className={cls.closeBtn} onClick={()=>setGallery(false)}>✕</button>
            </div>
            <img src={`${API_ROOT}/${heroImg}`} alt="full"/>
            <div className={cls.modalThumbs}>
              {pictures.map((p,i)=>(
                <img key={i}
                     src={`${API_ROOT}/${p}`}
                     className={i===picsIdx?cls.modalActive:''}
                     onClick={()=>setPicsIdx(i)} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={cls.page}>
        {/* main gallery */}
        <section className={cls.gallery}>
          <div className={cls.mainImage} onClick={()=>setGallery(true)}>
            <img src={`${API_ROOT}/${heroImg}`} alt="vehicle"/>
          </div>
          <div className={cls.sideImages}>
            {pictures.slice(0,4).map((p,i)=>(
              <img
                key={i}
                src={`${API_ROOT}/${p}`}
                className={i===picsIdx?cls.activeThumb:''}
                onClick={()=>setPicsIdx(i)}
                alt="thumb"
              />
            ))}
          </div>
        </section>

        <section className={cls.content}>
          {/* details */}
          <div className={cls.details}>
            <h1>{item.make} {item.model}{item.year && ` · ${item.year}`}</h1>
            <div className={cls.meta}>
              <span className={cls.rating}>{avgRating}⭐</span>
              <span>{reviewsCount} trips</span>
            </div>

            {/* host */}
            <div className={cls.hostedBy}>
              {item.business.avatarUrl
                ? <img src={`${API_ROOT}/${item.business.avatarUrl}`} alt="host"/>
                : <div className={cls.placeholderAvatar}>{item.business.name[0]}</div>
              }
              <div>
                <strong>{item.business.name}</strong><br/>
                {new Date(item.business.createdAt)
                   .toLocaleDateString('en-GB',{month:'short',year:'numeric'})}
              </div>
            </div>

            {/* description */}
            <div className={cls.section}>
              <h2>Description</h2>
              <p style={{whiteSpace:'pre-line'}}>{item.description}</p>
            </div>

            {/* features grid */}
            <div className={cls.section}>
              <h2>Vehicle features</h2>
              <div className={cls.featuresGrid}>
                {safety.length>0 && <div className={cls.featureGroup}>
                  <h3>Safety</h3><ul>{safety.map(f=><li key={f}>{f}</li>)}</ul>
                </div>}
                {device.length>0 && <div className={cls.featureGroup}>
                  <h3>Device connectivity</h3><ul>{device.map(f=><li key={f}>{f}</li>)}</ul>
                </div>}
                {conv.length>0 && <div className={cls.featureGroup}>
                  <h3>Convenience</h3><ul>{conv.map(f=><li key={f}>{f}</li>)}</ul>
                </div>}
                {extra.length>0 && <div className={cls.featureGroup}>
                  <h3>Additional features</h3><ul>{extra.map(f=><li key={f}>{f}</li>)}</ul>
                </div>}
              </div>
            </div>

            {/* reviews */}
            {reviewsCount>0 && (
              <div className={cls.section}>
                <h2>Reviews</h2>
                {item.reviews.map((r,i)=>(
                  <div key={i} className={cls.review}>
                    {r.client.avatarUrl
                      ? <img src={`${API_ROOT}/${r.client.avatarUrl}`} alt="user"/>
                      : <div className={cls.reviewAvatar}>{r.client.name[0]}</div>}
                    <div>
                      <div className={cls.stars}>{"★".repeat(r.rating)}</div>
                      <small>
                        {r.client.name} • {new Date(r.createdAt).toLocaleDateString('en-GB')}
                      </small>
                      <p>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* map */}
            {lat!=null && lng!=null && (
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

          {/* booking sidebar */}
          <aside className={cls.sidebar}>
            <form onSubmit={handleBooking} className={cls.priceBox}>
              <div className={cls.priceRow}>
                <span className={cls.price}>£{item.pricePerDay}</span>
                <span className={cls.priceUnit}>/ day</span>
              </div>
              <div className={cls.subTotal}>£{subtotal} excl. taxes & fees</div>
              <hr/>
              <h3>Your trip</h3>
              <label>Name</label>
              <input
                required
                value={name}
                onChange={e=>setName(e.target.value)}
                className={cls.textInput}
                placeholder="Your name"
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
                    onChange={e=>setConfirmManual(e.target.checked)}
                  /> This car is manual – I can drive it
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
