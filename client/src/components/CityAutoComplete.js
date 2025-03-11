import React, { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';

// Sample city data
const cityData = [
  'London',
  'Manchester',
  'Edinburgh',
  'Bristol',
  'Birmingham',
  'Liverpool',
  'Leeds',
  'Glasgow',
  'Cardiff',
  'Newcastle'
];

export default function CityAutocomplete({ city, setCity }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!city) {
      setSuggestions([]);
      return;
    }
    // Filter city data by typed input
    const filtered = cityData.filter((c) =>
      c.toLowerCase().includes(city.toLowerCase())
    );
    setSuggestions(filtered);
  }, [city]);

  const handleSelect = (selectedCity) => {
    setCity(selectedCity);
    setShowSuggestions(false);
  };

  return (
    <div className={styles.autoContainer}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="City, airport, address or hotel"
        value={city}
        onChange={(e) => {
          setCity(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((item) => (
            <li
              key={item}
              className={styles.suggestionItem}
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
