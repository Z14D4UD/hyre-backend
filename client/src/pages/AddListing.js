// client/src/pages/AddListing.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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

  // Side menu state
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
  const [licensePlate, setLicensePlate] = useState('');
  const [price, setPrice] = useState('');
  const [carType, setCarType] = useState(''); // new state for car type
  const [terms, setTerms] = useState('');

  // Date pickers for availability
  const [availableFrom, setAvailableFrom] = useState(null);
  const [availableTo, setAvailableTo] = useState(null);

  // Features
  const [features, setFeatures] = useState({
    gps: false,
    bluetooth: false,
    heatedSeats: false,
    parkingSensors: false,
    backupCamera: false,
    appleCarPlay: false,
    androidAuto: false,
    keylessEntry: false,
    childSeat: false,
    leatherSeats: false,
    tintedWindows: false,
    convertible: false,
    roofRack: false,
    petFriendly: false,
    smokeFree: false,
    seatCovers: false,
    dashCam: false,
  });

  // Address
  const [address, setAddress] = useState('');

  // Images (multiple) and local preview
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // e.g., "https://hyre-backend.onrender.com/api"

  // Handle file selection & preview
  const handleImagesChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  // "Upload Photos" button handler (for UI confirmation)
  const handleUploadPhotos = () => {
    if (!images.length) {
      alert('No images selected.');
      return;
    }
    alert('Photos are selected and previewed below.');
  };

  // Toggle feature checkboxes
  const toggleFeature = (feat) => {
    setFeatures({ ...features, [feat]: !features[feat] });
  };

  // Handle address selection from autocomplete
  const handleSelectAddress = async (value) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      console.log('Selected address coordinates:', latLng);
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };

  // Frontend validation and form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      alert('Please fill in all required fields: Title and Address.');
      return;
    }
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
    formData.append('licensePlate', licensePlate);
    formData.append('pricePerDay', price);
    formData.append('carType', carType); // new field for car type
    formData.append('terms', terms);
    formData.append('address', address);
    formData.append('availableFrom', availableFrom ? availableFrom.toISOString() : '');
    formData.append('availableTo', availableTo ? availableTo.toISOString() : '');

    Object.keys(features).forEach((feat) => {
      formData.append(feat, features[feat]);
    });

    images.forEach((file) => {
      formData.append('images', file);
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

      {/* Main Content */}
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>List Your Car</h1>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {/* Section 1: Vehicle Photos */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Vehicle Photos</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>Upload Images</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                className={styles.inputField}
              />
              <button
                type="button"
                onClick={handleUploadPhotos}
                className={styles.uploadPhotosButton}
              >
                Upload Photos
              </button>
            </div>
            {previewImages.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {previewImages.map((src, idx) => (
                  <div key={idx} className={styles.imagePreviewWrapper}>
                    <img src={src} alt={`Preview ${idx}`} className={styles.imagePreview} />
                  </div>
                ))}
              </div>
            )}
          </details>

          {/* Section 2: Basic Details */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Basic Details</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>Title*</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter listing title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className={styles.subSection}>
              <label className={styles.label}>Description</label>
              <textarea
                className={styles.textArea}
                placeholder="Describe your car..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </details>

          {/* Section 3: Availability Dates */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Availability Dates</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>Available From</label>
              <DatePicker
                selected={availableFrom}
                onChange={(date) => setAvailableFrom(date)}
                dateFormat="yyyy-MM-dd"
                className={styles.inputField}
                placeholderText="Select start date"
              />
            </div>
            <div className={styles.subSection}>
              <label className={styles.label}>Available To</label>
              <DatePicker
                selected={availableTo}
                onChange={(date) => setAvailableTo(date)}
                dateFormat="yyyy-MM-dd"
                className={styles.inputField}
                placeholderText="Select end date"
              />
            </div>
          </details>

          {/* Section 4: Car Details */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Car Details</summary>
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>Make</label>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g., Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </div>
              <div className={styles.subSection}>
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
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>Year</label>
                <input
                  type="number"
                  className={styles.inputField}
                  placeholder="e.g., 2023"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className={styles.subSection}>
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
            <div className={styles.formRow}>
              <div className={styles.subSection}>
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
              <div className={styles.subSection}>
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

            <div className={styles.subSection}>
              <label className={styles.label}>Transmission</label>
              <select
                className={styles.inputField}
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="">Select transmission</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div className={styles.subSection}>
              <label className={styles.label}>Car Type</label>
              <select
                className={styles.inputField}
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
              >
                <option value="">Select car type</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Pickup">Pickup</option>
                <option value="Van">Van</option>
                <option value="Wagon">Wagon</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className={styles.subSection}>
              <label className={styles.label}>License Plate</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Enter license plate number"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
            </div>
            <div className={styles.subSection}>
              <label className={styles.label}>Listing Price (per day)</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="e.g., 50"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </details>

          {/* Section 5: Features */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Features</summary>
            <div className={styles.featuresGrid}>
              {Object.keys(features).map((feat) => (
                <label key={feat}>
                  <input
                    type="checkbox"
                    checked={features[feat]}
                    onChange={() => toggleFeature(feat)}
                  />
                  {feat.charAt(0).toUpperCase() + feat.slice(1)}
                </label>
              ))}
            </div>
          </details>

          {/* Section 6: Address */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Address</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>Enter Address*</label>
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
                          ? { backgroundColor: '#cce4ff', cursor: 'pointer', padding: '0.5rem' }
                          : { backgroundColor: '#fff', cursor: 'pointer', padding: '0.5rem' };
                        return (
                          <div {...getSuggestionItemProps(suggestion, { style })} key={suggestion.placeId}>
                            {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </div>
          </details>

          {/* Section 7: Safety & Quality Standards */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Safety & Quality Standards</summary>
            <p className={styles.infoText}>
              Please confirm that your vehicle meets all local safety and quality regulations.
            </p>
            <label className={styles.checkboxRow}>
              <input type="checkbox" required />
              I confirm my vehicle complies with all safety standards.
            </label>
          </details>

          {/* Section 8: Terms & Conditions */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Terms & Conditions</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>Enter Terms & Conditions</label>
              <textarea
                className={styles.textArea}
                placeholder="Enter any specific terms or conditions..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>
          </details>

          <button type="submit" className={styles.submitButton}>
            Agree & List
          </button>
        </form>
      </div>
    </div>
  );
}
