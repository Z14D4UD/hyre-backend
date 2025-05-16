import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/BusinessPublic.module.css';   /* create or inline */

export default function BusinessPublicPage() {
  const { id } = useParams();
  const [biz, setBiz]         = useState(null);
  const [cars, setCars]       = useState([]);
  const backend = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    axios.get(`${backend}/public/business/${id}`)
      .then(({ data }) => {
        setBiz(data.business);
        setCars(data.listings);
      })
      .catch(err => console.error(err));
  }, [id, backend]);

  if (!biz) return <div>Loading…</div>;

  const joined = new Date(biz.createdAt).toLocaleString('default',
                   { month:'short', year:'numeric' });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src={`${backend}/${biz.avatarUrl}`} className={styles.avatar} alt="" />
        <div>
          <h1>{biz.name}</h1>
          <p>{biz.location}</p>
          <span>Joined {joined}</span>
        </div>
      </header>

      <section className={styles.verified}>
        <h3>Verified info</h3>
        <ul>
          <li>Approved to drive ✔︎</li>
          <li>Email address ✔︎</li>
          <li>Phone number ✔︎</li>
        </ul>
      </section>

      <section className={styles.vehicles}>
        <h2>{biz.name.split(' ')[0]}’s vehicles</h2>
        <div className={styles.grid}>
          {cars.map(car => (
            <Link key={car._id} to={`/listing/${car._id}`} className={styles.card}>
              <img src={`${backend}/${car.images[0]}`} alt="" />
              <div className={styles.cardBody}>
                <h4>{car.title}</h4>
                <span>{car.rating?.toFixed(2) || '0.0'} ★ ({car.trips || 0} trips)</span>
                <strong>£{car.pricePerDay}/day</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
