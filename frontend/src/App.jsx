// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard.jsx'; // Import Page1's main app component
import Landing from './pages/landing_page/landing.jsx'; // Import Page1's main app component
import Login from './pages/login/LoginPage.jsx'; // Import Page1's main app component
import InterviewPage from './pages/start_interview/startInterviewPage.jsx';
import ForgotPassword from './pages/forgot_pass/fpass.jsx';
import QForm from './pages/q_form/qform.jsx'
import SignupForm from './pages/login/SignupPage.jsx';
import Simulation from './pages/simulation/simulation.jsx'
import { ChatProvider } from './pages/simulation/hooks/useChat';
import PrivateRoute from './helpers/PrivateRoute';
import InterviewDetails from './pages/dashboard/components/InterviewDetails';

// import './App.css';
 
function App() {
  return (
    <Router>
     
        <Routes>
          <Route path="/" element={<Landing />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/signupForm" element={<SignupForm />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/startInterview" element={
            <PrivateRoute>
              <InterviewPage />
            </PrivateRoute>
          } />
          <Route path="/qForm" element={
            <PrivateRoute>
              <QForm />
            </PrivateRoute>
          } />
          <Route path="/simulation" element={
            <PrivateRoute>
              <ChatProvider>
                <Simulation />
              </ChatProvider>
            </PrivateRoute>
          } />
          <Route path="/interview/:interviewId" element={<InterviewDetails />} />
        </Routes>
      
    </Router>
  );
}

export default App;
