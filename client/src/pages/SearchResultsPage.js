// client/src/pages/SearchResultsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Side menu components
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

// Our custom PlaceAutocomplete component
import PlaceAutocomplete from '../components/PlaceAutocomplete';

import styles from '../styles/SearchResultsPage.module.css';
import heroImage from '../assets/lambo.jpg';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

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

  const initialLocation = searchParams.get('location') || '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [results, setResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(
    latParam && lngParam
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: 51.5074, lng: -0.1278 }
  );
  const [mapZoom, setMapZoom] = useState(12);
  const [loading, setLoading] = useState(false);

  // Extra filters
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
  const staticUrl = backendUrl.replace('/api', '');

  // Use the "searchAll" endpoint to get merged results
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
        },
      });
      setResults(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      alert('Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((!latParam || !lngParam) && initialLocation && isLoaded && window.google) {
      geocodeAddress(initialLocation)
        .then((coords) => {
          setMapCenter(coords);
          setMapZoom(14);
        })
        .catch((err) => console.error('Geocode error:', err));
    } else if (latParam && lngParam) {
      setMapZoom(14);
    }
    fetchResults(initialLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation, latParam, lngParam, isLoaded]);

  const handleSearch = async () => {
    if (searchQuery && isLoaded && window.google) {
      try {
        const coords = await geocodeAddress(searchQuery);
        if (coords) {
          setMapCenter(coords);
          setMapZoom(14);
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

  // Choose which side menu component to render.
  const token = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  let sideMenuComponent = <SideMenu isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} />;
  if (token) {
    if (accountType === 'business') {
      sideMenuComponent = (<SideMenuBusiness isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} closeMenu={() => setSideMenuOpen(false)} />);
    } else if (accountType === 'affiliate') {
      sideMenuComponent = (<SideMenuAffiliate isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} closeMenu={() => setSideMenuOpen(false)} />);
    } else {
      sideMenuComponent = (<SideMenuCustomer isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} closeMenu={() => setSideMenuOpen(false)} />);
    }
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={() => setSideMenuOpen(!sideMenuOpen)}>☰</button>
      </header>

      <div className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.heroSection} style={{ backgroundImage: `url(${heroImage})` }}>
          <div className={styles.heroOverlay} />
          {/* FIRST ROW: Location and Date/Time */}
          <div className={styles.hyreTopRow}>
            <PlaceAutocomplete
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Where to?"
            />
            <div className={styles.hyreDateTime}>
              <label>From:</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
            </div>
            <div className={styles.hyreDateTime}>
              <label>Until:</label>
              <input type="date" value={untilDate} onChange={(e) => setUntilDate(e.target.value)} />
              <input type="time" value={untilTime} onChange={(e) => setUntilTime(e.target.value)} />
            </div>
          </div>

          {/* SECOND ROW: Additional Filters and Search Button */}
          <div className={styles.hyreBottomRow}>
            <div className={styles.filterInline}>
              <label>Price £0-£20,000 (Current: £{price})</label>
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
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className={styles.selectInput}>
                <option value="">All</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Pickup truck">Pickup truck</option>
                <option value="Minivan">Minivan</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
                <option value="Wagon">Wagon</option>
                <option value="Van">Van</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.filterInline}>
              <label>Make:</label>
              <select value={make} onChange={(e) => setMake(e.target.value)} className={styles.selectInput}>
                <option value="">All</option>
                <option value="Toyota">Toyota</option>
                <option value="Honda">Honda</option>
                <option value="Ford">Ford</option>
                <option value="BMW">BMW</option>
                <option value="Audi">Audi</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Chevrolet">Chevrolet</option>
                <option value="Nissan">Nissan</option>
                <option value="Volkswagen">Volkswagen</option>
                <option value="Kia">Kia</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Subaru">Subaru</option>
                <option value="Mazda">Mazda</option>
                <option value="Dodge">Dodge</option>
                <option value="Jeep">Jeep</option>
                <option value="Lexus">Lexus</option>
                <option value="Acura">Acura</option>
              </select>
            </div>
            <div className={styles.filterInline}>
              <label>Year:</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} className={styles.selectInput}>
                <option value="">All</option>
                {Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 2025 - i).map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
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

      <div className={styles.searchPageColumns}>
        {/* LISTINGS COLUMN */}
        <div className={styles.resultsContainer}>
          {loading ? (
            <p>Loading listings...</p>
          ) : results.length === 0 ? (
            <p>No listings found for "{searchQuery}".</p>
          ) : (
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
                {results.map((result) => {
                  const data = result.data;
                  return (
                    <div key={data._id} className={styles.listingCard} onClick={() => navigate(`/details/${data._id}`)}>
                      <div className={styles.imageWrapper}>
                        {result.type === 'car' ? (
                          <img
                            src={`${staticUrl}/${data.imageUrl}`}
                            alt={`${data.carMake} ${data.model}`}
                            className={styles.cardImage}
                          />
                        ) : (
                          <img
                            src={data.images && data.images.length > 0 ? `${staticUrl}/${data.images[0]}` : '/placeholder.jpg'}
                            alt={data.title}
                            className={styles.cardImage}
                          />
                        )}
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.carTitle}>
                          {result.type === 'car' ? `${data.carMake} ${data.model}` : data.title}
                        </h3>
                        <p className={styles.carLocation}>
                          {data.location ? data.location : data.address}
                        </p>
                        <p className={styles.price}>
                          £{result.type === 'car' 
                            ? parseFloat(data.pricePerDay).toFixed(2)
                            : parseFloat(data.pricePerDay).toFixed(2)
                          }/day
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* MAP COLUMN */}
        <div className={styles.mapContainer}>
          {isLoaded && (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={mapZoom}>
              {results.map((result) => {
                const data = result.data;
                // Render marker only if coordinates exist.
                if (!data.latitude || !data.longitude) return null;
                return (
                  <Marker
                    key={data._id}
                    position={{ lat: data.latitude, lng: data.longitude }}
                    title={result.type === 'car'
                      ? `${data.carMake} ${data.model}`
                      : data.title}
                    onClick={() => navigate(`/details/${data._id}`)}
                  />
                );
              })}
            </GoogleMap>
          )}
        </div>
      </div>

      {/* SIDE MENU */}
      {sideMenuOpen && (
        (() => {
          if (!token)
            return <SideMenu isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} />;
          if (accountType === 'business') {
            return (
              <SideMenuBusiness
                isOpen={sideMenuOpen}
                toggleMenu={() => setSideMenuOpen(false)}
                closeMenu={() => setSideMenuOpen(false)}
              />
            );
          }
          if (accountType === 'affiliate') {
            return (
              <SideMenuAffiliate
                isOpen={sideMenuOpen}
                toggleMenu={() => setSideMenuOpen(false)}
                closeMenu={() => setSideMenuOpen(false)}
              />
            );
          }
          return (
            <SideMenuCustomer
              isOpen={sideMenuOpen}
              toggleMenu={() => setSideMenuOpen(false)}
              closeMenu={() => setSideMenuOpen(false)}
            />
          );
        })()
      )}
    </div>
  );
}
