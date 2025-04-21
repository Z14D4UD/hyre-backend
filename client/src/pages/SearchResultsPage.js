// client/src/pages/SearchResultsPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  GoogleMap,
  Marker as GMarker,
  useJsApiLoader,
} from '@react-google-maps/api';

import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import PlaceAutocomplete from '../components/PlaceAutocomplete';

import styles from '../styles/SearchResultsPage.module.css';
import heroImage from '../assets/lambo.jpg';

const mapContainerStyle = { width: '100%', height: '100%' };
// Earth radius in km
const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two lat/lng points */
function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geocode an address string to { lat, lng }
async function geocodeAddress(address) {
  if (!window.google) return null;
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        });
      } else {
        reject(status);
      }
    });
  });
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL params
  const initialLocation = searchParams.get('location') || '';
  const latParam = parseFloat(searchParams.get('lat'));
  const lngParam = parseFloat(searchParams.get('lng'));

  // Main state
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [allResults, setAllResults] = useState([]); // raw from API
  const [mapCenter, setMapCenter] = useState(
    !isNaN(latParam) && !isNaN(lngParam)
      ? { lat: latParam, lng: lngParam }
      : { lat: 51.5074, lng: -0.1278 } // London
  );
  const [mapZoom, setMapZoom] = useState(12);
  const [loading, setLoading] = useState(false);

  // Filters
  const [price, setPrice] = useState(0);
  const [vehicleType, setVehicleType] = useState('');
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [untilTime, setUntilTime] = useState('');

  // Side menu
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const token = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();

  // Google Maps loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const API_ROOT = process.env.REACT_APP_BACKEND_URL;
  const STATIC_ROOT = API_ROOT.replace(/\/api$/, '');

  // Fetch raw results once (no client filtering yet)
  const fetchResults = async (loc) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ROOT}/cars/searchAll`, {
        params: { query: loc },
      });
      setAllResults(res.data || []);
    } catch (e) {
      console.error('Fetch error', e);
      alert('Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  // On mount or initialLocation change:
  useEffect(() => {
    // If no lat/lng from URL, geocode the location text
    if (!(!isNaN(latParam) && !isNaN(lngParam)) && initialLocation && isLoaded) {
      geocodeAddress(initialLocation)
        .then((coords) => {
          setMapCenter(coords);
          setMapZoom(14);
        })
        .catch((e) => console.error('Geocode failed', e));
    } else if (!isNaN(latParam) && !isNaN(lngParam)) {
      setMapZoom(14);
    }
    fetchResults(initialLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation, latParam, lngParam, isLoaded]);

  // When user hits the Search button
  const handleSearch = async () => {
    if (searchQuery && isLoaded) {
      try {
        const coords = await geocodeAddress(searchQuery);
        setMapCenter(coords);
        setMapZoom(14);
        // update URL (optional)
        const q = new URLSearchParams();
        q.set('location', searchQuery);
        q.set('lat', coords.lat);
        q.set('lng', coords.lng);
        navigate({ search: q.toString() }, { replace: true });
      } catch (e) {
        console.error('Geocode failed', e);
      }
    }
    fetchResults(searchQuery);
  };

  const handlePlaceSelect = (prediction) => {
    setSearchQuery(prediction.description);
  };

  // Apply all filters **client‑side**:
  const filteredResults = useMemo(() => {
    return allResults.filter((res) => {
      const d = res.data;
      // 1) Must have coordinates
      if (!d.latitude || !d.longitude) return false;
      // 2) Distance ≤ 20 km
      const km = distanceKm(
        mapCenter.lat,
        mapCenter.lng,
        d.latitude,
        d.longitude
      );
      if (km > 20) return false;
      // 3) Price filter
      if (price > 0 && parseFloat(d.pricePerDay) > price) return false;
      // 4) Vehicle type
      if (vehicleType && d.carType !== vehicleType) return false;
      // 5) Make
      if (make && d.make !== make) return false;
      // 6) Year
      if (year && d.year.toString() !== year) return false;
      // 7) TODO: date/time availability filtering if you have that data
      return true;
    });
  }, [
    allResults,
    mapCenter,
    price,
    vehicleType,
    make,
    year,
  ]);

  // Side‑menu component
  let Side = <SideMenu isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} />;
  if (token) {
    if (accountType === 'business') {
      Side = (
        <SideMenuBusiness
          isOpen={sideMenuOpen}
          toggleMenu={() => setSideMenuOpen(false)}
          closeMenu={() => setSideMenuOpen(false)}
        />
      );
    } else if (accountType === 'affiliate') {
      Side = (
        <SideMenuAffiliate
          isOpen={sideMenuOpen}
          toggleMenu={() => setSideMenuOpen(false)}
          closeMenu={() => setSideMenuOpen(false)}
        />
      );
    } else {
      Side = (
        <SideMenuCustomer
          isOpen={sideMenuOpen}
          toggleMenu={() => setSideMenuOpen(false)}
          closeMenu={() => setSideMenuOpen(false)}
        />
      );
    }
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button
          className={styles.menuIcon}
          onClick={() => setSideMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </header>

      {Side}

      {/* HERO */}
      <section
        className={styles.heroSection}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.hyreTopRow}>
          <PlaceAutocomplete
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPlaceSelect={handlePlaceSelect}
            placeholder="Where to?"
          />
          <div className={styles.hyreDateTime}>
            <label>From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
          </div>
          <div className={styles.hyreDateTime}>
            <label>Until:</label>
            <input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
            />
            <input
              type="time"
              value={untilTime}
              onChange={(e) => setUntilTime(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.hyreBottomRow}>
          <div className={styles.filterInline}>
            <label>Max Price: £{price || 'Any'}</label>
            <input
              type="range"
              min="0"
              max="20000"
              step="100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.rangeInput}
            />
            <input
              type="number"
              min="0"
              max="20000"
              step="100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.numberInput}
            />
          </div>
          <div className={styles.filterInline}>
            <label>Type:</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="">All</option>
              <option>Sedan</option>
              <option>SUV</option>
              <option>Hatchback</option>
              <option>Coupe</option>
              <option>Convertible</option>
              <option>Pickup truck</option>
              <option>Minivan</option>
              <option>Motorcycle</option>
              <option>Truck</option>
              <option>Wagon</option>
              <option>Van</option>
              <option>Other</option>
            </select>
          </div>
          <div className={styles.filterInline}>
            <label>Make:</label>
            <select value={make} onChange={(e) => setMake(e.target.value)}>
              <option value="">All</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Ford</option>
              <option>BMW</option>
              <option>Audi</option>
              <option>Mercedes-Benz</option>
              <option>Chevrolet</option>
              <option>Nissan</option>
              <option>Volkswagen</option>
              <option>Kia</option>
              <option>Hyundai</option>
              <option>Subaru</option>
              <option>Mazda</option>
              <option>Dodge</option>
              <option>Jeep</option>
              <option>Lexus</option>
              <option>Acura</option>
            </select>
          </div>
          <div className={styles.filterInline}>
            <label>Year:</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All</option>
              {Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 2025 - i).map(
                (yr) => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={styles.filterInline}>
            <button className={styles.searchBtn} onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* errors */}
      {loadError && (
        <div style={{ color: 'red', margin: '1rem' }}>
          Error loading Google Maps.
        </div>
      )}

      <div className={styles.searchPageColumns}>
        {/* LISTINGS */}
        <div className={styles.resultsContainer}>
          {loading ? (
            <p>Loading listings…</p>
          ) : filteredResults.length === 0 ? (
            <p>No listings found for “{searchQuery}”.</p>
          ) : (
            <>
              <div className={styles.listingsHeader}>
                <h2>
                  {filteredResults.length} cars available
                  <span className={styles.subHeader}> • Within 20 km</span>
                </h2>
                <p className={styles.subText}>
                  Around <strong>{searchQuery || 'London'}</strong>.
                </p>
              </div>
              <div className={styles.listingsGrid}>
                {filteredResults.map(({ type, data }) => (
                  <div
                    key={data._id}
                    className={styles.listingCard}
                    onClick={() => navigate(`/details/listing/${data._id}`)}
                  >
                    <div className={styles.imageWrapper}>
                      <img
                        src={
                          type === 'car'
                            ? `${STATIC_ROOT}/${data.imageUrl}`
                            : data.images?.[0]
                            ? `${STATIC_ROOT}/${data.images[0]}`
                            : '/placeholder.jpg'
                        }
                        alt={type === 'car' ? `${data.carMake}` : data.title}
                        className={styles.cardImage}
                      />
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.carTitle}>
                        {type === 'car'
                          ? `${data.carMake} ${data.model}`
                          : data.title}
                      </h3>
                      <p className={styles.carLocation}>
                        {data.location || data.address}
                      </p>
                      <p className={styles.price}>
                        £{parseFloat(data.pricePerDay).toFixed(2)}/day
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* MAP */}
        <div className={styles.mapContainer}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
            >
              {filteredResults.map(({ data }) =>
                data.latitude && data.longitude ? (
                  <GMarker
                    key={data._id}
                    position={{
                      lat: data.latitude,
                      lng: data.longitude,
                    }}
                    onClick={() => navigate(`/details/listing/${data._id}`)}
                  />
                ) : null
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
