import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Sidebar from './Sidebar';
import ProgressReport from './ProgressReport';
import StartInterview from './StartInterview';
import Settings from './Settings';
import './Dashboard.css';
import Preparation from './preparation';
import Badges from './Badges';
import { FaTachometerAlt, FaUsers, FaChartPie, FaCalendarAlt, FaStar } from 'react-icons/fa';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: 0,
    worst_score: 0,
    best_score: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get_interview_stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching interview stats:', error);
      }
    };

    if (activeSection === 'dashboard') {
      fetchStats();
    }
  }, [activeSection]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Data for the doughnut chart
  const data = {
    labels: ['Completed Interviews', 'Pending Interviews', 'Failed Interviews'],
    datasets: [
      {
        label: 'Interview Status',
        data: [15, 5, 3], // Example data
        backgroundColor: ['#1abc9c', '#f39c12', '#e74c3c'],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Interview Status Distribution',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <Sidebar onNavigate={handleSectionChange} />
      <main>
        {activeSection === 'dashboard' && (
          <div className="main-content">
            <section id="dashboard" className="section">
              <h2>
                <FaTachometerAlt /> Dashboard
              </h2>
              <div className="dashboard-cards">
                <div className="card">
                  <div className="card-icon">
                    <FaUsers />
                  </div>
                  <div className="card-content">
                    <h3>Total Interviews</h3>
                    <p id="totalInterviews">{stats.total_interviews}</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-icon">
                    <FaChartPie />
                  </div>
                  <div className="card-content">
                    <h3>Average Score</h3>
                    <p id="averageScore">{stats.average_score}</p>
                  </div>
                </div>
              </div>
              <div className="dashboard-cards">
                <div className="card">
                  <div className="card-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="card-content">
                    <h3>Worst Score</h3>
                    <p id="worstScore">{stats.worst_score}</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-icon">
                    <FaStar />
                  </div>
                  <div className="card-content">
                    <h3>Best Score</h3>
                    <p id="bestScore">{stats.best_score}</p>
                  </div>
                </div>
              </div>

              {/* Round Graph Section */}
              <div className="graph-section">
                <Doughnut data={data} options={options} />
              </div>
            </section>
          </div>
        )}
        {activeSection === 'startInterview' && <StartInterview />}
        {activeSection === 'preparation' && <Preparation />}
        {activeSection === 'progressReport' && <ProgressReport />}
        {activeSection === 'settings' && <Settings />}
        {activeSection === 'badges' && <Badges />}
      </main>
    </div>
  );
};

export default Dashboard;
