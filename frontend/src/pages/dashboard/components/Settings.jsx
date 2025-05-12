import React, { useState, useEffect } from 'react';
import { FaCog, FaUserEdit, FaBriefcase, FaGraduationCap, FaSave, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
    const [formData, setFormData] = useState({
        experience: '',
        designation: '',
        interview_field: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setMessage({
                        type: 'error',
                        text: 'Please login to access your profile'
                    });
                    return;
                }

                const response = await fetch('http://localhost:5000/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile data');
                }

                const data = await response.json();
                setFormData({
                    experience: data.experience || '',
                    designation: data.designation || '',
                    interview_field: data.interview_field || ''
                });
            } catch (error) {
                console.error('Profile fetch error:', error);
                setMessage({
                    type: 'error',
                    text: 'Unable to load profile data. Please try again later.'
                });
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any existing messages when user starts typing
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:5000/update_profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Profile updated successfully'
                });
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'An error occurred while updating profile'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="settings-section">
            <div className="settings-heading-container">
                <h2 className="settings-heading">
                    <span className="icon-wrapper"><FaCog /></span>
                    Profile Settings
                </h2>
            </div>

            <div className="settings-content">
                {message.text && (
                    <div className={`${message.type}-message`}>
                        {message.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
                        {message.text}
                    </div>
                )}

                <form className="settings-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="experience">
                            <div className="icon-wrapper"><FaBriefcase /></div>
                            Experience (in years)
                        </label>
                        <input
                            type="number"
                            id="experience"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="Enter your experience in years"
                            min="0"
                            max="50"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="designation">
                            <div className="icon-wrapper"><FaUserEdit /></div>
                            Designation
                        </label>
                        <input
                            type="text"
                            id="designation"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
                            placeholder="Enter your current designation"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="interview_field">
                            <div className="icon-wrapper"><FaGraduationCap /></div>
                            Interview Field
                        </label>
                        <select
                            id="interview_field"
                            name="interview_field"
                            value={formData.interview_field}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select your interview field</option>
                            <option value="Software Engineering">Software Engineering</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile Development">Mobile Development</option>
                            <option value="DevOps">DevOps</option>
                            <option value="Cloud Computing">Cloud Computing</option>
                            <option value="Cybersecurity">Cybersecurity</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        <div className="icon-wrapper"><FaSave /></div>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
