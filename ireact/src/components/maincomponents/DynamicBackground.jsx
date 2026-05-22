import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../css/DynamicBackground.css';

const DynamicBackground = () => {
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.body.classList.contains('dark-mode'));
        checkDarkMode();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') checkDarkMode();
            });
        });
        observer.observe(document.body, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="dynamic-bg-container">
            {/* Dark Mode Layer - Pure CSS Starry Sky */}
            <div className={`dynamic-bg-dark ${isDarkMode ? 'visible' : 'hidden'}`}>
                <div className="nebula nebula-1"></div>
                <div className="nebula nebula-2"></div>
                <div className="nebula nebula-3"></div>
                <div className="nebula nebula-4"></div>
                <div className="stars"></div>
                <div className="stars-2"></div>
                <div className="stars-3"></div>
            </div>
            
            {/* Light Mode Layer - Pure CSS Beachy Fade */}
            <div className={`dynamic-bg-light ${!isDarkMode ? 'visible' : 'hidden'}`}>
            </div>
        </div>
    );
};

export default DynamicBackground;
