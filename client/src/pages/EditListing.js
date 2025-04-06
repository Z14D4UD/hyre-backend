// client/src/pages/EditListing.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/AddListing.module.css';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = localStorage.getItem('accountType') || '';
  const isBusiness = token && accountType.toLowerCase() === 'business';

  if (!isBusiness) {
    alert('Please log in as a business to edit a listing.');
    navigate('/');
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Listing fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [carType, setCarType] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [engineSize, setEngineSize] = useState('');
  const [transmission, setTransmission] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [price, setPrice] = useState('');
  const [terms, setTerms] = useState('');
  const [availableFrom, setAvailableFrom] = useState(null);
  const [availableTo, setAvailableTo] = useState(null);

  // Full features object
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

  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]); // New images to upload (optional)
  const [existingImages, setExistingImages] = useState([]); // Existing image URLs

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Fetch existing listing details
  useEffect(() => {
    axios
      .get(`${backendUrl}/business/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const listing = res.data;
        setTitle(listing.title || '');
        setDescription(listing.description || '');
        setCarType(listing.carType || '');
        setMake(listing.make || '');
        setModel(listing.model || '');
        setYear(listing.year || '');
        setMileage(listing.mileage || '');
        setFuelType(listing.fuelType || 'Petrol');
        setEngineSize(listing.engineSize || '');
        setTransmission(listing.transmission || '');
        setLicensePlate(listing.licensePlate || '');
        setPrice(listing.pricePerDay || '');
        setTerms(listing.terms || '');
        setAddress(listing.address || '');
        if (listing.availableFrom) setAvailableFrom(new Date(listing.availableFrom));
        if (listing.availableTo) setAvailableTo(new Date(listing.availableTo));
        // Update full features state from listing (if not provided, they remain false)
        setFeatures({
          gps: !!listing.gps,
          bluetooth: !!listing.bluetooth,
          heatedSeats: !!listing.heatedSeats,
          parkingSensors: !!listing.parkingSensors,
          backupCamera: !!listing.backupCamera,
          appleCarPlay: !!listing.appleCarPlay,
          androidAuto: !!listing.androidAuto,
          keylessEntry: !!listing.keylessEntry,
          childSeat: !!listing.childSeat,
          leatherSeats: !!listing.leatherSeats,
          tintedWindows: !!listing.tintedWindows,
          convertible: !!listing.convertible,
          roofRack: !!listing.roofRack,
          petFriendly: !!listing.petFriendly,
          smokeFree: !!listing.smokeFree,
          seatCovers: !!listing.seatCovers,
          dashCam: !!listing.dashCam,
        });
        // Set existing images if available
        setExistingImages(listing.images || []);
      })
      .catch((err) => {
        console.error('Error fetching listing:', err);
        alert('Failed to load listing data.');
        navigate('/my-listings');
      });
  }, [id, token, backendUrl, navigate]);

  // Toggle feature checkboxes
  const toggleFeature = (feat) => {
    setFeatures({ ...features, [feat]: !features[feat] });
  };

  // Handle address selection
  const handleSelectAddress = async (value) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      console.log('Selected address coords:', latLng);
    } catch (error) {
      console.error('Error fetching address details:', error);
    }
  };

  // Handle image selection for update (optional)
  const handleImagesChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
    }
  };

  // Delete listing handler
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      axios
        .delete(`${backendUrl}/business/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert('Listing deleted successfully.');
          navigate('/my-listings');
        })
        .catch((err) => {
          console.error('Error deleting listing:', err);
          alert('Failed to delete listing.');
        });
    }
  };

  // Submit the updated listing
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      alert('Please fill in required fields: Title and Address.');
      return;
    }
    const updatedData = {
      title,
      description,
      carType,
      make,
      model,
      year,
      mileage,
      fuelType,
      engineSize,
      transmission,
      licensePlate,
      pricePerDay: price,
      terms,
      address,
      availableFrom: availableFrom ? availableFrom.toISOString() : '',
      availableTo: availableTo ? availableTo.toISOString() : '',
      // Include all feature fields
      gps: features.gps,
      bluetooth: features.bluetooth,
      heatedSeats: features.heatedSeats,
      parkingSensors: features.parkingSensors,
      backupCamera: features.backupCamera,
      appleCarPlay: features.appleCarPlay,
      androidAuto: features.androidAuto,
      keylessEntry: features.keylessEntry,
      childSeat: features.childSeat,
      leatherSeats: features.leatherSeats,
      tintedWindows: features.tintedWindows,
      convertible: features.convertible,
      roofRack: features.roofRack,
      petFriendly: features.petFriendly,
      smokeFree: features.smokeFree,
      seatCovers: features.seatCovers,
      dashCam: features.dashCam,
    };

    axios
      .put(`${backendUrl}/business/listings/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        alert('Listing updated successfully!');
        navigate('/my-listings');
      })
      .catch((err) => {
        console.error('Error updating listing:', err);
        alert('Failed to update listing.');
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

      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />

      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Edit Listing</h1>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {/* Car Details */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Car Details</summary>
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
                <option value="Sports Car">Sports Car</option>
                <option value="Luxury">Luxury</option>
                <option value="Other">Other</option>
              </select>
            </div>
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

          {/* Availability Dates */}
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

          {/* Features */}
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

          {/* Address */}
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

          {/* Terms & Conditions */}
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
            Save Changes
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            style={{ marginLeft: '1rem' }}
          >
            Delete Listing
          </button>
        </form>

        {/* Display existing images */}
        {existingImages.length > 0 && (
          <div className={styles.imagePreviewGrid}>
            {existingImages.map((imgSrc, idx) => (
              <div key={idx} className={styles.imagePreviewWrapper}>
                <img src={`${backendUrl}/${imgSrc}`} alt={`Listing ${idx}`} className={styles.imagePreview} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
