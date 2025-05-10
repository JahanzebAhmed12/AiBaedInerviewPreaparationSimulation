import React from 'react';
import './Services.css';
 

const Services = () => {
  const services = [
    {
      id: 1,
      title: 'Voice Interaction',
      description: 'Respond to interview questions using natural, conversational voice inputs.',
      image: "/voice.png",
    },
    {
      id: 2,
      title: 'Avatar Simulation',
      description: 'Practice interviews with realistic 3D avatars for an immersive experience.',
      image: '/avatar.png',
    },
    {
      id: 3,
      title: 'Evaluation & Assessment',
      description: 'Get instant feedback and performance scores after each session.',
      image: '/assessment.png',
    },
  ];

  return (
    <section id="services">
      <div className="container">
        <h2>Our Services</h2>
        <p className="services-description">
          We offer a wide range of services to help businesses succeed. Whether it's improving efficiency, delivering digital solutions, or optimizing processes, we've got you covered.
        </p>
        <div className="service-grid">
          {services.map(service => (
            <div key={service.id} className="service">
              <img src={service.image} alt={`${service.title} Icon`} />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
