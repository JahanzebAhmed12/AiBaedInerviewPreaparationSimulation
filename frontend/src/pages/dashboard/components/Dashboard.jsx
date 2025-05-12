import React, { useState, useEffect } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
} from 'chart.js';
import Sidebar from './Sidebar';
import ProgressReport from './ProgressReport';
import StartInterview from './StartInterview';
import Settings from './Settings';
import './Dashboard.css';
import Preparation from './preparation';
import Badges from './Badges';
import { FaTachometerAlt, FaUsers, FaChartPie, FaCalendarAlt, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeChart, setActiveChart] = useState('distribution');
  const [stats, setStats] = useState({
    total_interviews: 0,
    average_score: 0,
    worst_score: 0,
    best_score: 0,
    improvement_rate: 0,
    last_week_interviews: 0
  });
  const [chartData, setChartData] = useState({
    distribution: null,
    trend: null,
    fields: null
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

    const fetchChartData = async () => {
      try {
        const [distributionRes, trendRes, fieldsRes] = await Promise.all([
          axios.get('http://localhost:5000/get_score_distribution', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_score_trend', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_field_performance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setChartData({
          distribution: distributionRes.data,
          trend: trendRes.data,
          fields: fieldsRes.data
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    if (activeSection === 'dashboard') {
      fetchStats();
      fetchChartData();
    }
  }, [activeSection]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Score Distribution Chart
  const distributionData = {
    labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
    datasets: [{
      label: 'Score Distribution',
      data: chartData.distribution || [0, 0, 0, 0, 0],
      backgroundColor: ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'],
      hoverOffset: 4,
    }]
  };

  // Score Trend Chart
  const trendData = {
    labels: chartData.trend?.labels || [],
    datasets: [{
      label: 'Score Trend',
      data: chartData.trend?.data || [],
      borderColor: '#3498db',
      tension: 0.1,
      fill: false
    }]
  };

  // Field Performance Chart
  const fieldData = {
    labels: chartData.fields?.labels || [],
    datasets: [{
      label: 'Average Score by Field',
      data: chartData.fields?.data || [],
      backgroundColor: ['#1abc9c', '#3498db', '#9b59b6', '#e67e22', '#34495e'],
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Interview Performance Analysis',
        font: {
          size: 16,
        },
      },
    },
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'distribution':
        return <Doughnut data={distributionData} options={chartOptions} />;
      case 'trend':
        return <Line data={trendData} options={chartOptions} />;
      case 'fields':
        return <Bar data={fieldData} options={chartOptions} />;
      default:
        return <Doughnut data={distributionData} options={chartOptions} />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onNavigate={handleSectionChange} />
      <main>
        {activeSection === 'dashboard' && (
          <div className="main-content">
            <section id="dashboard" className="section">
              <h2>
                <FaTachometerAlt /> Dashboard Overview
              </h2>
              <div className="dashboard-cards">
                <div className="card">
                  <div className="card-icon">
                    <FaUsers />
                  </div>
                  <div className="card-content">
                    <h3>Total Interviews</h3>
                    <p id="totalInterviews">{stats.total_interviews}</p>
                    <small>Last Week: {stats.last_week_interviews}</small>
                  </div>
                </div>
                <div className="card">
                  <div className="card-icon">
                    <FaChartPie />
                  </div>
                  <div className="card-content">
                    <h3>Average Score</h3>
                    <p id="averageScore">{stats.average_score}%</p>
                    <small className={stats.improvement_rate >= 0 ? 'positive' : 'negative'}>
                      {stats.improvement_rate >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {Math.abs(stats.improvement_rate)}% from last week
                    </small>
                  </div>
                </div>
                <div className="card">
                  <div className="card-icon">
                    <FaCalendarAlt />
                  </div>
                  <div className="card-content">
                    <h3>Worst Score</h3>
                    <p id="worstScore">{stats.worst_score}%</p>
                    <small>Room for improvement</small>
                  </div>
                </div>
                <div className="card">
                  <div className="card-icon">
                    <FaStar />
                  </div>
                  <div className="card-content">
                    <h3>Best Score</h3>
                    <p id="bestScore">{stats.best_score}%</p>
                    <small>Personal best</small>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="charts-section">
                <div className="chart-tabs">
                  <button 
                    className={`chart-tab ${activeChart === 'distribution' ? 'active' : ''}`}
                    onClick={() => setActiveChart('distribution')}
                  >
                    Score Distribution
                  </button>
                  <button 
                    className={`chart-tab ${activeChart === 'trend' ? 'active' : ''}`}
                    onClick={() => setActiveChart('trend')}
                  >
                    Score Trend
                  </button>
                  <button 
                    className={`chart-tab ${activeChart === 'fields' ? 'active' : ''}`}
                    onClick={() => setActiveChart('fields')}
                  >
                    Field Performance
                  </button>
                </div>
                <div className="chart-container">
                  {renderChart()}
                </div>
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
