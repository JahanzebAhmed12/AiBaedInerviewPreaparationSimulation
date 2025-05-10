import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import './FAQ.css';

const FAQ = () => {
  const faqs = [
    {
      question: 'What is this project actually?',
      answer: 'This project is an AI-powered interview preparation platform that leverages advanced technology to enhance your interview skills through simulations and feedback.',
    },
    {
      question: 'Is the platform really free to use?',
      answer: 'Yes, our platform is completely free, allowing everyone to access interview preparation resources without any cost.',
    },
    {
      question: 'How does the AI customize interview questions?',
      answer: 'We customize questions using an LLM model working in the backend.',
    },
    {
      question: 'What kind of feedback can I expect?',
      answer: "You'll receive comprehensive feedback on your responses, including a score and insights into areas for improvement.",
    },
    {
      question: 'How does the avatar simulation work?',
      answer: 'The avatar provides a realistic interview experience, allowing you to engage visually while practicing your responses.',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null);
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <section id="faq">
      <div className="container">
        <h2>Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question} <FaPlus className="icon" />
            </div>
            <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
