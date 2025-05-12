// ProfilePopup.js
import React, { useState, useEffect } from 'react';
import './ProfilePopup.css';
import { FaSignOutAlt, FaUser, FaEnvelope, FaBriefcase, FaUserTie, FaCode } from 'react-icons/fa';

const ProfilePopup = ({ onClose }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    experience: '',
    designation: '',
    interview_field: '',
  });

  useEffect(() => {
    // Fetch user profile data when the component mounts
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          alert('No token found, please login again');
          window.location.href = '/login';
          return;
        }

        const response = await fetch('http://localhost:5000/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData({
            name: data.name,
            email: data.email,
            experience: data.experience,
            designation: data.designation,
            interview_field: data.interview_field,
          });
        } else {
          alert(data.msg);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        alert('An error occurred. Please try again.');
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    alert('Logged out successfully!');
    onClose();
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="profile-popup">
      <div className="popup-content">
        <h1>User Profile</h1>
        <div className="profile-info">
          <p>
            <strong><FaUser /> Name</strong>
            <span>{userData.name}</span>
          </p>
          <p>
            <strong><FaEnvelope /> Email</strong>
            <span>{userData.email}</span>
          </p>
          <p>
            <strong><FaBriefcase /> Experience</strong>
            <span>{userData.experience}</span>
          </p>
          <p>
            <strong><FaUserTie /> Designation</strong>
            <span>{userData.designation}</span>
          </p>
          <p>
            <strong><FaCode /> Field</strong>
            <span>{userData.interview_field}</span>
          </p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePopup;
