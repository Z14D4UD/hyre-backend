// client/src/pages/SearchResultsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Side menu components (unchanged)
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

// Import our custom PlaceAutocomplete component for live suggestions
import PlaceAutocomplete from '../components/PlaceAutocomplete';

import styles from '../styles/SearchResultsPage.module.css';
import heroImage from '../assets/lambo.jpg';

// Define the container style for the Google Map
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Function to geocode a given address into coordinates using the Geocoder
async function geocodeAddress(address) {
  if (!window.google) return null;
  const geocoder = new window.google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        resolve({ lat, lng });
      } else {
        reject(status);
      }
    });
  });
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract the initial location and (optionally) latitude and longitude from query parameters
  const initialLocation = searchParams.get('location') || '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // State for the search query; this field uses PlaceAutocomplete
  const [searchQuery, setSearchQuery] = useState(initialLocation);

  // Listings from backend and map settings
  const [listings, setListings] = useState([]);
  const [mapCenter, setMapCenter] = useState(
    latParam && lngParam
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: 51.5074, lng: -0.1278 } // Default center (London)
  );
  const [mapZoom, setMapZoom] = useState(latParam && lngParam ? 14 : 12);
  const [loading, setLoading] = useState(false);

  // Additional filters (if any)
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [untilTime, setUntilTime] = useState('');
  const [price, setPrice] = useState(0);
  const [vehicleType, setVehicleType] = useState('');
  const [make, setMake] = useState('');
  const [year, setYear] = useState('');

  // Side menu toggle state
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // Define backend URL and derive a URL for static assets
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const staticUrl = backendUrl.replace('/api', '');

  // Function to fetch listings from the backend search endpoint
  const fetchListings = async (query) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/cars/search`, {
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
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      alert('Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  // On mount, if no lat/lng are present from query then geocode the initialLocation
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
    fetchListings(initialLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation, latParam, lngParam, isLoaded]);

  // When the user presses the search button in SearchResultsPage
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
    fetchListings(searchQuery);
  };

  // Callback when the user selects a suggestion from PlaceAutocomplete
  const handlePlaceSelect = (prediction) => {
    setSearchQuery(prediction.description);
  };

  // Side menu determination based on login information
  const token = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  let sideMenuComponent = (
    <SideMenu
      isOpen={sideMenuOpen}
      toggleMenu={() => setSideMenuOpen(false)}
      closeMenu={() => setSideMenuOpen(false)}
    />
  );
  if (token) {
    if (accountType === 'business') {
      sideMenuComponent = (
        <SideMenuBusiness
          isOpen={sideMenuOpen}
          toggleMenu={() => setSideMenuOpen(false)}
          closeMenu={() => setSideMenuOpen(false)}
        />
      );
    } else if (accountType === 'affiliate') {
      sideMenuComponent = (
        <SideMenuAffiliate
          isOpen={sideMenuOpen}
          toggleMenu={() => setSideMenuOpen(false)}
          closeMenu={() => setSideMenuOpen(false)}
        />
      );
    } else {
      sideMenuComponent = (
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
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={() => setSideMenuOpen(!sideMenuOpen)}>
          ☰
        </button>
      </header>

      <div className={styles.mainContent}>
        {/* HERO SECTION */}
        <section className={styles.heroSection} style={{ backgroundImage: `url(${heroImage})` }}>
          <div className={styles.heroOverlay}></div>

          {/* FIRST ROW: Location input with live suggestions and Date/Time fields */}
          <div className={styles.hyreTopRow}>
            <PlaceAutocomplete
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Where to?"
              hideDropdownOnInitial={true}  // Hide suggestions by default if not modified
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

          {/* SECOND ROW: Filters and Search button */}
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
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className={styles.selectInput}
              >
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
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className={styles.selectInput}
              >
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
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">All</option>
                {Array.from({ length: 2025 - 1950 + 1 }, (_, i) => 2025 - i).map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterInline}>
              <button className={styles.searchBtn} onClick={handleSearch}>
                Search
              </button>
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
        <div className={styles.resultsContainer}>
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length === 0 ? (
            <p>No listings found for "{searchQuery}".</p>
          ) : (
            listings.map((listing) => (
              <div
                key={listing._id}
                className={styles.listingCard}
                onClick={() => navigate(`/car/${listing._id}`)}
              >
                <img
                  src={`${staticUrl}/${listing.imageUrl}`}
                  alt={`${listing.carMake} ${listing.model}`}
                  className={styles.listingImage}
                />
                <div className={styles.listingInfo}>
                  <h3>{listing.carMake} {listing.model}</h3>
                  <p>{listing.location}</p>
                  <p>£{parseFloat(listing.pricePerDay).toFixed(2)}/day</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className={styles.mapContainer}>
          {isLoaded && (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={mapZoom}>
              {listings.map((listing) => (
                <Marker
                  key={listing._id}
                  position={{ lat: listing.latitude, lng: listing.longitude }}
                  title={`${listing.carMake} ${listing.model}`}
                  onClick={() => navigate(`/car/${listing._id}`)}
                />
              ))}
            </GoogleMap>
          )}
        </div>
      </div>

      {sideMenuOpen &&
        (() => {
          if (!token) return <SideMenu isOpen={sideMenuOpen} toggleMenu={() => setSideMenuOpen(false)} />;
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
        })()}
    </div>
  );
}
