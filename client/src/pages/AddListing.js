// client/src/pages/AddListing.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import styles from '../styles/AddListing.module.css';

export default function AddListing() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = localStorage.getItem('accountType') || '';
  const isBusiness = token && accountType.toLowerCase() === 'business';

  if (!isBusiness) {
    alert('Please log in as a business to add a listing.');
    navigate('/');
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Listing fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [engineSize, setEngineSize] = useState('');
  const [transmission, setTransmission] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [availability, setAvailability] = useState('');
  const [terms, setTerms] = useState('');

  // Features (checkboxes)
  const [gps, setGps] = useState(false);
  const [bluetooth, setBluetooth] = useState(false);
  const [heatedSeats, setHeatedSeats] = useState(false);
  const [parkingSensors, setParkingSensors] = useState(false);
  const [backupCamera, setBackupCamera] = useState(false);
  const [appleCarPlay, setAppleCarPlay] = useState(false);
  const [androidAuto, setAndroidAuto] = useState(false);

  // Address autocomplete
  const [address, setAddress] = useState('');

  // Images (multiple)
  const [images, setImages] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // e.g. https://hyre-backend.onrender.com/api

  const handleImagesChange = (e) => {
    if (e.target.files) {
      setImages([...e.target.files]);
    }
  };

  // Handle address selection
  const handleSelectAddress = async (value) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      console.log('Selected address lat/lng:', latLng);
      // Optionally store latLng for further usage
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('make', make);
    formData.append('model', model);
    formData.append('year', year);
    formData.append('mileage', mileage);
    formData.append('fuelType', fuelType);
    formData.append('engineSize', engineSize);
    formData.append('transmission', transmission);
    formData.append('pricePerDay', pricePerDay);
    formData.append('availability', availability);
    formData.append('address', address);
    formData.append('terms', terms);

    formData.append('gps', gps);
    formData.append('bluetooth', bluetooth);
    formData.append('heatedSeats', heatedSeats);
    formData.append('parkingSensors', parkingSensors);
    formData.append('backupCamera', backupCamera);
    formData.append('appleCarPlay', appleCarPlay);
    formData.append('androidAuto', androidAuto);

    images.forEach((image) => {
      formData.append('images', image);
    });

    axios
      .post(`${backendUrl}/business/listings`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        alert('Listing created successfully!');
        navigate('/my-listings');
      })
      .catch((err) => {
        console.error('Error creating listing:', err);
        alert('Failed to create listing.');
      });
  };

  return (
    <div className={styles.addListingContainer}>
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
        <h2 className={styles.pageTitle}>Add New Listing</h2>

        <form className={styles.listingForm} onSubmit={handleSubmit}>
          {/* Upload Images */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className={styles.inputField}
            />
          </div>

          {/* Title & Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Enter listing title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textArea}
              placeholder="Enter listing description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Make, Model */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Make</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g., Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Model</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g., Corolla"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
          </div>

          {/* Year, Mileage */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Year</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="e.g., 2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mileage</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="e.g., 5000"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
          </div>

          {/* Fuel, Engine */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fuel Type</label>
              <select
                className={styles.inputField}
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Engine Size</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g., 1.5L"
                value={engineSize}
                onChange={(e) => setEngineSize(e.target.value)}
              />
            </div>
          </div>

          {/* Transmission */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Transmission</label>
            <select
              className={styles.inputField}
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
            >
              <option value="">Select transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>

          {/* Features */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Features</label>
            <div className={styles.featuresGrid}>
              <label>
                <input type="checkbox" checked={gps} onChange={() => setGps(!gps)} />
                GPS
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={bluetooth}
                  onChange={() => setBluetooth(!bluetooth)}
                />
                Bluetooth
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={heatedSeats}
                  onChange={() => setHeatedSeats(!heatedSeats)}
                />
                Heated Seats
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={parkingSensors}
                  onChange={() => setParkingSensors(!parkingSensors)}
                />
                Parking Sensors
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={backupCamera}
                  onChange={() => setBackupCamera(!backupCamera)}
                />
                Backup Camera
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={appleCarPlay}
                  onChange={() => setAppleCarPlay(!appleCarPlay)}
                />
                Apple CarPlay
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={androidAuto}
                  onChange={() => setAndroidAuto(!androidAuto)}
                />
                Android Auto
              </label>
            </div>
          </div>

          {/* Address Autocomplete */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Address</label>
            <PlacesAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={handleSelectAddress}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Enter address...',
                      className: styles.inputField,
                    })}
                  />
                  <div className={styles.suggestionsContainer}>
                    {loading && <div>Loading...</div>}
                    {suggestions.map((suggestion) => {
                      const style = suggestion.active
                        ? { backgroundColor: '#cce4ff', cursor: 'pointer' }
                        : { backgroundColor: '#fff', cursor: 'pointer' };
                      return (
                        <div
                          {...getSuggestionItemProps(suggestion, { style })}
                          key={suggestion.placeId}
                        >
                          {suggestion.description}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          </div>

          {/* Availability & Price */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Availability</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g., 2023-04-01 to 2023-04-10"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price per day</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="0"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Terms & Conditions</label>
            <textarea
              className={styles.textArea}
              placeholder="Enter any specific terms or conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Create Listing
          </button>
        </form>
      </div>
    </div>
  );
}
