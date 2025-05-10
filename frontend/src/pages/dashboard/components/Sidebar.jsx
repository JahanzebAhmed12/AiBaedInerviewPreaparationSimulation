// Sidebar.js
import React, { useState } from 'react';
import './Sidebar.css';
import { FaPlayCircle, FaTachometerAlt, FaChartLine, FaCog, FaClipboardList, FaMedal } from 'react-icons/fa';
const Sidebar = ({ onNavigate }) => {
    const [activeSection, setActiveSection] = useState('dashboard'); // Default active section

    const handleNavClick = (section) => {
        setActiveSection(section);
        if (onNavigate) {
            onNavigate(section); // Call the navigation function passed from the parent
        }
    };

    return (
        <nav className="sidebar">
            <a 
                href="#" 
                className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`} 
                onClick={() => handleNavClick('dashboard')}
            >
                <FaTachometerAlt/>
                <span className="link-text">Dashboard</span>
            </a>
            <a 
                href="#" 
                className={`nav-link ${activeSection === 'startInterview' ? 'active' : ''}`} 
                onClick={() => handleNavClick('startInterview')}
            >
                <FaPlayCircle/>
                <span className="link-text">Start Interview</span>
            </a>
            <a 
                href="#preparation" 
                 className={`nav-link ${activeSection === 'preparation' ? 'active' : ''}`} 
                 onClick={() => handleNavClick('preparation')}
                >
                <FaClipboardList /> {/* Replaced the play circle icon with a clipboard list */}
                <span className="link-text">Preparation</span>
                </a>
            <a 
                href="#" 
                className={`nav-link ${activeSection === 'progressReport' ? 'active' : ''}`} 
                onClick={() => handleNavClick('progressReport')}
            >
                <FaChartLine/>
                <span className="link-text">Progress Report</span>
            </a>
            <a 
                href="#" 
                className={`nav-link ${activeSection === 'badges' ? 'active' : ''}`} 
                onClick={() => handleNavClick('badges')}
            >
                <FaMedal/>
                <span className="link-text">Badges</span>
            </a>
            <a 
                href="#" 
                className={`nav-link ${activeSection === 'settings' ? 'active' : ''}`} 
                onClick={() => handleNavClick('settings')}
            >
                <FaCog/>
                <span className="link-text">Settings</span>
            </a>
        </nav>
    );
};

export default Sidebar;
