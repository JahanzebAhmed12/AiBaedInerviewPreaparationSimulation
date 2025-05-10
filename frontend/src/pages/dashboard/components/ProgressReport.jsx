import React, { useState } from 'react';
import './ProgressReport.css';
import { FaChartLine } from 'react-icons/fa'; // Add this import

const ProgressReport = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [preparationDetails, setPreparationDetails] = useState('');

    const handleDetailClick = (details) => {
        setPreparationDetails(details);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <section id="progressReport" className="section" style={{ display: 'block' }}>
            <h2 className="progress-heading">
                <span className="icon-wrapper"><FaChartLine /></span>
                Progress Report
            </h2>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Field</th>
                            <th>Duration</th>
                            <th>Score</th>
                            <th>Feedback</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2024-09-01</td>
                            <td>Software Engineering</td>
                            <td>45 mins</td>
                            <td>85</td>
                            <td>Good performance.</td>
                            <td>
                                <button
                                    className="detail-btn"
                                    onClick={() => handleDetailClick('Details about Software Engineering preparation')}
                                >
                                    Detail
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Circular graph below the table */}
            <div className="circular-graph-container">
                <div className="circular-graph">
                    <svg viewBox="0 0 36 36" className="circular-svg">
                        <circle
                            className="circle-bg"
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke="#e6e6e6"
                            strokeWidth="3"
                        />
                        <circle
                            className="circle-fg"
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="transparent"
                            stroke="#1abc9c"
                            strokeWidth="3"
                            strokeDasharray="85, 100" // Adjust this value to control the progress percentage
                            strokeDashoffset="0"
                        />
                    </svg>
                    <div className="circular-text">85%</div>
                </div>
            </div>

            {/* Popup for preparation details */}
            {showPopup && (
                <div className="popup-container">
                    <div className="popup-content">
                        <h3>Preparation Details</h3>
                        <p>{preparationDetails}</p>
                        <button className="close-btn" onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProgressReport;
