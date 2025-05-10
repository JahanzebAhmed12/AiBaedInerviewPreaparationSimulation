import React, { useState } from 'react';
import './dashboard.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StartInterview from './components/StartInterview';
import ProgressReport from './components/ProgressReport';
import Settings from './components/Settings';
import Preparation from './components/preparation';
import Badges from './components/Badges';
 
 
 
 

function App() {
    const [activeSection, setActiveSection] = useState('dashboard');

    const handleNavigation = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="App">
            <Header />
            <Sidebar handleNavigation={handleNavigation} />
            <main>
                {activeSection === 'dashboard' && <Dashboard />}
                {activeSection === 'preparation' && <Preparation />}
                {activeSection === 'startInterview' && <StartInterview />}
                {activeSection === 'progressReport' && <ProgressReport />}
                {activeSection === 'settings' && <Settings />}
                {activeSection === 'badges' && <Badges />}
      
            </main>
        </div>
    );
}

export default App;
