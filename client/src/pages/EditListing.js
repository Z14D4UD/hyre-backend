// client/src/pages/EditListing.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from '../styles/AddListing.module.css';

// derive origin so we hit /uploads static (not /api/uploads)
const BACKEND_ORIGIN = process.env.REACT_APP_BACKEND_URL.split('/api')[0];

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const isBusiness = token && localStorage.getItem('accountType') === 'business';
  if (!isBusiness) {
    alert('Please log in as a business');
    navigate('/');
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(o => !o);

  // full form state including cancellationPolicy
  const [form, setForm] = useState({
    title: '', description: '', carType: '', make: '', model: '',
    year: '', mileage: '', fuelType: 'Petrol', engineSize: '',
    transmission: '', licensePlate: '', pricePerDay: '', terms: '',
    address: '', availableFrom: null, availableTo: null,
    gps: false, bluetooth: false, heatedSeats: false, parkingSensors: false,
    backupCamera: false, appleCarPlay: false, androidAuto: false,
    keylessEntry: false, childSeat: false, leatherSeats: false,
    tintedWindows: false, convertible: false, roofRack: false,
    petFriendly: false, smokeFree: false, seatCovers: false, dashCam: false,
    cancellationPolicy: ''
  });

  // images
  const [existingImages, setExistingImages] = useState([]); // ["uploads/…"]
  const [newFiles, setNewFiles] = useState([]);             // File[]

  // load listing
  useEffect(() => {
    axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/business/listings/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => {
      const lst = res.data;
      setForm({
        title: lst.title || '',
        description: lst.description || '',
        carType: lst.carType || '',
        make: lst.make || '',
        model: lst.model || '',
        year: lst.year || '',
        mileage: lst.mileage || '',
        fuelType: lst.fuelType || 'Petrol',
        engineSize: lst.engineSize || '',
        transmission: lst.transmission || '',
        licensePlate: lst.licensePlate || '',
        pricePerDay: lst.pricePerDay || '',
        terms: lst.terms || '',
        address: lst.address || '',
        availableFrom: lst.availableFrom ? new Date(lst.availableFrom) : null,
        availableTo: lst.availableTo ? new Date(lst.availableTo) : null,
        gps: lst.gps, bluetooth: lst.bluetooth, heatedSeats: lst.heatedSeats,
        parkingSensors: lst.parkingSensors, backupCamera: lst.backupCamera,
        appleCarPlay: lst.appleCarPlay, androidAuto: lst.androidAuto,
        keylessEntry: lst.keylessEntry, childSeat: lst.childSeat,
        leatherSeats: lst.leatherSeats, tintedWindows: lst.tintedWindows,
        convertible: lst.convertible, roofRack: lst.roofRack,
        petFriendly: lst.petFriendly, smokeFree: lst.smokeFree,
        seatCovers: lst.seatCovers, dashCam: lst.dashCam,
        cancellationPolicy: lst.cancellationPolicy || ''
      });
      setExistingImages(lst.images || []);
    }).catch(() => navigate('/my-listings'));
  }, [id, token, navigate]);

  // image handlers
  const handleRemoveExisting = idx =>
    setExistingImages(imgs => imgs.filter((_, i) => i !== idx));
  const handleNewFiles = e =>
    setNewFiles(f => [...f, ...Array.from(e.target.files)]);
  const handleRemoveNew = idx =>
    setNewFiles(f => f.filter((_, i) => i !== idx));

  // generic form change
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Places autocomplete select
  const handleSelectAddress = async value => {
    setForm(f => ({ ...f, address: value }));
    try {
      const results = await geocodeByAddress(value);
      await getLatLng(results[0]);
    } catch (err) {
      console.error('Error geocoding:', err);
    }
  };

  // submit
  const handleSubmit = e => {
    e.preventDefault();
    const data = new FormData();
    // append all form fields
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        data.append(k, v instanceof Date ? v.toISOString() : v);
      }
    });
    // tell server which existing to keep
    existingImages.forEach(path => data.append('keepImages[]', path));
    // new
    newFiles.forEach(file => data.append('images', file));

    axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/business/listings/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then(() => navigate('/my-listings'))
     .catch(err => {
       console.error('Error updating listing:', err);
       alert('Failed to save changes.');
     });
  };

  return (
    <div className={styles.addListingContainer}>
      {/* header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>Hyre</div>
        <button className={styles.menuIcon} onClick={toggleMenu}>☰</button>
      </header>

      <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={() => setMenuOpen(false)} />

      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Edit Listing</h1>

        {/* existing previews */}
        <div className={styles.imagePreviewGrid}>
          {existingImages.map((src, i) => (
            <div key={i} className={styles.imagePreviewWrapper}>
              <button
                type="button"
                className={styles.removeImageBtn}
                onClick={() => handleRemoveExisting(i)}
              >×</button>
              <img
                src={`${BACKEND_ORIGIN}/${src.replace(/^\/?/, '')}`}
                alt=""
                className={styles.imagePreview}
              />
            </div>
          ))}
          {newFiles.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={`new${i}`} className={styles.imagePreviewWrapper}>
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => handleRemoveNew(i)}
                >×</button>
                <img src={url} alt="" className={styles.imagePreview} />
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.uploadPhotosButton}
          onClick={() => document.getElementById('newImgs').click()}
        >Add Photos</button>
        <input
          id="newImgs"
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleNewFiles}
        />

        {/* form */}
        <form onSubmit={handleSubmit} className={styles.formContainer}>

          {/* Car Details */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Car Details</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>Title</label>
              <input
                name="title"
                className={styles.inputField}
                value={form.title}
                onChange={handleChange}
              />
            </div>
            {/* Make / Model */}
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>Make</label>
                <input
                  name="make"
                  className={styles.inputField}
                  value={form.make}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.subSection}>
                <label className={styles.label}>Model</label>
                <input
                  name="model"
                  className={styles.inputField}
                  value={form.model}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Year / Mileage */}
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>Year</label>
                <input
                  type="number"
                  name="year"
                  className={styles.inputField}
                  value={form.year}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.subSection}>
                <label className={styles.label}>Mileage</label>
                <input
                  type="number"
                  name="mileage"
                  className={styles.inputField}
                  value={form.mileage}
                  onChange={handleChange}
                />
              </div>
            </div>
            {/* Car Type / Fuel */}
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>Car Type</label>
                <input
                  name="carType"
                  className={styles.inputField}
                  value={form.carType}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.subSection}>
                <label className={styles.label}>Fuel Type</label>
                <select
                  name="fuelType"
                  className={styles.inputField}
                  value={form.fuelType}
                  onChange={handleChange}
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
              </div>
            </div>
            {/* Engine / Transmission */}
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>Engine Size</label>
                <input
                  name="engineSize"
                  className={styles.inputField}
                  value={form.engineSize}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.subSection}>
                <label className={styles.label}>Transmission</label>
                <select
                  name="transmission"
                  className={styles.inputField}
                  value={form.transmission}
                  onChange={handleChange}
                >
                  <option>Automatic</option>
                  <option>manual</option>
                </select>
              </div>
            </div>
            {/* License / Price */}
            <div className={styles.formRow}>
              <div className={styles.subSection}>
                <label className={styles.label}>License Plate</label>
                <input
                  name="licensePlate"
                  className={styles.inputField}
                  value={form.licensePlate}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.subSection}>
                <label className={styles.label}>Price Per Day</label>
                <input
                  type="number"
                  name="pricePerDay"
                  className={styles.inputField}
                  value={form.pricePerDay}
                  onChange={handleChange}
                />
              </div>
            </div>
          </details>

          {/* Availability Dates */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Availability Dates</summary>
            <div className={styles.subSection}>
              <label className={styles.label}>From</label>
              <DatePicker
                selected={form.availableFrom}
                onChange={date => setForm(f => ({ ...f, availableFrom: date }))}
                dateFormat="yyyy-MM-dd"
                className={styles.inputField}
              />
            </div>
            <div className={styles.subSection}>
              <label className={styles.label}>To</label>
              <DatePicker
                selected={form.availableTo}
                onChange={date => setForm(f => ({ ...f, availableTo: date }))}
                dateFormat="yyyy-MM-dd"
                className={styles.inputField}
              />
            </div>
          </details>

          {/* Features */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Features</summary>
            <div className={styles.featuresGrid}>
              {[
                'gps','bluetooth','heatedSeats','parkingSensors','backupCamera',
                'appleCarPlay','androidAuto','keylessEntry','childSeat','leatherSeats',
                'tintedWindows','convertible','roofRack','petFriendly','smokeFree',
                'seatCovers','dashCam'
              ].map(feat => (
                <label key={feat} className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    name={feat}
                    checked={form[feat]}
                    onChange={handleChange}
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
              <PlacesAutocomplete
                value={form.address}
                onChange={val => setForm(f => ({ ...f, address: val }))}
                onSelect={handleSelectAddress}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <>
                    <input
                      {...getInputProps({
                        placeholder: 'Enter address...',
                        className: styles.inputField
                      })}
                    />
                    <div className={styles.suggestionsContainer}>
                      {loading && <div>Loading…</div>}
                      {suggestions.map(s => (
                        <div
                          {...getSuggestionItemProps(s)}
                          key={s.placeId}
                        >
                          {s.description}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </PlacesAutocomplete>
            </div>
          </details>

          {/* Terms & Conditions */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Terms & Conditions</summary>
            <div className={styles.subSection}>
              <textarea
                name="terms"
                className={styles.textArea}
                value={form.terms}
                onChange={handleChange}
                placeholder="Any special terms…"
              />
            </div>
          </details>

          {/* Cancellation Policy */}
          <details className={styles.section} open>
            <summary className={styles.sectionHeading}>Cancellation Policy</summary>
            <div className={styles.subSection}>
              <textarea
                name="cancellationPolicy"
                className={styles.textArea}
                value={form.cancellationPolicy}
                onChange={handleChange}
                placeholder="Enter your cancellation policy…"
              />
            </div>
          </details>

          <button type="submit" className={styles.submitButton}>
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
