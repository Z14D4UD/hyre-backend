// client/src/pages/BusinessProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenuBusiness from '../components/SideMenuBusiness';
import styles from '../styles/Profile.module.css';

export default function BusinessProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = localStorage.getItem('accountType') || '';
  const isBusiness = token && accountType.toLowerCase() === 'business';

  // Redirect if not logged in as business
  useEffect(() => {
    if (!isBusiness) {
      alert('Please log in as a business to view your profile.');
      navigate('/');
    }
  }, [isBusiness, navigate]);

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  // Business user object from the server
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fields for editing
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAboutMe, setEditAboutMe] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL; // e.g., https://hyre-backend.onrender.com/api

  // Fetch the current business user’s profile
  useEffect(() => {
    if (!isBusiness) return;
    axios
      .get(`${backendUrl}/business/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        // Initialize edit fields
        setEditName(res.data.name || '');
        setEditLocation(res.data.location || '');
        setEditAboutMe(res.data.aboutMe || '');
        setEditPhone(res.data.phoneNumber || '');
        setEditEmail(res.data.email || '');
      })
      .catch((err) => {
        console.error('Error fetching business profile:', err);
        alert('Failed to load business profile data.');
      });
  }, [isBusiness, token, backendUrl]);

  // Fetch reviews from the backend
  useEffect(() => {
    if (!isBusiness) return;
    axios
      .get(`${backendUrl}/business-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReviews(res.data);
      })
      .catch((err) => {
        console.error('Error fetching reviews:', err);
      });
  }, [backendUrl, token, isBusiness]);

  // Handle avatar changes
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  // Save updated profile
  const handleSaveProfile = () => {
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('location', editLocation);
    formData.append('aboutMe', editAboutMe);
    formData.append('phoneNumber', editPhone);
    formData.append('email', editEmail);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    axios
      .put(`${backendUrl}/business/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setUser(res.data);
        setIsEditing(false);
        alert('Profile updated successfully.');
        setAvatarFile(null);
      })
      .catch((err) => {
        console.error('Error updating business profile:', err);
        alert('Failed to update business profile.');
      });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditName(user.name || '');
      setEditLocation(user.location || '');
      setEditAboutMe(user.aboutMe || '');
      setEditPhone(user.phoneNumber || '');
      setEditEmail(user.email || '');
    }
    setAvatarFile(null);
  };

  if (!user) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  // Determine joined date using createdAt timestamp
  const joinedDate = user.joinedDate || (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A');

  return (
    <div className={styles.profileContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          Hyre
        </div>
        <button className={styles.menuIcon} onClick={toggleMenu}>
          ☰
        </button>
      </header>

      {/* Side Menu for business users */}
      {isBusiness && (
        <SideMenuBusiness isOpen={menuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      )}

      <div className={styles.profileContent}>
        {/* Left Column: Avatar + Basic Info */}
        <div className={styles.leftColumn}>
          <div className={styles.avatarWrapper}>
            {user.avatarUrl ? (
              <img
                src={`${backendUrl}/${user.avatarUrl}`}
                alt="Business avatar"
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <span className={styles.avatarInitials}>
                  {user.name ? user.name.charAt(0) : 'B'}
                </span>
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            {!isEditing ? (
              <>
                <h2 className={styles.profileName}>{user.name}</h2>
                <p className={styles.joinedDate}>Joined {joinedDate}</p>
                <p className={styles.location}>{user.location}</p>
              </>
            ) : (
              <div className={styles.editFields}>
                <label>Name</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <label>Location</label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                />
                <label>Change Avatar</label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile, About, Contact Info, Reviews */}
        <div className={styles.rightColumn}>
          <div className={styles.editProfileRow}>
            {!isEditing ? (
              <button className={styles.editProfileBtn} onClick={() => setIsEditing(true)}>
                Edit profile
              </button>
            ) : (
              <>
                <button className={styles.saveProfileBtn} onClick={handleSaveProfile}>
                  Save profile
                </button>
                <button className={styles.cancelProfileBtn} onClick={handleCancelEdit}>
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* About Section */}
          <div className={styles.aboutSection}>
            <h3>About {user.name && user.name.split(' ')[0]}</h3>
            {!isEditing ? (
              <p className={styles.aboutText}>
                {user.aboutMe || 'Tell us about your business...'}
              </p>
            ) : (
              <>
                <label>About You</label>
                <textarea
                  className={styles.textArea}
                  value={editAboutMe}
                  onChange={(e) => setEditAboutMe(e.target.value)}
                />
              </>
            )}
          </div>

          {/* Contact Info */}
          <div className={styles.verificationSection}>
            <h4>Contact Info</h4>
            <ul>
              <li>
                <strong>Email:</strong>{' '}
                {!isEditing ? (
                  user.email
                ) : (
                  <input
                    type="email"
                    className={styles.inputField}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                )}
              </li>
              <li>
                <strong>Phone number:</strong>{' '}
                {!isEditing ? (
                  user.phoneNumber || 'Not provided'
                ) : (
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                )}
              </li>
            </ul>
          </div>

          {/* Reviews Section */}
          <div className={styles.reviewsSection}>
            <h4>Reviews From Clients</h4>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review, idx) => (
                <div key={idx} className={styles.reviewItem}>
                  <strong>Rating:</strong> {review.rating} <br />
                  <p>{review.comment}</p>
                  <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
