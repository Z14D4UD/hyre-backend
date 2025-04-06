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

  // Listings state
  const [listings, setListings] = useState([]);
  
  // We'll derive the base URL for images by removing '/api' if present.
  const backendUrl = process.env.REACT_APP_BACKEND_URL; // e.g., "https://hyre-backend.onrender.com/api"
  const baseUrl = backendUrl.replace('/api', ''); // now "https://hyre-backend.onrender.com"

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

  // Pagination (only show if necessary)
  const pageSize = 10;
  const totalPages = Math.ceil(filteredListings.length / pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const displayedListings = filteredListings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelect = (listingId) => {
    alert(`Selected listing ID: ${listingId}`);
  };

  const handleEdit = (listingId) => {
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
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Side Menu */}
      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>My Listings</h1>

        {/* Top Bar */}
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
            <option value="Truck">Truck</option>
            <option value="Coupe">Coupe</option>
            <option value="Convertible">Convertible</option>
            <option value="Van">Van</option>
            <option value="Wagon">Wagon</option>
            <option value="Sports Car">Sports Car</option>
            <option value="Luxury">Luxury</option>
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
          {displayedListings.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            displayedListings.map((listing) => {
              // Use the baseUrl to build the correct image URL.
              const firstImage = listing.images && listing.images.length > 0
                ? `${baseUrl}/${listing.images[0]}`
                : '/default-car.jpg'; // Use a default image if none provided

              return (
                <div className={styles.listingRow} key={listing._id}>
                  {/* Car Image */}
                  <div className={styles.listingImage}>
                    <img src={firstImage} alt={listing.title} />
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
                    <p>${listing.pricePerDay}/day</p>
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
              );
            })
          )}
        </div>

        {/* Pagination: Only render if more than one page */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <p>Results per page</p>
            <select
              className={styles.pageSizeSelect}
              onChange={(e) => {
                // Adjust page size if needed and reset current page
                // For now, we keep it simple:
                setCurrentPage(1);
              }}
            >
              <option>10</option>
              <option>20</option>
              <option>30</option>
            </select>
            <div className={styles.pageButtons}>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`${styles.pageBtn} ${currentPage === index + 1 ? styles.activePage : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
