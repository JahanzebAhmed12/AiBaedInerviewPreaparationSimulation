// src/pages/SignupPage.js
import React from 'react';
import SignupForm from './components/SignupForm';
import './login.css';

function SignupPage() {
  const goHome = () => {
    window.location.href = '/login'; // Adjust this path if necessary
  };

  return (
    <div className='loginBody'>
      <SignupForm goHome={goHome} />
    </div>
  );
}

export default SignupPage;
