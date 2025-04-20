// client/src/pages/CarDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }   from 'react-router-dom';
import axios     from 'axios';   // public GET
import api       from '../api';  // authorised POST /bookings
import DatePicker              from 'react-datepicker';
import GoogleMapReact          from 'google-map-react';
import 'react-datepicker/dist/react-datepicker.css';

/* small map marker */
const Marker = ({ text }) => (
  <div style={{ color: 'red', fontWeight: 700 }}>{text}</div>
);

export default function CarDetailsPage() {
  const { type, id } = useParams();          // “car” | “listing”
  const navigate    = useNavigate();
  const [item, setItem]            = useState(null);
  const [bookingRange, setRange]   = useState([new Date(), new Date()]);
  const [customerName, setName]    = useState('');

  /* ─── fetch public data ─── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const base = process.env.REACT_APP_BACKEND_URL;
        const url  =
          type === 'listing'
            ? `${base}/public/${id}`
            : `${base}/cars/${id}`;
        const { data } = await axios.get(url);
        setItem(data);
      } catch (err) {
        console.error('details fetch error', err);
      }
    };
    fetch();
  }, [type, id]);

  /* ─── booking handler ─── */
  const handleBooking = async (e) => {
    e.preventDefault();
    const [startDate, endDate] = bookingRange;
    try {
      await api.post('/bookings', {
        carId:      id,
        customerName,
        startDate,
        endDate,
        basePrice:  item.pricePerDay,
        currency:   'gbp',
      });
      alert('Booking created!');
      navigate('/bookings/customer');
    } catch (err) {
      console.error('booking error', err);
      alert('Booking failed');
    }
  };

  if (!item) return <p style={{padding:"2rem"}}>Loading…</p>;

  /* coords */
  const lat = item.latitude  ?? item.location?.lat;
  const lng = item.longitude ?? item.location?.lng;
  const defaultCenter = { lat, lng };

  /* images */
  const images = item.images?.length
    ? item.images
    : [ item.imageUrl ];

  const staticBase = process.env.REACT_APP_BACKEND_URL.replace(/\/api$/,'');
  return (
    <div style={{maxWidth:"1200px",margin:"0 auto",padding:"1rem"}}>
      {/* hero gallery */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 1fr",gap:"1rem"}}>
        <img
          src={`${staticBase}/${images[0]}`}
          alt="main"
          style={{width:"100%",borderRadius:"8px"}}
        />
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {images.slice(1,3).map((img,idx)=>(
            <img
              key={idx}
              src={`${staticBase}/${img}`}
              alt="thumb"
              style={{width:"100%",borderRadius:"8px",height:"50%"}}
            />
          ))}
        </div>
      </div>

      {/* headline */}
      <h1 style={{marginTop:"1rem",fontSize:"2rem"}}>
        {item.carMake || item.make} {item.model} {item.year && `· ${item.year}`}
      </h1>

      {/* quick chips */}
      <p style={{fontWeight:600,fontSize:"1.2rem"}}>
        £{item.pricePerDay}/day
      </p>

      {/* description */}
      {item.description && (
        <>
          <h3>Description</h3>
          <p>{item.description}</p>
        </>
      )}

      {/* feature list */}
      {item.features?.length > 0 && (
        <>
          <h3>Features</h3>
          <ul>
            {item.features.map(f=><li key={f}>{f}</li>)}
          </ul>
        </>
      )}

      {/* map */}
      {lat && lng && (
        <div style={{height:"300px",margin:"1rem 0"}}>
          <GoogleMapReact
            bootstrapURLKeys={{key:process.env.REACT_APP_GOOGLE_MAPS_API_KEY}}
            defaultCenter={defaultCenter}
            defaultZoom={12}
          >
            <Marker lat={lat} lng={lng} text="Pickup" />
          </GoogleMapReact>
        </div>
      )}

      {/* booking form */}
      <h3>Book this vehicle</h3>
      <form onSubmit={handleBooking} style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        <input
          required
          placeholder="Your name"
          value={customerName}
          onChange={e=>setName(e.target.value)}
        />
        <DatePicker
          selectsRange
          startDate={bookingRange[0]}
          endDate={bookingRange[1]}
          onChange={(update)=>setRange(update)}
          isClearable
        />
        {item.transmission?.toLowerCase()==='manual' && (
          <div style={{border:"1px solid #f33",padding:"0.75rem",borderRadius:"6px"}}>
            <p style={{margin:0,fontWeight:600}}>This car is a manual.</p>
            <label>
              <input type="checkbox" required /> I confirm I can drive manual
            </label>
          </div>
        )}
        <button style={{padding:"0.6rem 1rem"}}>Book Now</button>
      </form>
    </div>
  );
}
