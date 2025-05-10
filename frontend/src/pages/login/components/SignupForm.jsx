import React, { useState } from 'react';
import './SignupForm.css';

function SignupForm({ goHome, toggleForms }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
  
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
  
    // Password strength regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    // Check password strength
    if (!passwordRegex.test(trimmedPassword)) {
      setError(
        'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.'
      );
      return;
    }
  
    // Check if passwords match
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords don't match");
      return;
    }
  
    const data = {
      name,
      email,
      password: trimmedPassword,
    };
  
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Signup successful!');
        window.location.href = '/login';
        goHome();
      } else {
        setError(result.msg || 'An error occurred during signup');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('An error occurred during signup');
    }
  };
  

  return (
    <div className="signupForm-container">
      <h2 className="signupForm-heading">Create Your Account</h2>
      <p className="signupForm-paragraph">Join us and start your journey!</p>
      <form onSubmit={handleSignup} autoComplete="off">
        {error && <div className="signupForm-error">{error}</div>}
        <div className="signupForm-formGroup">
          <label htmlFor="full-name">Full Name</label>
          <input
            type="text"
            id="full-name"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="signupForm-formGroup">
          <label htmlFor="signup-email">Email Address</label>
          <input
            type="email"
            id="signup-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="signupForm-formGroup">
          <label htmlFor="signup-password">Password</label>
          <input
            type="password"
            id="signup-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <div className="signupForm-formGroup">
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        
        <button className="signupForm-btn" type="submit">Sign Up</button>
        <div className="signupForm-altOption">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
