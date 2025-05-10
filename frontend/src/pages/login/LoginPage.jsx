// src/pages/LoginPage.js
import React from 'react';
import LoginForm from './components/LoginForm';
import './login.css';

function LoginPage() {
  const goHome = () => {
    window.location.href = '/landing'; // Adjust this path if necessary
  };

  return (
    <div className='loginBody'>
      <LoginForm goHome={goHome} />
    </div>
  );
}

export default LoginPage;
