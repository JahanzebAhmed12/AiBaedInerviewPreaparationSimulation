// ProfilePopup.js
import React, { useState, useEffect } from 'react';
import './ProfilePopup.css';
import { FaSignOutAlt } from 'react-icons/fa';

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
        const token = localStorage.getItem('token'); // Get JWT token from localStorage

        if (!token) {
          alert('No token found, please login again');
          window.location.href = '/login'; // Redirect to login page
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
    onClose(); // Close the popup
    localStorage.removeItem('token'); // Clear the token from localStorage
    window.location.href = '/'; // Redirect to the landing page
  };

  return (
    <div className="profile-popup">
      <div className="popup-content">
        <h1>User Profile</h1>
        <p><strong>Name:</strong> {userData.name}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Experience Level:</strong> {userData.experience}</p>
        <p><strong>Designation:</strong> {userData.designation}</p>
        <p><strong>Field:</strong> {userData.interview_field}</p>
        
        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePopup;
