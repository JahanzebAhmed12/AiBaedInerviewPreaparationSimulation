import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterviewDetails.css';

const InterviewDetails = () => {
    const [interviewData, setInterviewData] = useState(null);
    const [responses, setResponses] = useState([]);
    const [error, setError] = useState(null);
    const { interviewId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to view interview details');
            navigate('/login');
            return;
        }
        fetchInterviewDetails();
    }, [interviewId]);

    const fetchInterviewDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view interview details');
                navigate('/login');
                return;
            }

            // Fetch interview feedback
            const feedbackResponse = await axios.get(`http://localhost:5000/get_interview_feedback/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Parse the JSON strings safely
            const feedbackData = feedbackResponse.data;
            console.log('Raw feedback data:', feedbackData); // Debug log
            
            try {
                // Handle both string and array formats
                feedbackData.strengths = typeof feedbackData.strengths === 'string' 
                    ? JSON.parse(feedbackData.strengths || '[]')
                    : (Array.isArray(feedbackData.strengths) ? feedbackData.strengths : []);
                
                feedbackData.areas_to_improve = typeof feedbackData.areas_to_improve === 'string'
                    ? JSON.parse(feedbackData.areas_to_improve || '[]')
                    : (Array.isArray(feedbackData.areas_to_improve) ? feedbackData.areas_to_improve : []);
                
                console.log('Parsed strengths:', feedbackData.strengths); // Debug log
                console.log('Parsed areas_to_improve:', feedbackData.areas_to_improve); // Debug log
            } catch (parseError) {
                console.error('Error parsing feedback data:', parseError);
                feedbackData.strengths = [];
                feedbackData.areas_to_improve = [];
            }
            
            setInterviewData(feedbackData);

            // Fetch interview responses
            const responsesResponse = await axios.get(`http://localhost:5000/get_interview_responses/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setResponses(responsesResponse.data || []);
        } catch (error) {
            console.error('Error fetching interview details:', error);
            if (error.response?.status === 401) {
                setError('Your session has expired. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                setError('Failed to load interview details. Please try again later.');
            }
        }
    };

    const handleBack = () => {
        navigate('/progress-report');
    };

    if (error) {
        return (
            <div className="interview-details">
                <div className="error-message">{error}</div>
                <button className="back-button" onClick={handleBack}>
                    ← Back to Progress Report
                </button>
            </div>
        );
    }

    if (!interviewData) {
        return <div className="interview-details">Loading...</div>;
    }

    return (
        <div className="interview-details">
            <button className="back-button" onClick={handleBack}>
                ← Back to Progress Report
            </button>

            <div className="interview-summary">
                <h2>Interview Summary</h2>
                <div className="summary-grid">
                    <div className="summary-item">
                        <label>Field:</label>
                        <span>{interviewData.interview_field}</span>
                    </div>
                    <div className="summary-item">
                        <label>Score:</label>
                        <span>{interviewData.score}</span>
                    </div>
                    <div className="summary-item">
                        <label>Date:</label>
                        <span>{new Date(interviewData.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="feedback-section">
                <h3>Feedback</h3>
                <div className="feedback-grid">
                    <div className="feedback-item">
                        <h4>Strengths</h4>
                        <ul>
                            {Array.isArray(interviewData.strengths) && interviewData.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="feedback-item">
                        <h4>Areas to Improve</h4>
                        <ul>
                            {Array.isArray(interviewData.areas_to_improve) && interviewData.areas_to_improve.map((area, index) => (
                                <li key={index}>{area}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="feedback-text">
                    <h4>Overall Feedback</h4>
                    <p>{interviewData.feedback_text}</p>
                </div>
            </div>

            <div className="responses-section">
                <h3>Interview Conversation</h3>
                <div className="responses-list">
                    {Array.isArray(responses) && responses.slice(0, -1).map((response, index) => (
                        <div key={index} className="response-item">
                            <div className="user-response">
                                <h4>Your Response:</h4>
                                <p>{response.human_response}</p>
                            </div>
                            <div className="ai-response">
                                <h4>Interviewer's Response:</h4>
                                <p>{response.llm_response}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterviewDetails; 