import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgressReport.css';
import { FaChartLine } from 'react-icons/fa';
import axios from 'axios';

const ProgressReport = () => {
    const [interviews, setInterviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get_interview_history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setInterviews(response.data);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        }
    };

    const handleDetailClick = (interviewId) => {
        navigate(`/interview-details/${interviewId}`);
    };

    return (
        <section id="progressReport" className="section">
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
                            <th>Score</th>
                            <th>Feedback</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {interviews.map((interview) => (
                            <tr key={interview.feedback_id}>
                                <td>{new Date(interview.created_at).toLocaleDateString()}</td>
                                <td>{interview.interview_field}</td>
                                <td>{interview.score}</td>
                                <td>{interview.feedback_text}</td>
                                <td>
                                    <button
                                        className="detail-btn"
                                        onClick={() => handleDetailClick(interview.interview_id)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default ProgressReport;
