import React, { useState, useEffect } from 'react';
import './Badges.css';
import { 
    FaMedal, FaTrophy, FaStar, FaAward, 
    FaCrown, FaChartLine, FaRocket, FaHeart 
} from 'react-icons/fa';

const Badges = () => {
    const [badges, setBadges] = useState([
        {
            id: 1,
            name: "First Step",
            description: "Completed your first interview",
            icon: <FaMedal />,
            color: "#FFD700", // Gold
            unlocked: false
        },
        {
            id: 2,
            name: "Getting Started",
            description: "Completed 3 interviews",
            icon: <FaTrophy />,
            color: "#C0C0C0", // Silver
            unlocked: false
        },
        {
            id: 3,
            name: "On Fire",
            description: "Completed 5 interviews",
            icon: <FaStar />,
            color: "#CD7F32", // Bronze
            unlocked: false
        },
        {
            id: 4,
            name: "Score Champion",
            description: "Achieved a score of 80 or higher",
            icon: <FaAward />,
            color: "#1abc9c", // Teal
            unlocked: false
        },
        {
            id: 5,
            name: "High Achiever",
            description: "Achieved a score of 90 or higher",
            icon: <FaCrown />,
            color: "#FFD700", // Gold
            unlocked: false
        },
        {
            id: 6,
            name: "Rising Star",
            description: "Improved score by 20+ points",
            icon: <FaChartLine />,
            color: "#9C27B0", // Purple
            unlocked: false
        },
        {
            id: 7,
            name: "Weekend Warrior",
            description: "Completed interviews during weekends",
            icon: <FaRocket />,
            color: "#FF9800", // Orange
            unlocked: false
        },
        {
            id: 8,
            name: "Feedback Master",
            description: "Implemented feedback suggestions",
            icon: <FaHeart />,
            color: "#E91E63", // Pink
            unlocked: false
        }
    ]);

    // Function to check and update badge status
    const checkBadgeProgress = (userData) => {
        const {
            interviewCount,
            highestScore,
            scoreImprovement,
            weekendInterviews,
            feedbackImplemented
        } = userData;

        const updatedBadges = badges.map(badge => {
            switch(badge.id) {
                case 1: return { ...badge, unlocked: interviewCount >= 1 };
                case 2: return { ...badge, unlocked: interviewCount >= 3 };
                case 3: return { ...badge, unlocked: interviewCount >= 5 };
                case 4: return { ...badge, unlocked: highestScore >= 80 };
                case 5: return { ...badge, unlocked: highestScore >= 90 };
                case 6: return { ...badge, unlocked: scoreImprovement >= 20 };
                case 7: return { ...badge, unlocked: weekendInterviews > 0 };
                case 8: return { ...badge, unlocked: feedbackImplemented };
                default: return badge;
            }
        });
        setBadges(updatedBadges);
    };

    // Simulate fetching user data (replace with actual API call)
    useEffect(() => {
        // This would be replaced with actual API call
        const mockUserData = {
            interviewCount: 2,
            highestScore: 85,
            scoreImprovement: 15,
            weekendInterviews: 1,
            feedbackImplemented: true
        };
        checkBadgeProgress(mockUserData);
    }, []);

    return (
        <section id="badges" className="badges-section">
            <h2 className="badges-heading">
                <span className="icon-wrapper"><FaMedal /></span>
                Your Achievements
            </h2>
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
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Badges;

