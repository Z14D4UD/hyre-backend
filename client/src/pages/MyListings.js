// client/src/pages/MyListings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/MyListings.module.css';

export default function MyListings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = localStorage.getItem('accountType') || '';
  const isBusiness = token && accountType.toLowerCase() === 'business';

  if (!isBusiness) {
    alert('Please log in as a business to view your listings.');
    navigate('/');
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [carTypeFilter, setCarTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Listings state fetched from the backend
  const [listings, setListings] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // e.g., "https://hyre-backend.onrender.com/api"

  // Fetch listings data for the logged-in business
  useEffect(() => {
    axios
      .get(`${backendUrl}/business/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setListings(res.data);
      })
      .catch((err) => {
        console.error('Error fetching listings:', err);
        alert('Failed to fetch listings.');
      });
  }, [backendUrl, token]);

  // Filter listings based on search and filters
  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCarType = carTypeFilter ? item.carType === carTypeFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesCarType && matchesStatus;
  });

  // Handlers for listing actions
  const handleSelect = (listingId) => {
    // Example: Navigate to a detailed view of the listing
    navigate(`/listing/${listingId}`);
  };

  const handleEdit = (listingId) => {
    // Navigate to an edit page for the listing
    navigate(`/edit-listing/${listingId}`);
  };

  const handleDelete = (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    axios
      .delete(`${backendUrl}/business/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Listing deleted successfully.');
        // Remove deleted listing from state
        setListings(listings.filter((item) => item._id !== listingId));
      })
      .catch((err) => {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing.');
      });
  };

  const handleAddUnit = () => {
    navigate('/add-listing');
  };

  return (
    <div className={styles.myListingsContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      {/* Side Menu */}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>My Listings</h1>

        {/* Top Bar: Search, Filters, Add Unit */}
        <div className={styles.topBar}>
          <input
            type="text"
            className={styles.searchBox}
            placeholder="Search listing title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className={styles.filterDropdown}
            value={carTypeFilter}
            onChange={(e) => setCarTypeFilter(e.target.value)}
          >
            <option value="">Car Type</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
          </select>
          <select
            className={styles.filterDropdown}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <button className={styles.addUnitButton} onClick={handleAddUnit}>
            Add Unit
          </button>
        </div>

        {/* Listings Table */}
        <div className={styles.listingsTable}>
          {filteredListings.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            filteredListings.map((listing) => (
              <div className={styles.listingRow} key={listing._id}>
                {/* Car Image */}
                <div className={styles.listingImage}>
                  <img src={listing.image} alt={listing.title} />
                </div>

                {/* Listing Details */}
                <div className={styles.listingDetails}>
                  <h3 className={styles.listingName}>{listing.title}</h3>
                  <div className={styles.listingBadges}>
                    {listing.carType && <span className={styles.badge}>{listing.carType}</span>}
                    {listing.transmission && <span className={styles.badge}>{listing.transmission}</span>}
                    {listing.status && <span className={styles.badge}>{listing.status}</span>}
                  </div>
                </div>

                {/* Price */}
                <div className={styles.listingPrice}>
                  <p>${listing.price}/day</p>
                </div>

                {/* Actions */}
                <div className={styles.listingActions}>
                  <button className={styles.selectBtn} onClick={() => handleSelect(listing._id)}>
                    Select
                  </button>
                  <button className={styles.editBtn} onClick={() => handleEdit(listing._id)}>
                    Edit
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(listing._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination (dummy for now) */}
        <div className={styles.pagination}>
          <p>Results per page</p>
          <select className={styles.pageSizeSelect}>
            <option>10</option>
            <option>20</option>
            <option>30</option>
          </select>
          <div className={styles.pageButtons}>
            <button className={styles.pageBtn}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span>...</span>
            <button className={styles.pageBtn}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
