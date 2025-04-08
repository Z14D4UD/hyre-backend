// client/src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Import both side menus
import SideMenuCustomer from '../components/SideMenuCustomer';
import SideMenuAffiliate from '../components/SideMenuAffiliate';

import styles from '../styles/Profile.module.css';

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const accountType = localStorage.getItem('accountType') || '';
  
  // Allow access for either 'customer' or 'affiliate'
  const isCustomer = token && accountType.toLowerCase() === 'customer';
  const isAffiliate = token && accountType.toLowerCase() === 'affiliate';
  const isLoggedIn = isCustomer || isAffiliate;

  // Redirect if neither is a customer nor an affiliate
  useEffect(() => {
    if (!isLoggedIn) {
      alert('Please log in as a customer or affiliate to view your profile.');
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Local edit fields
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAboutMe, setEditAboutMe] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Choose endpoint based on account type
  const profileEndpoint = isCustomer
    ? `${backendUrl}/customer/me`
    : `${backendUrl}/affiliate/me`;

  useEffect(() => {
    if (isLoggedIn) {
      axios
        .get(profileEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setEditName(res.data.name || '');
          setEditLocation(res.data.location || '');
          setEditAboutMe(res.data.aboutMe || '');
          setEditPhone(res.data.phoneNumber || '');
          setEditEmail(res.data.email || '');
        })
        .catch((err) => {
          console.error('Error fetching profile:', err);
          alert('Failed to load profile data.');
        });
    }
  }, [isLoggedIn, profileEndpoint, token]);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveProfile = () => {
    // For both affiliates and customers, use FormData so that file uploads work
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('location', editLocation);
    formData.append('aboutMe', editAboutMe);
    formData.append('phoneNumber', editPhone);
    formData.append('email', editEmail);

    // Always allow file upload regardless of account type
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    axios
      .put(profileEndpoint, formData, {
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
        console.error('Error updating profile:', err);
        alert('Failed to update profile.');
      });
  };

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

      {/* Side Menu: render affiliate side menu if affiliate, else customer side menu */}
      {isAffiliate ? (
        <SideMenuAffiliate
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      ) : (
        <SideMenuCustomer
          isOpen={menuOpen}
          toggleMenu={toggleMenu}
          closeMenu={closeMenu}
        />
      )}

      <div className={styles.profileContent}>
        <div className={styles.leftColumn}>
          <div className={styles.avatarWrapper}>
            {user.avatarUrl ? (
              <img
                src={`${backendUrl}/${user.avatarUrl}`}
                alt="User avatar"
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <span className={styles.avatarInitials}>
                  {user.name ? user.name.charAt(0) : 'U'}
                </span>
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            {!isEditing ? (
              <>
                <h2 className={styles.profileName}>{user.name}</h2>
                <p className={styles.joinedDate}>Joined {user.joinedDate}</p>
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

          <div className={styles.aboutSection}>
            <h3>About {user.name && user.name.split(' ')[0]}</h3>
            {!isEditing ? (
              <p className={styles.aboutText}>
                {user.aboutMe || 'Tell us a bit about yourself...'}
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
              <li>
                <strong>Approved to drive:</strong> {user.approvedToDrive ? 'Yes' : 'No'}
              </li>
            </ul>
          </div>

          <div className={styles.reviewsSection}>
            <h4>Reviews</h4>
            <p>No reviews yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
