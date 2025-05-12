import React from 'react';
import { FaPlay } from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  const handleStartInterview = () => {
    // Navigate to the interview page
    window.location.href = "/startInterview";
  };

  return (
    <section id="landing">
      <div className="overlay">
        <div className="content-wrapper">
          <h2>AI Based Interview</h2>
          <p>"Empowering Your Future with AI-driven Interview Simulations and Assessments!"</p>
          <button className="start-button" onClick={handleStartInterview}>
            <FaPlay /> Start Your Interview
          </button>
        </div>
      </div>
    </section>
  );
};

export default Landing;
