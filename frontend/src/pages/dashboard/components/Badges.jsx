import React from 'react';
import './Badges.css';
import { FaMedal } from 'react-icons/fa';

const Badges = () => {
    return (
        <section id="badges" className="badges-section">
            <h2 className="badges-heading">
                <span className="icon-wrapper"><FaMedal /></span>
                Badges
            </h2>
            <div className="badges-container">
                <div className="badge">
                    <FaMedal className="badge-icon" />
                    <div className="badge-details">
                        <h3>Expert Coder</h3>
                        <p>Awarded for completing 50 coding challenges.</p>
                    </div>
                </div>
                <div className="badge">
                    <FaMedal className="badge-icon" />
                    <div className="badge-details">
                        <h3>Interview Master</h3>
                        <p>Awarded for scoring above 90 in 10 interviews.</p>
                    </div>
                </div>
                {/* New Badge 1 */}
                <div className="badge">
                    <FaMedal className="badge-icon" />
                    <div className="badge-details">
                        <h3>Team Player</h3>
                        <p>Awarded for participating in 5 team projects.</p>
                    </div>
                </div>
                {/* New Badge 2 */}
                <div className="badge">
                    <FaMedal className="badge-icon" />
                    <div className="badge-details">
                        <h3>Continuous Learner</h3>
                        <p>Awarded for completing 20 learning modules.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Badges;
