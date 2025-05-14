import React, { useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT token in local storage or cookies
        localStorage.setItem('token', data.token);

        // Redirect based on profile status
        if (data.profile_incomplete) {
          navigate('/qForm'); // Redirect to profile update form
        } else {
          navigate('/dashboard'); // Redirect to dashboard
        }
      } else {
        alert(data.msg); // Display error message
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="loginForm-container">
      <h2 className="loginForm-heading">Welcome Back!</h2>
      <p className="loginForm-paragraph">Please login to continue.</p>
      <form onSubmit={handleLogin}>
        <div className="loginForm-formGroup">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="loginForm-formGroup">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="loginForm-checkboxGroup">
          <input type="checkbox" id="remember-me" />
          {/* <label htmlFor="remember-me">Remember Me</label> */}
        </div>
        <div className="loginForm-forgotPassword">
  <Link to="/forgotpassword">Forgot your password?</Link>
</div>
        <button className="loginForm-btn" type="submit">Login</button>
        <div className="loginForm-altOption">
          Don't have an account? <a href="/SignupForm">Sign up</a>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;