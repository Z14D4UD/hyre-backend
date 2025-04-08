// client/src/components/LocationAutocomplete.js
import React, { useState, useEffect, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Home.module.css';

const libraries = ['places'];

export default function LocationAutocomplete({ location, setLocation }) {
  const { t } = useTranslation();
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  console.log("Google Maps API Key:", process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

  useEffect(() => {
    if (isLoaded && !autocomplete && inputRef.current) {
      const auto = new window.google.maps.places.Autocomplete(inputRef.current, {
        // Removed types property to allow for results beyond cities.
        // componentRestrictions: { country: 'ae' } // Optionally remove or keep if needed.
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

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading Google Maps...</p>;

  const handleChange = (e) => {
    setLocation(e.target.value);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      className={styles.searchInput}
      placeholder={t('home.hero.searchPlaceholder')}
      value={location}
      onChange={handleChange}
      aria-label={t('home.hero.searchPlaceholder')}
    />
  );
}
