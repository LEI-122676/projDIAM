import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/styles.css';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import cookieImg from '../../assets/cookie-clicker.gif';

const CookieLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    const [refreshInterval, setRefreshInterval] = useState(10000);
    const URL_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/idjango/api';

    useEffect(() => {
        // Fetch refresh interval
        fetch('/refresh_intervals.json')
            .then(res => res.json())
            .then(data => {
                if (data.cookie_leaderboard_refresh_ms) {
                    setRefreshInterval(data.cookie_leaderboard_refresh_ms);
                }
            })
            .catch(err => console.error("Error loading refresh config:", err));
    }, []);

    useEffect(() => {
        const fetchLeaderboard = () => {
            axios.get(`${URL_BASE}/cookie-leaderboard/`)
                .then(res => {
                    const sortedData = res.data.sort((a, b) => b.cookie_clicks - a.cookie_clicks);
                    setLeaderboard(sortedData);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching cookie leaderboard:", err);
                    setLoading(false);
                });
        };

        fetchLeaderboard();

        // Refresh at specified interval
        const intervalId = setInterval(fetchLeaderboard, refreshInterval);
        
        return () => clearInterval(intervalId);
    }, [refreshInterval]);

    if (loading) return null; // Or a sleek skeleton loader
    if (!leaderboard) return null;

    const paddedLeaderboard = [...leaderboard];
    while (paddedLeaderboard.length < 5) {
        paddedLeaderboard.push({
            isPlaceholder: true,
            username: "---",
            cookie_clicks: "---"
        });
    }

    return (
        <div className="leaderboard-section">
            <div className="leaderboard-header">
                <img src={cookieImg} alt="Cookie" className="leaderboard-cookie-icon" />
                <h2 className="leaderboard-title">{t('cookie_leaderboard.top_clickers')}</h2>
            </div>
            <div className="leaderboard-container">
                {paddedLeaderboard.map((user, index) => (
                    <div key={user.isPlaceholder ? `placeholder-${index}` : user.username} className={`leaderboard-row rank-${index + 1} ${user.isPlaceholder ? 'placeholder' : ''}`}>
                        <div className="leaderboard-rank-wrapper">
                            <span className="leaderboard-rank">
                                {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                        </div>
                        <div className="leaderboard-user-info">
                            <span className="leaderboard-username">{user.username}</span>
                        </div>
                        <div className="leaderboard-score">
                            <span className="score-value">{user.cookie_clicks.toLocaleString?.() ?? user.cookie_clicks}</span>
                            {!user.isPlaceholder && <span className="score-label">{t('cookie_leaderboard.cookies')}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CookieLeaderboard;
