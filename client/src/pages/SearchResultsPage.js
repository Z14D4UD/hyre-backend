// client/src/pages/SearchResultsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Import side menus
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import styles from '../styles/SearchResultsPage.module.css';
import heroImage from '../assets/lambo.jpg';

const containerStyle = {
  width: '100%',
  height: '300px',
};

// Geocode function (if needed for fallback geocoding)
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
  
  // Get search parameters from the URL
  const initialLocation = searchParams.get('location') || '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');

  // Set initial state using the query parameters
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [carMakeFilter, setCarMakeFilter] = useState('');
  const [listings, setListings] = useState([]);
  const [mapCenter, setMapCenter] = useState(
    latParam && lngParam
      ? { lat: parseFloat(latParam), lng: parseFloat(lngParam) }
      : { lat: 48.8566, lng: 2.3522 } // Default to Paris if no coordinates provided
  );
  const [loading, setLoading] = useState(false);

  // Determine side menu based on user login
  const token = localStorage.getItem('token') || '';
  const accountType = (localStorage.getItem('accountType') || '').toLowerCase();
  const sideMenuComponent = token
    ? accountType === 'customer'
      ? <SideMenuCustomer />
      : accountType === 'business'
      ? <SideMenuBusiness />
      : accountType === 'affiliate'
      ? <SideMenuAffiliate />
      : <SideMenu />
    : <SideMenu />;

  // Backend URL from env variables (assumes /api at the end)
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const staticUrl = backendUrl.replace('/api', ''); // Remove '/api' for static assets

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });
  if (loadError) return <div>Error loading Google Maps</div>;

  // Fetch matching listings from backend based on search query and filter
  const fetchListings = async (query, make) => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/cars/search`, {
        params: { query, make },
      });
      setListings(res.data);
    } catch (error) {
      console.error('Error fetching car listings:', error);
      alert('Failed to fetch car listings.');
    } finally {
      setLoading(false);
    }
  };

  // If initialLocation is provided but lat/lng are not in query params,
  // attempt to geocode and update the map center.
  useEffect(() => {
    if (initialLocation && (!latParam || !lngParam) && isLoaded && window.google) {
      geocodeAddress(initialLocation)
        .then((coords) => {
          setMapCenter(coords);
        })
        .catch((err) => console.error('Geocode error:', err));
    }
    // Always fetch listings on mount or if initialLocation changes:
    fetchListings(initialLocation, carMakeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocation, isLoaded]);

  // Manual search via search bar (if user changes filters)
  const handleSearch = async () => {
    // Optionally, geocode the searchQuery again if needed:
    if (searchQuery && isLoaded && window.google) {
      try {
        const coords = await geocodeAddress(searchQuery);
        setMapCenter(coords);
      } catch (err) {
        console.error('Geocode error:', err);
      }
    }
    fetchListings(searchQuery, carMakeFilter);
  };

  return (
    <div className={styles.container}>
      {/* Header (inline, matching AboutHyre style) */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={() => { /* Implement mobile menu toggle if needed */ }}>
          ☰
        </button>
      </header>

      {/* Side Menu */}
      <div className={styles.sideMenu}>
        {sideMenuComponent}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Hero Section */}
        <section
          className={styles.heroSection}
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroText}>
            <h1>Search Cars</h1>
            <p>Find the perfect car near you</p>
          </div>
        </section>

        {/* Search & Filter Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Enter location, postcode, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={carMakeFilter}
            onChange={(e) => setCarMakeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Makes</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Ford">Ford</option>
            <option value="BMW">BMW</option>
            <option value="Audi">Audi</option>
          </select>
          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div>

        {/* Google Map Section */}
        {isLoaded && listings.length > 0 && (
          <div className={styles.mapSection}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={12}
            >
              {listings.map((listing) => (
                <Marker
                  key={listing._id}
                  position={{ lat: listing.latitude, lng: listing.longitude }}
                  title={`${listing.carMake} ${listing.model}`}
                  onClick={() => navigate(`/car/${listing._id}`)}
                />
              ))}
            </GoogleMap>
          </div>
        )}

        {/* Listings Section */}
        <div className={styles.resultsSection}>
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length === 0 ? (
            <p>No listings found for "{searchQuery}".</p>
          ) : (
            <div className={styles.resultsGrid}>
              {listings.map((listing) => (
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
                    <p>${parseFloat(listing.pricePerDay).toFixed(2)}/day</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
