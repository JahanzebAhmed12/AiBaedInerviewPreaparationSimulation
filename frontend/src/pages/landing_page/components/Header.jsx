import React from 'react';
import './Header.css';

const Header = () => {
  const scrollToSection = (section) => {
    window.location.hash = section;
  };

  const handleLogin = () => {
    window.location.href = "/login"; // Navigate to the login page
  };

  return (
    <header className="header-section">
      <div className="container">
        <nav>
          <ul>
            <li>
              <button onClick={() => scrollToSection('#landing')} className="nav-button">Home</button>
            </li>
            <li>
              <button onClick={() => scrollToSection('#services')} className="nav-button">Services</button>
            </li>
            <li>
              <button onClick={() => scrollToSection('#contact')} className="nav-button">Get in Touch</button>
            </li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <button onClick={handleLogin} className="login"><i className="fas fa-user-plus"></i> Login</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
