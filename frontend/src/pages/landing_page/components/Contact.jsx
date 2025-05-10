import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);  // Set loading to true when the email is being sent

    emailjs.sendForm(
      'service_0tb3uum',    // Replace with your actual Service ID
      'template_lyo630o',   // Replace with your actual Template ID
      e.target,
      'zkb8STH8-s_s0hfgj'   // Replace with your actual Public Key
    ).then(
      (result) => {
        setLoading(false);
        setSuccess(true);  // Show success message
        e.target.reset();  // Reset form after submission

        // Automatically hide the success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000); // 3000ms = 3 seconds
      },
      (error) => {
        setLoading(false);
        alert("Failed to send message.");
      }
    );
  };

  return (
    <section id="contact">
      <div className="container">
        <h2>Get in Touch</h2>
        <form onSubmit={sendEmail}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="title">Subject:</label>
          <input type="text" id="title" name="title" required />

          <label htmlFor="content">Message:</label>
          <textarea id="content" name="content" required></textarea>

          <button type="submit">
            {loading ? (
              <div className="spinner"></div>  // Show spinner when loading
            ) : (
              <FaPaperPlane />
            )}
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>

        {success && <div className="success-message">Message Sent Successfully!</div>}
      </div>
    </section>
  );
};

export default Contact;
