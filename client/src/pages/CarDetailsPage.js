import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/CarDetailsPage.module.css';

export default function CarDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [mainImg, setMainImg] = useState('');
  const [showManualConfirm, setShowManualConfirm] = useState(false);
  const [approvedManual, setApprovedManual] = useState(false);
  const [tripStart, setTripStart] = useState(new Date());
  const [tripEnd, setTripEnd] = useState(new Date(Date.now() + 86400000));
  const [pickupLocation, setPickupLocation] = useState(listing?.address || '');
  const [bookingError, setBookingError] = useState('');

  const rawBackend = process.env.REACT_APP_BACKEND_URL || '';
  const staticBase = rawBackend.replace(/\/api$/, '');

  useEffect(() => {
    axios.get(`${rawBackend}/business/listings/${id}`)
      .then(({ data }) => {
        setListing(data);
        setMainImg(data.images && data.images[0] ? data.images[0] : '');
        setPickupLocation(data.address);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to load listing');
        navigate(-1);
      });
  }, [id, rawBackend, navigate]);

  if (!listing) return <div className={styles.loading}>Loading…</div>;

  const handleBookClick = () => {
    if (listing.transmission === 'Manual' && !approvedManual) {
      setShowManualConfirm(true);
    } else {
      // actually submit booking…
      axios.post(`${rawBackend}/bookings`, {
        listingId: id,
        start: tripStart.toISOString(),
        end: tripEnd.toISOString(),
        pickupLocation
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(() => {
        navigate('/my-bookings');
      })
      .catch(e => {
        console.error(e);
        setBookingError('Failed to create booking');
      });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.gallery}>
        <div className={styles.mainImage}>
          <img src={`${staticBase}/${mainImg}`} alt="main" />
        </div>
        <div className={styles.sideImages}>
          {listing.images.map((img, i) => (
            <img
              key={i}
              src={`${staticBase}/${img}`}
              alt={`thumb-${i}`}
              onClick={() => setMainImg(img)}
              className={img === mainImg ? styles.activeThumb : ''}
            />
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.details}>
          <h1>{listing.title}</h1>
          <div className={styles.meta}>
            <span className={styles.rating}>{listing.rating.toFixed(1)} ★</span>
            <span className={styles.trips}>({listing.totalTrips} trips)</span>
          </div>

          <div className={styles.badges}>
            {listing.seats && <span>{listing.seats} seats</span>}
            <span>{listing.fuelType}</span>
            {listing.mpg && <span>{listing.mpg} MPG</span>}
            <span>{listing.transmission} transmission</span>
          </div>

          <div className={styles.hostedBy}>
            <img
              src={`${staticBase}/${listing.host.avatar}`}
              alt={listing.host.name}
            />
            <div>
              <strong>{listing.host.name}</strong>
              <div className={styles.hostStats}>
                {listing.host.totalTrips} trips · Joined {new Date(listing.host.joined).toLocaleString('default', {
                  month: 'short', year: 'numeric'
                })}
              </div>
            </div>
          </div>

          <section className={styles.section}>
            <h2>Description</h2>
            <p>{listing.description}</p>
          </section>

          <section className={styles.section}>
            <h2>Vehicle features</h2>
            {Object.entries(listing.features).map(([group, items]) => (
              <div key={group} className={styles.featureGroup}>
                <h3>{group}</h3>
                <ul>
                  {items.map((feat, i) => <li key={i}>{feat}</li>)}
                </ul>
              </div>
            ))}
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.priceBox}>
            <div className={styles.price}>
              £{listing.pricePerDay.toFixed(2)}<small>/day</small>
            </div>
            <div className={styles.total}>
              Total: £{((tripEnd - tripStart)/(1000*60*60*24) * listing.pricePerDay).toFixed(2)}
            </div>
          </div>

          <div className={styles.bookingForm}>
            <label>Trip start</label>
            <DatePicker
              selected={tripStart}
              onChange={d => setTripStart(d)}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
            />

            <label>Trip end</label>
            <DatePicker
              selected={tripEnd}
              onChange={d => setTripEnd(d)}
              showTimeSelect
              dateFormat="dd/MM/yyyy HH:mm"
            />

            <label>Pickup location</label>
            <input
              type="text"
              value={pickupLocation}
              onChange={e => setPickupLocation(e.target.value)}
            />

            {bookingError && <div className={styles.error}>{bookingError}</div>}

            <button className={styles.bookBtn} onClick={handleBookClick}>
              Book
            </button>
          </div>
        </aside>
      </div>

      {showManualConfirm && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <p>This car is manual—can you drive a manual?</p>
            <button onClick={() => { setApprovedManual(true); setShowManualConfirm(false); }}>Yes</button>
            <button onClick={() => { setShowManualConfirm(false); }}>No</button>
          </div>
        </div>
      )}
    </div>
);
}
