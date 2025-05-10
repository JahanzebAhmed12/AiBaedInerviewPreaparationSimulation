import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import './ForgotPassword.css';
import { Link } from 'react-router-dom'; // Import Link from React Router

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/request_password_reset', {
        email: email
      });
      setMessage(response.data.msg);
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Something went wrong');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/reset_password', {
        email,
        code,
        new_password: newPassword
      });
      setMessage(response.data.msg);
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="forgotPassword">
      <div className="forgotPassword-container">
        <h2 className="forgotPassword-heading">Forgot Password</h2>
        <p className="forgotPassword-paragraph">
          Enter the verification code sent to your email, and create a new password.
        </p>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <form className="forgotPassword-form" onSubmit={handleSubmit}>
          {/* Email with Send Button */}
          <div className="forgotPassword-formGroup">
            <label htmlFor="email">Enter Email</label>
            <div className="email-input-wrapper">
              <input 
                type="email" 
                id="email" 
                placeholder="Enter your email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button 
                type="button" 
                className="send-btn" 
                onClick={handleSendCode}
              >
                <FaPaperPlane className="send-icon" />
                Send
              </button>
            </div>
          </div>
          {/* Verification Code */}
          <div className="forgotPassword-formGroup">
            <label htmlFor="email-verification-code">Email Verification Code</label>
            <input 
              type="text" 
              id="email-verification-code" 
              placeholder="Enter verification code from email" 
              required 
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          {/* New Password */}
          <div className="forgotPassword-formGroup">
            <label htmlFor="new-password">New Password</label>
            <input 
              type="password" 
              id="new-password" 
              placeholder="Enter new password" 
              required 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {/* Confirm Password */}
          <div className="forgotPassword-formGroup">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <input 
              type="password" 
              id="confirm-password" 
              placeholder="Confirm new password" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {/* Submit Button */}
          <button className="forgotPassword-btn" type="submit">
            Update Password
          </button>
        </form>


        <div className="forgotPassword-altOption">
          <p>
            <Link to="/login" className="forgotPassword-link">Back to Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
