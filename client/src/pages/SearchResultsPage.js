// client/src/pages/SearchResultsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Import side menus (adjust based on your project)
import SideMenu from '../components/SideMenu';
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuBusiness from '../components/SideMenuBusiness';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import styles from '../styles/SearchResultsPage.module.css';
import heroImage from '../assets/lambo.jpg'; // Use a relevant image if desired

// Set the container style for Google Map
const containerStyle = {
  width: '100%',
  height: '300px',
};

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = localStorage.getItem('accountType') || '';

  // Determine which side menu to use
  const sideMenuComponent = token 
    ? (accountType.toLowerCase() === 'customer' ? <SideMenuCustomer /> :
       accountType.toLowerCase() === 'business' ? <SideMenuBusiness /> :
       accountType.toLowerCase() === 'affiliate' ? <SideMenuAffiliate /> : <SideMenu />)
    : <SideMenu />;

  // Backend URL from environment (e.g. "https://hyre-backend.onrender.com/api")
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const staticUrl = backendUrl.replace('/api', ''); // Remove '/api' for static assets

  // States for search query, filters, and listings
  const [searchQuery, setSearchQuery] = useState('');
  const [carMakeFilter, setCarMakeFilter] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Google Maps with Places library
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Fetch listings from backend based on filters
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

  // When user clicks Search button, trigger fetch
  const handleSearch = () => {
    fetchListings(searchQuery, carMakeFilter);
  };

  // Set default map center based on first listing or fallback
  const mapCenter = listings.length > 0 
    ? { lat: listings[0].latitude, lng: listings[0].longitude }
    : { lat: 48.8566, lng: 2.3522 }; // Example: Paris coordinates

  if (loadError) return <div>Error loading Google Maps</div>;

  return (
    <div className={styles.container}>
      {/* Inline Header (matching the AboutHyre style) */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={() => {
          // Toggle side menu; if using inline state here or use a separate toggle function
          // For simplicity, assume side menu is always visible in desktop and togglable in mobile.
          // You can implement toggleMenu similar to your AboutHyre.js.
          // For now, we'll redirect to a side menu component if needed.
        }}>
          ☰
        </button>
      </header>

      {/* Side Menu */}
      <div className={styles.sideMenu}>
        {sideMenuComponent}
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Hero/Search Section */}
        <section
          className={styles.heroSection}
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          {/* Optional overlay – use CSS if needed */}
          <div className={styles.heroOverlay}></div>
          <div className={styles.heroText}>
            <h1>Search Cars</h1>
            <p>Find the perfect car near you</p>
          </div>
        </section>
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
            {/* Add more makes as needed */}
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
            <p>No listings found.</p>
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
