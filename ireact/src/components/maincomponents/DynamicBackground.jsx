import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../../css/DynamicBackground.css';

const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
};

const StarrySkyCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        const setCanvasSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        setCanvasSize();

        const numStars = 500;
        const stars = [];
        
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5,
                // Super slow, uniform drift (moving up and left)
                vx: 0.02 + Math.random() * 0.04,
                vy: 0.01 + Math.random() * 0.02,
                opacity: Math.random(),
                twinkleSpeed: 0.002 + Math.random() * 0.01,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                // Only whites and warm whites, no blue
                color: Math.random() > 0.5 ? '#ffffff' : '#fff4e6'
            });
        }

        // Nebula Clouds (explosions of colours)
        const nebulas = [
            { x: width * 0.2, y: height * 0.3, radius: 450, r: 138, g: 43, b: 226, vx: 0.05 }, // Purple
            { x: width * 0.8, y: height * 0.7, radius: 550, r: 255, g: 20, b: 147, vx: -0.03 }, // Deep Pink
            { x: width * 0.5, y: height * 0.5, radius: 650, r: 0, g: 191, b: 255, vx: 0.02 },  // Deep Sky Blue
            { x: width * 0.7, y: height * 0.2, radius: 400, r: 255, g: 140, b: 0, vx: -0.04 }   // Dark Orange
        ];

        let time = 0;

        const render = () => {
            time += 0.01;
            ctx.clearRect(0, 0, width, height);
            
            // Draw Nebulas (explosions of colours)
            ctx.globalCompositeOperation = 'screen';
            for (let i = 0; i < nebulas.length; i++) {
                let n = nebulas[i];
                let nx = n.x + Math.sin(time * n.vx) * 100;
                let ny = n.y + Math.cos(time * n.vx) * 50;
                
                const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.radius);
                gradient.addColorStop(0, `rgba(${n.r}, ${n.g}, ${n.b}, 0.08)`);
                gradient.addColorStop(1, `rgba(${n.r}, ${n.g}, ${n.b}, 0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(nx, ny, n.radius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
            
            for (let i = 0; i < numStars; i++) {
                let s = stars[i];
                
                s.opacity += s.twinkleSpeed * s.twinkleDir;
                if (s.opacity <= 0.1) {
                    s.opacity = 0.1;
                    s.twinkleDir = 1;
                } else if (s.opacity >= 1) {
                    s.opacity = 1;
                    s.twinkleDir = -1;
                }
                
                s.x -= s.vx; // Move left
                s.y -= s.vy; // Move up
                
                if (s.x < 0) s.x = width;
                if (s.y < 0) s.y = height;
                
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${hexToRgb(s.color)}, ${s.opacity})`;
                ctx.fill();
            }
            
            animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        window.addEventListener('resize', setCanvasSize);
        return () => {
            window.removeEventListener('resize', setCanvasSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

const BeachSandCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        const setCanvasSize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        setCanvasSize();

        const numGrains = 700;
        const grains = [];
        
        for (let i = 0; i < numGrains; i++) {
            // Distribute grains mostly in the bottom half
            const yPos = height - (Math.random() * (height * 0.6)); 
            grains.push({
                x: Math.random() * width,
                y: yPos,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.6 + 0.2,
                twinkleSpeed: 0.002 + Math.random() * 0.008,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                color: Math.random() > 0.7 ? '#ffffff' : (Math.random() > 0.5 ? '#ffe8b5' : '#e6c883') // Sand colors
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Draw glowing sun
            const sunGradient = ctx.createRadialGradient(width * 0.85, height * 0.15, 0, width * 0.85, height * 0.15, 400);
            sunGradient.addColorStop(0, 'rgba(255, 240, 180, 0.5)');
            sunGradient.addColorStop(1, 'rgba(255, 240, 180, 0)');
            ctx.fillStyle = sunGradient;
            ctx.fillRect(0, 0, width, height);

            // Draw glowing sand particles
            for (let i = 0; i < numGrains; i++) {
                let g = grains[i];
                
                g.opacity += g.twinkleSpeed * g.twinkleDir;
                if (g.opacity <= 0.1) {
                    g.opacity = 0.1;
                    g.twinkleDir = 1;
                } else if (g.opacity >= 0.8) {
                    g.opacity = 0.8;
                    g.twinkleDir = -1;
                }
                
                ctx.beginPath();
                ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${hexToRgb(g.color)}, ${g.opacity})`;
                ctx.fill();
            }
            
            animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        window.addEventListener('resize', setCanvasSize);
        return () => {
            window.removeEventListener('resize', setCanvasSize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />;
};

const DynamicBackground = () => {
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const isHomepage = location.pathname === '/';

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
            {/* Dark Mode Layer - Deep Space */}
            <div className="dynamic-bg-dark" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: isDarkMode ? 1 : 0, transition: 'opacity 1.5s ease-in-out', zIndex: isDarkMode ? 2 : 1
            }}>
                <StarrySkyCanvas />
            </div>
            
            {/* Light Mode Layer - Sunny Sand Beach */}
            <div className="dynamic-bg-light" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                opacity: !isDarkMode ? 1 : 0, transition: 'opacity 1.5s ease-in-out', zIndex: !isDarkMode ? 2 : 1
            }}>
                <BeachSandCanvas />
            </div>
        </div>
    );
};

export default DynamicBackground;
