


import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaPlay, FaFilter, FaLightbulb } from 'react-icons/fa';
import './preparation.css';

const Preparation = () => {
    const [mainField, setMainField] = useState('');
    const [subField, setSubField] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [generatedText, setGeneratedText] = useState('');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(false);

    const mainFields = [
        'Architecture', 'Software Engineering', 'Data Science', 'Cybersecurity',
        'Cloud Computing', 'Networking', 'DevOps', 'AI & Machine Learning',
        'Game Development', 'Blockchain', 'UI/UX Design', 'Embedded Systems',
        'Mobile Development', 'Quality Assurance', 'Database Administration',
        'System Administration', 'IT Support', 'Technical Writing',
        'Project Management', 'Business Analysis', 'Healthcare IT', 'Digital Marketing',
        'E-Commerce', 'Renewable Energy', 'Automotive Engineering', 'Aerospace Engineering',
        'Education Technology', 'Biotechnology', 'Robotics', 'Agricultural Technology',
        'Construction Management', 'Media and Entertainment', 'Finance Technology',
        'Insurance Technology', 'Legal Technology', 'Supply Chain Management', 'Retail Technology',
        'Hospitality Management', 'Event Management', 'Customer Relationship Management', 'Human Resources'
    ];

    const subFields = {
        'Architecture': ['Residential Design', 'Commercial Design', 'Urban Planning', 'Sustainable Design'],
        'Software Engineering': ['Web Development', 'Android Development', 'iOS Development', 'Desktop Applications'],
        'Data Science': ['Machine Learning', 'Data Analysis', 'Big Data', 'Data Visualization'],
        'Cybersecurity': ['Penetration Testing', 'Threat Analysis', 'Cryptography', 'Incident Response'],
        'Cloud Computing': ['AWS', 'Azure', 'Google Cloud', 'Hybrid Cloud'],
        'Networking': ['Network Security', 'Routing & Switching', 'Wireless Networking', 'IoT Networking'],
        'DevOps': ['Continuous Integration', 'Infrastructure as Code', 'Monitoring and Logging', 'Containerization'],
        'AI & Machine Learning': ['Natural Language Processing', 'Computer Vision', 'Deep Learning', 'Reinforcement Learning'],
        'Game Development': ['3D Modeling', 'Game Physics', 'Multiplayer Networking', 'Game Engine Development'],
        'Blockchain': ['Smart Contracts', 'Cryptocurrency Development', 'Decentralized Applications', 'Blockchain Security'],
        'UI/UX Design': ['Wireframing', 'Prototyping', 'User Research', 'Accessibility Design'],
        'Embedded Systems': ['Microcontroller Programming', 'Real-Time Systems', 'Sensor Integration', 'Low-Level Programming'],
        'Mobile Development': ['Cross-Platform Development', 'Native Android Development', 'Native iOS Development', 'Mobile UI Design'],
        'Quality Assurance': ['Manual Testing', 'Automated Testing', 'Performance Testing', 'Security Testing'],
        'Database Administration': ['SQL Tuning', 'Database Security', 'Replication', 'Backup and Recovery'],
        'System Administration': ['Server Configuration', 'Virtualization', 'Monitoring and Maintenance', 'Disaster Recovery'],
        'IT Support': ['Troubleshooting', 'Help Desk Management', 'Hardware Repair', 'Network Configuration'],
        'Technical Writing': ['API Documentation', 'User Guides', 'Technical Proposals', 'White Papers'],
        'Project Management': ['Agile Methodologies', 'Risk Management', 'Stakeholder Communication', 'Resource Planning'],
        'Business Analysis': ['Requirement Gathering', 'Process Improvement', 'Stakeholder Analysis', 'Data Modeling'],
        'Healthcare IT': ['Electronic Health Records', 'Medical Imaging', 'Telemedicine', 'Healthcare Analytics'],
        'Digital Marketing': ['SEO', 'Content Marketing', 'Social Media Marketing', 'Pay-Per-Click Advertising'],
        'E-Commerce': ['Product Management', 'Payment Systems', 'Logistics Integration', 'Customer Support Automation'],
        'Renewable Energy': ['Solar Technology', 'Wind Energy Systems', 'Battery Storage', 'Energy Analytics'],
        'Automotive Engineering': ['Vehicle Dynamics', 'Electric Vehicles', 'Engine Design', 'Automotive Electronics'],
        'Aerospace Engineering': ['Flight Dynamics', 'Aerospace Structures', 'Propulsion Systems', 'Satellite Technology'],
        'Education Technology': ['Learning Management Systems', 'E-Learning Content Development', 'Gamified Learning', 'Assessment Tools'],
        'Biotechnology': ['Gene Editing', 'Bioinformatics', 'Bioprocessing', 'Molecular Biology'],
        'Robotics': ['Industrial Automation', 'Humanoid Robotics', 'Robotic Vision', 'Path Planning'],
        'Agricultural Technology': ['Precision Farming', 'Irrigation Systems', 'Crop Monitoring', 'Agricultural Drones'],
        'Construction Management': ['Project Scheduling', 'Cost Estimation', 'Site Safety', 'Material Management'],
        'Media and Entertainment': ['Video Editing', 'Animation', 'Sound Engineering', 'Post-Production'],
        'Finance Technology': ['Payment Gateways', 'Risk Analysis', 'Fraud Detection', 'Financial Modeling'],
        'Insurance Technology': ['Policy Management Systems', 'Claims Processing', 'Risk Assessment', 'Customer Analytics'],
        'Legal Technology': ['Contract Analysis', 'E-Discovery', 'Legal Research Automation', 'Compliance Management'],
        'Supply Chain Management': ['Inventory Optimization', 'Logistics Planning', 'Supplier Management', 'Demand Forecasting'],
        'Retail Technology': ['Point of Sale Systems', 'Customer Analytics', 'E-Commerce Integration', 'Inventory Management'],
        'Hospitality Management': ['Booking Systems', 'Event Management Tools', 'Customer Feedback Systems', 'Revenue Management'],
        'Event Management': ['Venue Selection', 'Budgeting', 'Guest Management', 'Marketing and Promotion'],
        'Customer Relationship Management': ['Lead Management', 'Customer Support', 'Analytics', 'Marketing Automation'],
        'Human Resources': ['Recruitment Tools', 'Performance Management', 'HR Analytics', 'Employee Engagement'],
    };
    
    // Function to fetch YouTube videos based on selected fields
    const fetchYouTubeVideos = async () => {
        if (!mainField || !subField) return;
        
        setLoadingVideos(true);
        
        try {
            // Replace this with your actual API endpoint
            const response = await fetch('http://127.0.0.1:5000/get_videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mainField,
                    subField,
                    difficulty,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setVideos(data.videos);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            // Fallback to generated videos if API fails
            generateFallbackVideos();
        } finally {
            setLoadingVideos(false);
        }
    };

    // Generate fallback videos based on selected fields
    const generateFallbackVideos = () => {
        // This is a fallback in case your API isn't working
        // Replace these IDs with actual relevant YouTube video IDs
        const youtubeVideoIDs = {
            'Web Development': ['W6NZfCO5SIk', 'qz0aGYrrlhU', 'PkZNo7MFNFg'],
            'Android Development': ['fis26HvvDII', 'tZvjSxhoIYs', 'EOfCEhWq8sg'],
            'Machine Learning': ['KNAWp2S3w94', 'JxgmHe2NlMQ', 'ukzFI9rgwfU'],
            'Data Analysis': ['r-uOLxNrNk8', 'GPOv72Awo68', 'UmX4kyB2wfg'],
            // Add more mappings as needed
        };
        
        // Find the closest match or use a default
        const searchTerm = `${mainField} ${subField} ${difficulty}`;
        let bestMatch = 'Web Development'; // Default
        
        Object.keys(youtubeVideoIDs).forEach(key => {
            if (searchTerm.includes(key)) {
                bestMatch = key;
            }
        });
        
        const videoIds = youtubeVideoIDs[bestMatch] || youtubeVideoIDs['Web Development'];
        
        const fallbackVideos = videoIds.map((id, index) => ({
            id: `video${index + 1}`,
            title: `${subField || mainField} ${difficulty || ''} Tutorial ${index + 1}`,
            url: `https://www.youtube.com/embed/${id}`,
            thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`
        }));
        
        setVideos(fallbackVideos);
    };

    useEffect(() => {
        // When tab changes to videos, fetch videos if we have selections
        if (activeTab === 'videos' && mainField && subField) {
            fetchYouTubeVideos();
        }
    }, [activeTab, mainField, subField, difficulty]);

    const handleGenerateText = async () => {
        if (!mainField || !subField || !difficulty) {
            alert('Please select all fields before generating.');
            return;
        }

        setLoading(true);
        setProgress(0);
        const minimumLoadingTime = 2000;
        const loadingStartTime = Date.now();
        
        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prevProgress => {
                const newProgress = prevProgress + 5;
                return newProgress <= 90 ? newProgress : 90;
            });
        }, 200);

        try {
            const response = await fetch('http://127.0.0.1:5000/generate_prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mainField,
                    subField,
                    difficulty,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            setGeneratedText(data.generated_content);
            clearInterval(progressInterval);
            setProgress(100);
        } catch (error) {
            alert('Failed to generate content. Please try again.');
            clearInterval(progressInterval);
            setProgress(0);
        } finally {
            const elapsedTime = Date.now() - loadingStartTime;
            const remainingTime = Math.max(minimumLoadingTime - elapsedTime, 0);

            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        }
    };

    return (
        <div className="preparation-page">
            <div className="preparation-header">
                <h2 className="preparation-heading">
                    <span className="icon-wrapper"><FaClipboardList /></span>
                    Preparation
                </h2>
                <div className="preparation-subtitle">
                    Generate customized learning content for your selected field
                </div>
            </div>

            <div className="preparation-content">
                <div className="selection-panel">
                    <div className="selection-header">
                        <FaFilter className="selection-icon" />
                        <h3>Select Topic</h3>
                    </div>
                    
                    <div className="selection-form">
                        <div className="form-group">
                            <label htmlFor="mainField">Main Field</label>
                            <select
                                id="mainField"
                                value={mainField}
                                onChange={(e) => setMainField(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select Main Field</option>
                                {mainFields.map((field, index) => (
                                    <option key={index} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="subField">Sub-Field</label>
                            <select
                                id="subField"
                                value={subField}
                                onChange={(e) => setSubField(e.target.value)}
                                className="input-field"
                                disabled={!mainField || !subFields[mainField]}
                            >
                                <option value="">Select Sub-Field</option>
                                {(subFields[mainField] || []).map((field, index) => (
                                    <option key={index} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="difficulty">Difficulty Level</label>
                            <select
                                id="difficulty"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="input-field"
                            >
                                <option value="">Select Difficulty</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>

                        <button className="generate-btn" onClick={handleGenerateText}>
                            <FaPlay className="btn-icon" /> Generate Content
                        </button>
                    </div>

                    {loading && (
                        <div className="loading-container">
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress}%` }}
                                >
                                </div>
                                <span className="progress-percentage">{progress}%</span>
                            </div>
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <p>Generating content, please wait...</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="content-panel">
                    {!loading && (
                        <div className="tabs-container">
                            <div className="tabs">
                                <button 
                                    className={`tab ${activeTab === 'content' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('content')}
                                >
                                    Content
                                </button>
                                <button 
                                    className={`tab ${activeTab === 'videos' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('videos')}
                                >
                                    Videos
                                </button>
                            </div>
                            
                            <div className="tab-content">
                                {activeTab === 'content' && (
                                    <div className="content-tab">
                                        {generatedText ? (
                                            <div className="generated-content" dangerouslySetInnerHTML={{ __html: generatedText }}></div>
                                        ) : (
                                            <div className="placeholder-content">
                                                <FaLightbulb className="placeholder-icon" />
                                                <h3>Ready to generate content</h3>
                                                <p>Select a field, sub-field, and difficulty level, then click the Generate Content button.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'videos' && (
                                    <div className="videos-tab">
                                        <h3>Recommended Videos</h3>
                                        {loadingVideos ? (
                                            <div className="loading-videos">
                                                <div className="spinner"></div>
                                                <p>Loading videos...</p>
                                            </div>
                                        ) : videos.length > 0 ? (
                                            <div className="videos-grid">
                                                {videos.map(video => (
                                                    <div key={video.id} className="video-card">
                                                        <h4>{video.title}</h4>
                                                        <div className="video-container">
                                                            <iframe 
                                                                title={video.title}
                                                                src={video.url}
                                                                frameBorder="0"
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-videos-message">
                                                <p>Select a field and subfield to see relevant videos.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Preparation;