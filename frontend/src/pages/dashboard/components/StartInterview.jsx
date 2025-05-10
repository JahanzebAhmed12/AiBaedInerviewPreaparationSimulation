import React from 'react';
import { FaPlayCircle, FaBriefcase, FaPlay } from 'react-icons/fa';
import './StartInterview.css';

const StartInterview = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const field = e.target.interviewField.value;

        // Store interview details in localStorage
        localStorage.setItem('interviewDetails', JSON.stringify({
            interviewField: field,
            timestamp: new Date().toISOString()
        }));

        alert(`Interview started in ${field} field.`);
        e.target.reset();
        // Redirect to the simulation page
        window.location.href = '/simulation';
    };

    return (
        <section id="startInterview" className="start-interview-section">
            <h2><FaPlayCircle /> Start Interview</h2>
            <form id="startInterviewForm" className="start-interview-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="interviewField"><div className='s-interview-icons'><FaBriefcase /></div> Interview Field:</label>
                    <input type="text" id="interviewField" name="interviewField" placeholder="e.g., Software Engineering" required />
                </div>
                <button type="submit">
                    <FaPlay /> Start Interview
                </button>
            </form>
        </section>
    );
};

export default StartInterview;
