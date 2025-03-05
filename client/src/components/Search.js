import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Use the REACT_APP_BACKEND_URL environment variable
      const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/cars/search`, {
        params: { query }
      });
      setResults(data);
    } catch (error) {
      console.error(error);
      alert('Search failed');
    }
  };

  return (
    <div>
      <h2>Search Cars</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>
      <div>
        {results.length === 0 ? (
          <p>No cars found.</p>
        ) : (
          results.map((car) => (
            <div key={car._id}>
              <h3>{car.make} {car.model}</h3>
              <p>{car.type}</p>
              {/* You can add more details or links to a car details page */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
