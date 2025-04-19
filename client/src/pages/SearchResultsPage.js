// client/src/pages/SearchResultsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';

import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';
import PlaceAutocomplete from '../components/PlaceAutocomplete';

import styles from '../styles/SearchResultsPage.module.css';
import heroImage from '../assets/lambo.jpg';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Basic geocoding (for Home -> SearchResults transition)
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

  const DEFAULT_CITY = 'London';

  // pull from URL or default to blank → we’ll seed with DEFAULT_CITY in state
  const initialLocation = searchParams.get('location') || '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const [searchQuery, setSearchQuery] = useState(
    initialLocation.trim() || DEFAULT_CITY
  );
  const [results, setResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(
    latParam && lngParam
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: 51.5074, lng: -0.1278 }
  );
  const [mapZoom, setMapZoom] = useState(11);
  const [loading, setLoading] = useState(false);
  const [activeMarkerId, setActiveMarkerId] = useState(null);

  // Filters
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [untilTime, setUntilTime] = useState('');
  const [price, setPrice] = useState(0);
  const [vehicleType, setVehicleType] = useState('');
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');

  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const staticUrl = backendUrl.replace(/\/api$/, '');

  // fetch & client‑side filter by city
  const fetchResults = async (query) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/cars/searchAll`, {
        params: {
          query,
          price,
          vehicleType,
          make,
          year,
          fromDate,
          fromTime,
          untilDate,
          untilTime,
          radius: 50,
        },
      });

      // decide which city to match: real query or DEFAULT_CITY
      const cityToMatch = (query && query.trim()) || DEFAULT_CITY;
      const filtered = res.data.filter(result => {
        const addr = (
          result.data.address ||
          result.data.location ||
          ''
        ).toLowerCase();
        return addr.includes(cityToMatch.toLowerCase());
      });

      setResults(filtered);
    } catch (err) {
      console.error('Error fetching results:', err);
      alert('Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  // on mount / param change
  useEffect(() => {
    if ((!latParam || !lngParam) && initialLocation && isLoaded && window.google) {
      geocodeAddress(initialLocation)
        .then(coords => {
          setMapCenter(coords);
          setMapZoom(11);
        })
        .catch(err => {
          console.error('Geocode error:', err);
          setMapCenter({ lat: 51.5074, lng: -0.1278 });
          setMapZoom(10);
        });
    }
    fetchResults(initialLocation.trim() || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation, latParam, lngParam, isLoaded]);

  const handleSearch = async () => {
    if (searchQuery && isLoaded && window.google) {
      try {
        const coords = await geocodeAddress(searchQuery);
        if (coords) {
          setMapCenter(coords);
          setMapZoom(11);
        }
      } catch (err) {
        console.error('Geocode error:', err);
      }
    }
    fetchResults(searchQuery);
  };

  const handlePlaceSelect = (prediction) => {
    setSearchQuery(prediction.description);
  };

  // choose side menu
  const token = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  let sideMenuComponent = <SideMenu isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} />;
  if (token) {
    if (accountType === 'business') {
      sideMenuComponent = <SideMenuBusiness isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} closeMenu={() => setSideMenuOpen(false)} />;
    } else if (accountType === 'affiliate') {
      sideMenuComponent = <SideMenuAffiliate isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} closeMenu={() => setSideMenuOpen(false)} />;
    } else {
      sideMenuComponent = <SideMenuCustomer isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} closeMenu={() => setSideMenuOpen(false)} />;
    }
  }

  const handleMarkerClick = id => setActiveMarkerId(prev => prev === id ? null : id);
  const handleCloseInfoWindow = () => setActiveMarkerId(null);

  const renderInfoWindowContent = (data, resultType) => {
    const {
      _id, pricePerDay, carMake, model,
      title, location, address, images, imageUrl
    } = data;
    const finalTitle = resultType === 'car'
      ? `${carMake} ${model}`
      : title || 'Untitled';
    const finalLocation = location || address || 'No location';
    const finalImage = resultType === 'car'
      ? imageUrl
      : (images && images.length > 0 ? images[0] : '/placeholder.jpg');

    return (
      <div style={{ width: '220px', cursor: 'pointer' }} onClick={() => navigate(`/details/${_id}`)}>
        <img
          src={`${staticUrl}/${finalImage}`}
          alt={finalTitle}
          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
        />
        <h4 style={{ margin: '8px 0', fontSize: '1rem' }}>{finalTitle}</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{finalLocation}</p>
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
          £{parseFloat(pricePerDay).toFixed(2)}/day
        </p>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={() => setSideMenuOpen(!sideMenuOpen)}>☰</button>
      </header>

      {/* HERO & FILTERS */}
      <div className={styles.mainContent}>
        <section
          className={styles.heroSection}
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className={styles.heroOverlay} />
          <div className={styles.hyreTopRow}>
            <PlaceAutocomplete
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Where to?"
            />
            <div className={styles.hyreDateTime}>
              <label>From:</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              <input type="time" value={fromTime} onChange={e => setFromTime(e.target.value)} />
            </div>
            <div className={styles.hyreDateTime}>
              <label>Until:</label>
              <input type="date" value={untilDate} onChange={e => setUntilDate(e.target.value)} />
              <input type="time" value={untilTime} onChange={e => setUntilTime(e.target.value)} />
            </div>
          </div>
          <div className={styles.hyreBottomRow}>
            {/* price, type, make, year filters… */}
            <div className={styles.filterInline}>
              <label>Price £0–£20,000 (Current: £{price})</label>
              <input
                type="range" min="0" max="20000" step="100"
                value={price} onChange={e => setPrice(e.target.value)}
                className={styles.rangeInput}
              />
              <input
                type="number" min="0" max="20000" step="100"
                value={price} onChange={e => setPrice(e.target.value)}
                className={styles.numberInput}
              />
            </div>
            {/* … other selects … */}
            <div className={styles.filterInline}>
              <button className={styles.searchBtn} onClick={handleSearch}>Search</button>
            </div>
          </div>
        </section>
      </div>

      {loadError && (
        <div style={{ color: 'red', margin: '1rem 0' }}>
          Error loading Google Maps. (Check your API key or billing)
        </div>
      )}

      {/* RESULTS + MAP */}
      <div className={styles.searchPageColumns}>
        <div className={styles.resultsContainer}>
          {loading
            ? <p>Loading listings...</p>
            : results.length === 0
              ? <p>No listings found for “{searchQuery}”.</p>
              : (
                <>
                  <div className={styles.listingsHeader}>
                    <h2>
                      {results.length}+ cars available
                      <span className={styles.subHeader}> • Sorted by relevance</span>
                    </h2>
                    <p className={styles.subText}>
                      These cars are located in and around {searchQuery}.
                    </p>
                  </div>
                  <div className={styles.listingsGrid}>
                    {results.map(result => {
                      const data = result.data;
                      return (
                        <div
                          key={data._id}
                          className={styles.listingCard}
                          onClick={() => navigate(`/details/${data._id}`)}
                        >
                          <div className={styles.imageWrapper}>
                            <img
                              src={
                                result.type === 'car'
                                  ? `${staticUrl}/${data.imageUrl}`
                                  : (data.images?.[0]
                                      ? `${staticUrl}/${data.images[0]}`
                                      : '/placeholder.jpg')
                              }
                              alt={result.type === 'car'
                                ? `${data.carMake} ${data.model}`
                                : data.title}
                              className={styles.cardImage}
                            />
                          </div>
                          <div className={styles.cardInfo}>
                            <h3 className={styles.carTitle}>
                              {result.type === 'car'
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
                      );
                    })}
                  </div>
                </>
              )
          }
        </div>

        <div className={styles.mapContainer}>
          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={mapZoom}
              onClick={handleCloseInfoWindow}
            >
              {results.map(result => {
                const data = result.data;
                if (!data.latitude || !data.longitude) return null;
                return (
                  <Marker
                    key={data._id}
                    position={{
                      lat: Number(data.latitude),
                      lng: Number(data.longitude)
                    }}
                    label={{
                      text: `£${parseFloat(data.pricePerDay).toFixed(0)}`,
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: '#000',
                      fillOpacity: 1,
                      strokeWeight: 0,
                      scale: 20,
                    }}
                    onClick={() => handleMarkerClick(data._id)}
                  >
                    {activeMarkerId === data._id && (
                      <InfoWindow onCloseClick={handleCloseInfoWindow}>
                        {renderInfoWindowContent(data, result.type)}
                      </InfoWindow>
                    )}
                  </Marker>
                );
              })}
            </GoogleMap>
          )}
        </div>
      </div>

      {/* SIDE MENU */}
      {sideMenuOpen && sideMenuComponent}
    </div>
  );
}
