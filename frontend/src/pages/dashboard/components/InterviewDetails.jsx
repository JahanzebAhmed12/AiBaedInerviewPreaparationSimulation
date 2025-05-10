import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InterviewDetails.css';

const InterviewDetails = () => {
    const [interviewData, setInterviewData] = useState(null);
    const [responses, setResponses] = useState([]);
    const { interviewId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchInterviewDetails();
    }, [interviewId]);

    const fetchInterviewDetails = async () => {
        try {
            // Fetch interview feedback
            const feedbackResponse = await axios.get(`http://localhost:5000/get_interview_feedback/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setInterviewData(feedbackResponse.data);

            // Fetch interview responses
            const responsesResponse = await axios.get(`http://localhost:5000/get_interview_responses/${interviewId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setResponses(responsesResponse.data);
        } catch (error) {
            console.error('Error fetching interview details:', error);
        }
    };

    const handleBack = () => {
        navigate('/progress-report');
    };

    if (!interviewData) {
        return <div>Loading...</div>;
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
                            {JSON.parse(interviewData.strengths).map((strength, index) => (
                                <li key={index}>{strength}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="feedback-item">
                        <h4>Areas to Improve</h4>
                        <ul>
                            {JSON.parse(interviewData.areas_to_improve).map((area, index) => (
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
                    {responses.map((response, index) => (
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