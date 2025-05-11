import React, { useState } from 'react';
import { FaClipboardList, FaPlay, FaFilter, FaLightbulb } from 'react-icons/fa';
import './preparation.css';

const Preparation = () => {
    const [mainField, setMainField] = useState('');
    const [subField, setSubField] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [useCached, setUseCached] = useState(true);

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
        // All other subfields remain the same...
    };

    // Process the generated content to improve UI and embed YouTube videos
    const processContent = (content) => {
        if (!content) return '';
        
        // Convert YouTube links to embedded iframes
        const processedContent = content.replace(
            /\[([^\]]+)\]\((https:\/\/www\.youtube\.com\/watch\?v=([^)]+))\)/g, 
            (match, title, url, videoId) => {
                return `
                <div class="video-card">
                    <h4>${title}</h4>
                    <div class="video-container">
                        <iframe 
                            title="${title}"
                            src="https://www.youtube.com/embed/${videoId}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>`;
            }
        );
        
        // Apply additional CSS classes to improve readability
        return `
        <div class="improved-content">
            ${processedContent
                // Add classes to headings
                .replace(/<h2>/g, '<h2 class="content-heading">')
                .replace(/<h3>/g, '<h3 class="content-subheading">')
                .replace(/<h4>/g, '<h4 class="content-section">')
                // Improve lists
                .replace(/<ol>/g, '<ol class="content-list">')
                .replace(/<ul>/g, '<ul class="content-list">')
                // Improve paragraphs
                .replace(/<p>/g, '<p class="content-paragraph">')
                // Add card styling to questions
                .replace(/<li><strong>Question:<\/strong>/g, '<li class="question-card"><strong class="question-label">Question:</strong>')
            }
        </div>`;
    };

    const handleGenerateContent = async () => {
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
                    useCached,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Process the content to improve UI and embed videos
            const processedContent = processContent(data.generated_content);
            setGeneratedContent(processedContent);
            
            // If content was from cache, show a brief message
            if (data.from_cache) {
                const cacheMessage = document.createElement('div');
                cacheMessage.className = 'cache-message';
                cacheMessage.innerHTML = '<p>Content loaded from cache</p>';
                document.querySelector('.content-panel').prepend(cacheMessage);
                
                // Remove the message after 3 seconds
                setTimeout(() => {
                    cacheMessage.remove();
                }, 3000);
            }
            
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

                        <div className="form-group preference-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={useCached}
                                    onChange={(e) => setUseCached(e.target.checked)}
                                />
                                <span className="toggle-text">Use previously generated content</span>
                            </label>
                            <p className="toggle-description">
                                (If Avalible)
                            </p>
                        </div>

                        <button className="generate-btn" onClick={handleGenerateContent}>
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
                        generatedContent ? (
                            <div className="generated-content" dangerouslySetInnerHTML={{ __html: generatedContent }}></div>
                        ) : (
                            <div className="placeholder-content">
                                <FaLightbulb className="placeholder-icon" />
                                <h3>Ready to generate content</h3>
                                <p>Select a field, sub-field, and difficulty level, then click the Generate Content button.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Preparation;