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

  // Build API base from REACT_APP_BACKEND_URL
  const rawBackend = process.env.REACT_APP_BACKEND_URL || '';
  const apiBase = rawBackend.endsWith('/api')
    ? rawBackend
    : rawBackend.replace(/\/$/, '') + '/api';

  // Fetch listings
  useEffect(() => {
    axios
      .get(`${apiBase}/business/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setListings(res.data))
      .catch(err => {
        console.error('Error fetching listings:', err);
        alert('Failed to fetch listings.');
      });
  }, [apiBase, token]);

  // Filter logic
  const filtered = listings.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) &&
      (carTypeFilter ? item.carType === carTypeFilter : true) &&
      (statusFilter ? item.status === statusFilter : true)
    );
  });

  // Pagination
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const shown = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    axios
      .delete(`${apiBase}/business/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setListings(lst => lst.filter(l => l._id !== id));
        alert('Deleted successfully.');
      })
      .catch(err => {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing.');
      });
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

        {/* Top Bar */}
        <div className={styles.topBar}>
          <input
            type="text"
            className={styles.searchBox}
            placeholder="Search listing title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            className={styles.filterDropdown}
            value={carTypeFilter}
            onChange={e => setCarTypeFilter(e.target.value)}
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
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <button className={styles.addUnitButton} onClick={() => navigate('/add-listing')}>
            Add Unit
          </button>
        </div>

        {/* Listings */}
        <div className={styles.listingsTable}>
          {shown.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            shown.map(l => {
              // build fully-qualified URL into your API's /uploads static route
              const imgFilename = l.images && l.images.length
                ? l.images[0].split('/').pop()
                : null;
              const imgSrc = imgFilename
                ? `${apiBase}/uploads/${imgFilename}`
                : '/default-car.jpg';

              return (
                <div className={styles.listingRow} key={l._id}>
                  <div className={styles.listingImage}>
                    <img src={imgSrc} alt={l.title} />
                  </div>
                  <div className={styles.listingDetails}>
                    <h3 className={styles.listingName}>{l.title}</h3>
                    <div className={styles.listingBadges}>
                      {l.carType && <span className={styles.badge}>{l.carType}</span>}
                      {l.transmission && <span className={styles.badge}>{l.transmission}</span>}
                      {l.status && <span className={styles.badge}>{l.status}</span>}
                    </div>
                  </div>
                  <div className={styles.listingPrice}>
                    <p>£{l.pricePerDay}/day</p>
                  </div>
                  <div className={styles.listingActions}>
                    <button
                      className={styles.selectBtn}
                      onClick={() => alert(`Selected ${l._id}`)}
                    >
                      Select
                    </button>
                    <button
                      className={styles.editBtn}
                      onClick={() => navigate(`/edit-listing/${l._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(l._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? styles.activePage : ''}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
