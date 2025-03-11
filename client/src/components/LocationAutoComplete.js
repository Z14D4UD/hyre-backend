import React, { useState, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import styles from '../styles/Home.module.css';

const libraries = ['places'];

export default function LocationAutocomplete({ location, setLocation }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    if (isLoaded && !autocomplete && inputRef.current) {
      const auto = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        componentRestrictions: { country: 'uk' },
      });
      auto.addListener('place_changed', () => {
        const place = auto.getPlace();
        if (place && place.formatted_address) {
          setLocation(place.formatted_address);
        } else if (place && place.name) {
          setLocation(place.name);
        }
      });
      setAutocomplete(auto);
    }
  }, [isLoaded, autocomplete, setLocation]);

  const handleChange = (e) => {
    setLocation(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className={styles.searchInput}
      placeholder="City, airport, address or hotel"
      value={location}
      onChange={handleChange}
    />
  );
}
