import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/styles.css';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import cookieImg from '../../assets/cookie-clicker.gif';

const CookieLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const URL_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/idjango/api';
        
        const fetchLeaderboard = () => {
            axios.get(`${URL_BASE}/cookie-leaderboard/`)
                .then(res => {
                    setLeaderboard(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching cookie leaderboard:", err);
                    setLoading(false);
                });
        };

        // Fetch immediately on mount
        fetchLeaderboard();

        // Auto-refresh every 10 seconds
        const intervalId = setInterval(fetchLeaderboard, 10000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return null; // Or a sleek skeleton loader
    if (!leaderboard || leaderboard.length === 0) return null;

    return (
        <div className="leaderboard-section">
            <div className="leaderboard-header">
                <img src={cookieImg} alt="Cookie" className="leaderboard-cookie-icon" />
                <h2 className="leaderboard-title">Top Cookie Clickers</h2>
            </div>
            <div className="leaderboard-container">
                {leaderboard.map((user, index) => (
                    <div key={user.id} className={`leaderboard-row rank-${index + 1}`}>
                        <div className="leaderboard-rank-wrapper">
                            <span className="leaderboard-rank">
                                {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                        </div>
                        <div className="leaderboard-user-info">
                            <img 
                                src={`http://localhost:8000${user.imagem}`} 
                                alt={user.username} 
                                className="leaderboard-avatar"
                                onError={(e) => { e.target.src = '/defaultProfile.png'; }}
                            />
                            <span className="leaderboard-username">{user.username}</span>
                        </div>
                        <div className="leaderboard-score">
                            <span className="score-value">{user.cookie_clicks.toLocaleString()}</span>
                            <span className="score-label">cookies</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CookieLeaderboard;
