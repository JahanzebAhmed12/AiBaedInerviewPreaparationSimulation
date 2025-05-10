import React from 'react';
import { FaCog, FaUserEdit, FaEnvelope, FaLock, FaSave } from 'react-icons/fa'; // Import icons
import './Settings.css';

const Settings = () => {
    return (
        <div>
            {/* Separate Heading Container */}
            <div className="settings-heading-container">
                <h2 className="settings-heading">
                    <span className="icon-wrapper"><FaCog /></span>
                    Settings
                </h2>
            </div>

            {/* Settings Section */}
            <div className="settings-section">
                <form>
                    <div className="form-group">
                        <label htmlFor="username">
                            <div className="icon-wrapper"><FaUserEdit /></div>
                            Username:
                        </label>
                        <input type="text" id="username" name="username" placeholder="Enter username" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">
                            <div className="icon-wrapper"><FaEnvelope /></div>
                            Email:
                        </label>
                        <input type="email" id="email" name="email" placeholder="Enter email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">
                            <div className="icon-wrapper"><FaLock /></div>
                            Password:
                        </label>
                        <input type="password" id="password" name="password" placeholder="Enter password" required />
                    </div>
                    <button type="submit" className="submit-btn">
                        <div className="icon-wrapper"><FaSave /></div>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
