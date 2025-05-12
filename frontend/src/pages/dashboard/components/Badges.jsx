import React, { useState, useEffect } from 'react';
import './Badges.css';
import { 
    FaMedal, FaTrophy, FaStar, FaAward, 
    FaCrown, FaChartLine, FaRocket, FaHeart 
} from 'react-icons/fa';
import axios from 'axios';

const Badges = () => {
    // Use direct token authentication instead of AuthContext
    const [userId, setUserId] = useState(null);
    const [badges, setBadges] = useState([
        {
            id: 1,
            name: "First Step",
            description: "Completed your first interview",
            icon: <FaMedal />,
            color: "#FFD700", // Gold
            unlocked: false,
            progress: 0
        },
        {
            id: 2,
            name: "Getting Started",
            description: "Completed 3 interviews",
            icon: <FaTrophy />,
            color: "#C0C0C0", // Silver
            unlocked: false,
            progress: 0
        },
        {
            id: 3,
            name: "On Fire",
            description: "Completed 5 interviews",
            icon: <FaStar />,
            color: "#CD7F32", // Bronze
            unlocked: false,
            progress: 0
        },
        {
            id: 4,
            name: "Score Champion",
            description: "Achieved a score of 80 or higher",
            icon: <FaAward />,
            color: "#1abc9c", // Teal
            unlocked: false,
            progress: 0
        },
        {
            id: 5,
            name: "High Achiever",
            description: "Achieved a score of 90 or higher",
            icon: <FaCrown />,
            color: "#FFD700", // Gold
            unlocked: false,
            progress: 0
        },
        {
            id: 6,
            name: "Rising Star",
            description: "Improved score by 20+ points",
            icon: <FaChartLine />,
            color: "#9C27B0", // Purple
            unlocked: false,
            progress: 0
        },
        {
            id: 7,
            name: "Feedback Master",
            description: "Implemented feedback suggestions",
            icon: <FaHeart />,
            color: "#E91E63", // Pink
            unlocked: false,
            progress: 0
        }
    ]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // First try to get user profile
                const profileResponse = await axios.get('http://localhost:5000/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                // Get user ID from the token instead of profile response
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const userId = tokenData.sub;
                setUserId(userId);
                
                // Then fetch badge progress
                const badgeResponse = await axios.get('http://localhost:5000/get_badge_progress', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (badgeResponse.data) {
                    // Ensure we're working with an array
                    const badgeProgress = Array.isArray(badgeResponse.data) ? badgeResponse.data : [];
                    
                    const updatedBadges = badges.map(badge => {
                        const serverBadge = badgeProgress.find(b => b.id === badge.id);
                        if (serverBadge) {
                            return {
                                ...badge,
                                unlocked: serverBadge.unlocked,
                                progress: serverBadge.progress,
                                current: serverBadge.current,
                                required: serverBadge.required
                            };
                        }
                        return badge;
                    });
                    
                    setBadges(updatedBadges);
                    
                    // Save newly unlocked badges
                    const unlockedBadges = updatedBadges.filter(badge => badge.unlocked)
                        .map(badge => ({
                            badge_id: badge.id,
                            badge_name: badge.name,
                            criteria: badge.description
                        }));
                    
                    if (unlockedBadges.length > 0) {
                        try {
                            await axios.post('http://localhost:5000/save_badges', {
                                badges: unlockedBadges
                            }, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                        } catch (saveError) {
                            console.error('Error saving badges:', saveError);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error loading data. Using mock data instead.");
                
                // Use mock data as fallback
                updateBadgesWithMockData({
                    interviewCount: 3,
                    highestScore: 85,
                    scoreImprovement: 15,
                    feedbackImplemented: true
                });
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        } else {
            setError("No authentication token found. Using mock data.");
            updateBadgesWithMockData({
                interviewCount: 3,
                highestScore: 85,
                scoreImprovement: 15,
                feedbackImplemented: true
            });
            setLoading(false);
        }
    }, []);

    // Update badges with mock data if API fails
    const updateBadgesWithMockData = (userData) => {
        const updatedBadges = badges.map(badge => {
            let isUnlocked = false;
            let progress = 0;
            
            switch(badge.id) {
                case 1: 
                    isUnlocked = userData.interviewCount >= 1;
                    progress = Math.min(100, (userData.interviewCount / 1) * 100);
                    break;
                case 2: 
                    isUnlocked = userData.interviewCount >= 3;
                    progress = Math.min(100, (userData.interviewCount / 3) * 100);
                    break;
                case 3: 
                    isUnlocked = userData.interviewCount >= 5;
                    progress = Math.min(100, (userData.interviewCount / 5) * 100);
                    break;
                case 4: 
                    isUnlocked = userData.highestScore >= 80;
                    progress = Math.min(100, (userData.highestScore / 80) * 100);
                    break;
                case 5: 
                    isUnlocked = userData.highestScore >= 90;
                    progress = Math.min(100, (userData.highestScore / 90) * 100);
                    break;
                case 6: 
                    isUnlocked = userData.scoreImprovement >= 20;
                    progress = Math.min(100, (userData.scoreImprovement / 20) * 100);
                    break;
                case 7: 
                    isUnlocked = userData.feedbackImplemented;
                    progress = userData.feedbackImplemented ? 100 : 0;
                    break;
                default: 
                    break;
            }
            
            return {
                ...badge,
                unlocked: isUnlocked,
                progress: progress,
                current: isUnlocked ? 'Complete' : 'In progress',
                required: isUnlocked ? 'Complete' : 'Incomplete'
            };
        });
        
        setBadges(updatedBadges);
    };

    return (
        <section id="badges" className="badges-section">
            <h2 className="badges-heading">
                <span className="icon-wrapper"><FaMedal /></span>
                Your Achievements
            </h2>
            
            {loading && <div className="loading-spinner">Loading achievements...</div>}
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="badges-container">
                {badges.map((badge) => (
                    <div 
                        key={badge.id} 
                        className={`badge ${badge.unlocked ? 'unlocked' : 'locked'}`}
                        style={{
                            opacity: badge.unlocked ? 1 : 0.6,
                            borderColor: badge.unlocked ? badge.color : '#ccc'
                        }}
                    >
                        <div className="badge-icon" style={{ color: badge.unlocked ? badge.color : '#ccc' }}>
                            {badge.icon}
                        </div>
                        <div className="badge-details">
                            <h3>{badge.name}</h3>
                            <p>{badge.description}</p>
                            
                            {/* Progress indicator */}
                            <div className="badge-progress">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{
                                            width: `${badge.progress}%`,
                                            backgroundColor: badge.unlocked ? badge.color : '#ccc'
                                        }}
                                    ></div>
                                </div>
                                <div className="progress-text">
                                    {badge.unlocked ? (
                                        <div className="badge-status unlocked-status">Unlocked!</div>
                                    ) : (
                                        <div className="badge-status locked-status">
                                            {badge.current || 0}/{badge.required || 'Required'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Badges;

