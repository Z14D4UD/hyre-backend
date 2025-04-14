// client/src/components/PlaceAutocomplete.jsx
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

export default function PlaceAutocomplete({
  value = '',
  onChange,
  onPlaceSelect,
  placeholder = 'Enter a location...'
}) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState([]);
  const [userHasChanged, setUserHasChanged] = useState(false);
  const initialValueRef = useRef(value);

  // Fetch suggestions from the new AutocompleteService
  const fetchPredictions = (input) => {
    if (!window.google || !window.google.maps?.places?.AutocompleteService) {
      setPredictions([]);
      return;
    }
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input }, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        setPredictions(results);
      } else {
        setPredictions([]);
      }
    });
  };

  // Decide whether to fetch predictions whenever inputValue changes
  useEffect(() => {
    // If user hasn't changed text yet & input = initial, skip showing dropdown
    if (!userHasChanged && inputValue.trim() === initialValueRef.current.trim()) {
      setPredictions([]);
      return;
    }
    fetchPredictions(inputValue);
  }, [inputValue, userHasChanged]);

  // Handle text changes
  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setInputValue(newVal);

    // Mark userHasChanged if they've deviated from the initial text
    if (!userHasChanged && newVal.trim() !== initialValueRef.current.trim()) {
      setUserHasChanged(true);
    }
    if (onChange) onChange(e);
  };

  // Handle selecting a suggestion from the list
  const handleSelect = (prediction) => {
    setInputValue(prediction.description);
    setPredictions([]);
    setUserHasChanged(true); // definitely changed
    if (onPlaceSelect) onPlaceSelect(prediction);
  };

  // Handle blur: close dropdown after a short delay so user can click a suggestion
  const handleBlur = () => {
    setTimeout(() => {
      setPredictions([]);
    }, 150);
  };

  // Handle keydown: if user presses Enter in the input, close predictions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPredictions([]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{ color: '#000' }} // ensure black text visibility
      />
      {predictions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#fff',
            color: '#000',
            border: '1px solid #ccc',
            borderRadius: '0 0 16px 16px'
          }}
        >
          <ul
            style={{
              margin: 0,
              padding: '0.5rem 0',
              maxHeight: '200px',
              overflowY: 'auto',
              listStyle: 'none'
            }}
          >
            {predictions.map((p) => (
              <li
                key={p.place_id}
                onMouseDown={() => handleSelect(p)} // use onMouseDown so blur doesn't close it prematurely
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
              >
                {p.description}
              </li>
            ))}
          </ul>
          <div
            style={{
              textAlign: 'right',
              fontSize: '0.8rem',
              color: '#666',
              marginTop: '2px',
              paddingRight: '1rem'
            }}
          >
            {/* e.g. "Powered by Google" if needed */}
          </div>
        </div>
      )}
    </div>
  );
}
