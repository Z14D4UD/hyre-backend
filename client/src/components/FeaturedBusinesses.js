// client/src/components/FeaturedBusinesses.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.css';

export default function FeaturedBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/business/featured`);
        setBusinesses(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return <p>Loading featured businesses...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!businesses.length) return <p>No featured businesses available.</p>;

  return (
    <div className={styles.featuredGrid}>
      {businesses.map((b) => (
        <div key={b._id} className={styles.featuredCard}>
          <img
            src={b.image || 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={b.name}
            className={styles.featuredImage}
          />
          <div className={styles.featuredInfo}>
            <h4>{b.name}</h4>
            {b.description && <p>{b.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
