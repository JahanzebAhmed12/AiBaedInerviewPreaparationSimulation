import React, { useState, useEffect } from 'react';
import { Doughnut, Line, Bar, Radar } from 'react-chartjs-2';
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
  Title,
  RadialLinearScale,
  Filler
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
  Title,
  RadialLinearScale,
  Filler
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
    fields: null,
    skills: null,
    questionTypes: null,
    timePerformance: null
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
        const [distributionRes, trendRes, fieldsRes, skillsRes, questionTypesRes, timePerformanceRes] = await Promise.all([
          axios.get('http://localhost:5000/get_score_distribution', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_score_trend', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_field_performance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_skills_assessment', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_question_type_performance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get('http://localhost:5000/get_time_performance', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setChartData({
          distribution: distributionRes.data,
          trend: trendRes.data,
          fields: fieldsRes.data,
          skills: skillsRes.data,
          questionTypes: questionTypesRes.data,
          timePerformance: timePerformanceRes.data
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
    labels: ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'],
    datasets: [{
      label: 'Score Distribution',
      data: chartData.distribution || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: [
        '#e74c3c', '#e67e22', '#f39c12', '#f1c40f', 
        '#2ecc71', '#27ae60', '#1abc9c', '#16a085',
        '#3498db', '#2980b9'
      ],
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

  // Skills Assessment Radar Chart
  const skillsData = {
    labels: chartData.skills?.labels || ['Problem Solving', 'Communication', 'Technical Knowledge', 'Time Management', 'Code Quality'],
    datasets: [{
      label: 'Skill Assessment',
      data: chartData.skills?.data || [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(26, 188, 156, 0.2)',
      borderColor: '#1abc9c',
      borderWidth: 2,
      pointBackgroundColor: '#1abc9c',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#1abc9c'
    }]
  };

  // Question Type Performance Stacked Bar Chart
  const questionTypeData = {
    labels: chartData.questionTypes?.labels || ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        label: 'Correct',
        data: chartData.questionTypes?.correct || [0, 0, 0],
        backgroundColor: '#2ecc71',
      },
      {
        label: 'Incorrect',
        data: chartData.questionTypes?.incorrect || [0, 0, 0],
        backgroundColor: '#e74c3c',
      }
    ]
  };

  // Time Performance Heatmap
  const timePerformanceData = {
    labels: chartData.timePerformance?.labels || ['Morning', 'Afternoon', 'Evening', 'Night'],
    datasets: [{
      label: 'Average Score by Time',
      data: chartData.timePerformance?.data || [0, 0, 0, 0],
      backgroundColor: [
        'rgba(46, 204, 113, 0.8)',
        'rgba(52, 152, 219, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(231, 76, 60, 0.8)'
      ],
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
      case 'skills':
        return <Radar data={skillsData} options={chartOptions} />;
      case 'questionTypes':
        return <Bar data={questionTypeData} options={{
          ...chartOptions,
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        }} />;
      case 'timePerformance':
        return <Bar data={timePerformanceData} options={chartOptions} />;
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
                  <button 
                    className={`chart-tab ${activeChart === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveChart('skills')}
                  >
                    Skills Assessment
                  </button>
                  <button 
                    className={`chart-tab ${activeChart === 'questionTypes' ? 'active' : ''}`}
                    onClick={() => setActiveChart('questionTypes')}
                  >
                    Question Types
                  </button>
                  <button 
                    className={`chart-tab ${activeChart === 'timePerformance' ? 'active' : ''}`}
                    onClick={() => setActiveChart('timePerformance')}
                  >
                    Time Performance
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
