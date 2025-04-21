// ──────────────────────────────────────────────────────────────
//  Vehicle‑details page
//  • /details/car/:id
//  • /details/listing/:id
// ──────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }     from 'react-router-dom';
import axios                          from 'axios';
import api                            from '../api';

/* side menus */
import SideMenu          from '../components/SideMenu';
import SideMenuCustomer  from '../components/SideMenuCustomer';
import SideMenuBusiness  from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import DatePicker        from 'react-datepicker';
import GoogleMapReact    from 'google-map-react';
import 'react-datepicker/dist/react-datepicker.css';

import cls from '../styles/CarDetailsPage.module.css';

/* tiny red Google‑maps marker */
const Marker = () => <div style={{ color:'#c00', fontWeight:700 }}>⬤</div>;

export default function CarDetailsPage() {
  /* ───────────────────────────── URL & nav */
  const { type, id } = useParams();            // "car" | "listing"
  const navigate     = useNavigate();

  /* ─────────────────────────── side‑menu */
  const [menuOpen, setMenuOpen] = useState(false);
  const token       = (localStorage.getItem('token') || '').trim();
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu  = () => setMenuOpen(false);

  let sideMenu = <SideMenu isOpen={menuOpen} toggleMenu={toggleMenu} />;
  if (token && accountType === 'customer')
    sideMenu = <SideMenuCustomer  isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  if (token && accountType === 'business')
    sideMenu = <SideMenuBusiness  isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;
  if (token && accountType === 'affiliate')
    sideMenu = <SideMenuAffiliate isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu}/>;

  /* ─────────────────────────── state */
  const [item, setItem]      = useState(null);
  const [leadImgIdx, setIdx] = useState(0);

  /* booking state */
  const today               = new Date();
  const [name, setName]     = useState('');
  const [startDate, setSd]  = useState(today);
  const [startTime, setSt]  = useState('10:00');
  const [endDate, setEd]    = useState(today);
  const [endTime, setEt]    = useState('10:00');
  const [confirmManual,setCM]=useState(false);
  const [error,setError]    = useState('');

  /* ─────────────────────────── fetch doc */
  useEffect(() => {
    (async () => {
      try {
        const apiRoot  = process.env.REACT_APP_BACKEND_URL;          // …/api
        const plainRoot= apiRoot.replace(/\/api$/,'');               // … (no /api)

        if (type === 'listing') {
          /* try every known public route first */
          const tryUrls = [
            `${plainRoot}/api/public/listings/${id}`,
            `${plainRoot}/api/public/${id}`
          ];

          for (const u of tryUrls) {
            try {
              const { data } = await axios.get(u);
              setItem(data);
              console.info('[details] fetched listing via', u);
              return;
            } catch (err) {
              if (err.response?.status !== 404) throw err; // real error
            }
          }

          /* final fall‑back → auth route (only if token present) */
          const authUrl = `${apiRoot}/business/listings/${id}`;
          const headers = token ? { Authorization:`Bearer ${token}` } : {};
          const { data } = await axios.get(authUrl, { headers });
          setItem(data);
          console.info('[details] fetched listing via', authUrl);
          return;
        }

        /* cars */
        const { data } = await axios.get(`${apiRoot}/cars/${id}`);
        setItem(data);
        console.info('[details] fetched car via /api/cars');
      } catch (err) {
        console.error('Details page fetch error:', err);
      }
    })();
  }, [type, id, token]);

  /* ─────────────────────────── booking */
  const handleBooking = async e => {
    e.preventDefault();
    setError('');

    if (item?.transmission?.toLowerCase()==='manual' && !confirmManual) {
      setError('Please confirm you can drive a manual vehicle.'); return;
    }

    try {
      const begin = new Date(`${startDate.toISOString().slice(0,10)}T${startTime}`);
      const finish= new Date(`${endDate.toISOString().slice(0,10)}T${endTime}`);

      await api.post('/bookings',{
        carId:id, customerName:name,
        startDate:begin, endDate:finish,
        basePrice:item.pricePerDay, currency:'gbp'
      });
      alert('Booking created!');
      navigate('/bookings/customer');
    } catch (err) {
      console.error(err); alert('Booking failed');
    }
  };

  /* ─────────────────────────── loading */
  if (!item) return <p className={cls.loading}>Loading…</p>;

  /* ─────────────────────────── helpers */
  const staticBase = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/, '');
  const pictures   = item.images?.length ? item.images : [item.imageUrl];
  const heroImg    = pictures[leadImgIdx];

  const lat = item.latitude  ?? item.location?.lat;
  const lng = item.longitude ?? item.location?.lng;

  const rating    = item.rating    || 4.94;
  const tripCount = item.tripCount || 33;
  const reviews   = item.reviews   || [];

  /* ─────────────────────────── render */
  return (
    <>
      {/* header */}
      <header className={cls.header}>
        <div className={cls.logo} onClick={()=>navigate('/')}>Hyre</div>
        <button className={cls.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {sideMenu}

      <div className={cls.page}>
        {/* gallery */}
        <section className={cls.gallery}>
          <div className={cls.mainImage}>
            <img src={`${staticBase}/${heroImg}`} alt="vehicle"/>
          </div>
          <div className={cls.sideImages}>
            {pictures.slice(0,4).map((img,i)=>(
              <img
                key={i}
                src={`${staticBase}/${img}`}
                alt="thumb"
                className={i===leadImgIdx ? cls.activeThumb : ''}
                onClick={()=>setIdx(i)}
              />
            ))}
          </div>
        </section>

        {/* columns */}
        <section className={cls.content}>
          <div className={cls.details}>
            <h1>{(item.carMake||item.make)} {item.model}{item.year && ` · ${item.year}`}</h1>
            <div className={cls.meta}>
              <span className={cls.rating}>{rating.toFixed(2)}⭐</span>
              <span>{tripCount} trips</span>
            </div>

            {item.business && (
              <div className={cls.hostedBy}>
                <img src="/avatar.svg" alt="host"/>
                <div>
                  <strong>{item.business.name}</strong><br/>
                  {new Date(item.business.createdAt).toLocaleDateString('en‑GB',{month:'short',year:'numeric'})}
                </div>
              </div>
            )}

            {item.description && (
              <div className={cls.section}>
                <h2>Description</h2>
                <p style={{whiteSpace:'pre-line'}}>{item.description}</p>
              </div>
            )}

            {lat && lng && (
              <div className={cls.section}>
                <h2>Pickup location</h2>
                <div style={{height:'280px'}}>
                  <GoogleMapReact
                    bootstrapURLKeys={{key:process.env.REACT_APP_GOOGLE_MAPS_API_KEY}}
                    defaultCenter={{lat,lng}} defaultZoom={12}
                  >
                    <Marker lat={lat} lng={lng}/>
                  </GoogleMapReact>
                </div>
              </div>
            )}

            {reviews.length>0 && (
              <div className={cls.section}>
                <h2>Ratings and reviews</h2>
                {reviews.map((r,i)=>(
                  <div key={i} className={cls.review}>
                    <img src="/avatar.svg" alt="user"/>
                    <div>
                      <div className={cls.stars}>★★★★★</div>
                      <small>{r.name} · {new Date(r.date).toLocaleDateString('en‑GB')}</small>
                      <p>{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* sidebar */}
          <aside className={cls.sidebar}>
            <form onSubmit={handleBooking} className={cls.priceBox}>
              <div className={cls.price}>
                £{parseFloat(item.pricePerDay).toFixed(0)}<small> / day</small>
              </div>
              <a href="#" className={cls.feeLink} onClick={e=>e.preventDefault()}>
                £{(item.pricePerDay*3).toFixed(0)} excl. taxes & fees
              </a>

              <hr style={{margin:'1rem 0'}}/>
              <h3 className={cls.boxHeading}>Your trip</h3>

              <label className={cls.label}>Name</label>
              <input
                required value={name}
                onChange={e=>setName(e.target.value)}
                className={cls.textInput} placeholder="Your name"
              />

              {/* start */}
              <label className={cls.label} style={{marginTop:'1rem'}}>Trip start</label>
              <div className={cls.row}>
                <DatePicker
                  selected={startDate} onChange={d=>setSd(d)}
                  minDate={today} dateFormat="dd/MM/yyyy"
                  className={cls.dateInput}
                />
                <input
                  type="time" value={startTime}
                  onChange={e=>setSt(e.target.value)} className={cls.timeInput}
                />
              </div>

              {/* end */}
              <label className={cls.label}>Trip end</label>
              <div className={cls.row}>
                <DatePicker
                  selected={endDate} onChange={d=>setEd(d)}
                  minDate={startDate} dateFormat="dd/MM/yyyy"
                  className={cls.dateInput}
                />
                <input
                  type="time" value={endTime}
                  onChange={e=>setEt(e.target.value)} className={cls.timeInput}
                />
              </div>

              {item.transmission?.toLowerCase()==='manual' && (
                <label className={cls.manualCheck}>
                  <input
                    type="checkbox" checked={confirmManual}
                    onChange={e=>setCM(e.target.checked)}
                  /> I can drive a manual vehicle
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
