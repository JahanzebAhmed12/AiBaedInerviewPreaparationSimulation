import React, { useState } from 'react';
import './Header.css';
import ProfilePopup from './ProfilePopup';  // Updated import to ProfilePopup
import { FaRobot, FaUser } from 'react-icons/fa';

const Header = () => {
    const [isPopupOpen, setPopupOpen] = useState(false);

    // Toggle the popup visibility
    const togglePopup = () => {
        setPopupOpen(!isPopupOpen);
    };

    return (
        <>
            <header>
                <div className="logo">
                    <div className='logo_picture'> <FaRobot/></div>
                    <h1>AI Interview Prep</h1>
                </div>
                {/* Profile Button to open Profile Popup */}
                <button onClick={togglePopup} className="profile-btn">
                  <div className='profile-pic'> <FaUser/></div> Profile
                </button>
                {/* Profile Popup with Logout Button inside */}
                {isPopupOpen && <ProfilePopup onClose={togglePopup} />}
            </header>

        
        </>
    );
};

export default Header;
