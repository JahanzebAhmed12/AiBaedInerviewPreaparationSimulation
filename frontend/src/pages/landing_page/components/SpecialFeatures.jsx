import React from 'react';
import './SpecialFeatures.css';

const SpecialFeatures = () => {
  const features = [
    {
      id: 1,
      title: 'Free Access',
      description: 'No cost, no barriers.',
    },
    {
      id: 2,
      title: 'User-Friendly',
      description: 'Intuitive and easy navigation.',
    },
    {
      id: 3,
      title: 'Avatar Experience',
      description: 'Engaging visual interactions.',
    },
    {
      id: 4,
      title: 'Instant Feedback',
      description: 'Immediate AI insights.',
    },
  ];

  return (
    <section id="special">
      <div className="container">
        <h2>What Makes Us Special</h2>
        <p className="special-description">
          Our project stands out because we focus on innovation, customer-centric solutions, and unparalleled efficiency. Below are four key features that define what we do best.
        </p>
        <div className="feature-grid">
          {features.map(feature => (
            <div key={feature.id} className="feature-box">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialFeatures;
