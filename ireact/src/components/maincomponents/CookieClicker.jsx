import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cookieImg from '../../assets/cookie-clicker.gif';
import { getCSRFToken } from '../../utils/csrf.js';

const CookieClicker = ({ sidebarOpen }) => {
  const URL_BASE = 'http://localhost:8000';
  const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;
  const URL_CLICK_SOUND = `${URL_BASE}/idjango/media/cookie-clicker-click-sound.mp3`;

  const [count, setCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);

  // Use refs to track values across the periodic sync interval without resetting it
  const countRef = useRef(0);
  const lastSyncedCountRef = useRef(0);

  // Sync state count to ref
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const [utilizadorId, setUtilizadorId] = useState(() => localStorage.getItem('utilizadorId'));

  useEffect(() => {
    const handleAuthChange = () => {
      setUtilizadorId(localStorage.getItem('utilizadorId'));
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Load initial click count on mount or login change
  useEffect(() => {
    setIsLoaded(false);
    if (utilizadorId) {
      axios.get(`${URL_UTILIZADORES}${utilizadorId}`, { withCredentials: true })
        .then(res => {
          const clicks = res.data.cookie_clicks || 0;
          setCount(clicks);
          countRef.current = clicks;
          lastSyncedCountRef.current = clicks;
          setIsLoaded(true);
        })
        .catch(err => {
          console.error("Error loading user cookie clicks:", err);
          setIsLoaded(true);
        });
    } else {
      const guestClicks = localStorage.getItem('guest_cookie_clicks');
      const clicks = guestClicks ? parseInt(guestClicks, 10) : 0;
      setCount(clicks);
      countRef.current = clicks;
      lastSyncedCountRef.current = clicks;
      setIsLoaded(true);
    }
  }, [utilizadorId]);

  // Periodic synchronization interval (every 3 seconds)
  useEffect(() => {
    if (!isLoaded) return;

    const intervalId = setInterval(() => {
      const currentCount = countRef.current;
      const lastSynced = lastSyncedCountRef.current;

      if (currentCount === lastSynced) return;

      if (!utilizadorId) {
        // Guest user: save to localStorage
        localStorage.setItem('guest_cookie_clicks', currentCount.toString());
        lastSyncedCountRef.current = currentCount;
      } else {
        // Authenticated user: send PATCH to backend with CSRF token
        axios.patch(`${URL_UTILIZADORES}${utilizadorId}`, 
          { cookie_clicks: currentCount },
          { 
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true 
          }
        )
        .then(() => {
          lastSyncedCountRef.current = currentCount;
        })
        .catch(err => {
          console.error("Error syncing cookie clicks:", err);
        });
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isLoaded, utilizadorId]);

  // Sync on unmount
  useEffect(() => {
    return () => {
      const currentCount = countRef.current;
      const lastSynced = lastSyncedCountRef.current;
      if (currentCount !== lastSynced) {
        if (!utilizadorId) {
          localStorage.setItem('guest_cookie_clicks', currentCount.toString());
        } else {
          axios.patch(`${URL_UTILIZADORES}${utilizadorId}`, 
            { cookie_clicks: currentCount },
            { 
              headers: { 'X-CSRFToken': getCSRFToken() },
              withCredentials: true 
            }
          ).catch(err => {
            console.error("Error syncing cookie clicks on unmount:", err);
          });
        }
      }
    };
  }, [utilizadorId]);

  const handleCookieClick = (e) => {
    // Increment local state counter immediately
    setCount(prev => prev + 1);

    // Play click sound
    const clickAudio = new Audio(URL_CLICK_SOUND);
    clickAudio.currentTime = 0;
    clickAudio.play().catch(err => console.error("Sound playback failed:", err));

    // Trigger bounce animation class
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    // Add floating text at click coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newFloatingText = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setFloatingTexts(prev => [...prev, newFloatingText]);

    // Cleanup floating text after animation finishes
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newFloatingText.id));
    }, 800);
  };

  return (
    <div className="cookie-clicker-container">
      {sidebarOpen && <div className="cookie-title">Fome de Cookies?</div>}
      
      <div className="cookie-wrapper" onClick={handleCookieClick}>
        <img 
          src={cookieImg} 
          alt="Cookie Clicker" 
          className={`cookie-image ${isClicking ? 'clicking' : ''}`} 
          style={!sidebarOpen ? { width: '48px', height: '48px' } : {}}
        />
        {floatingTexts.map(text => (
          <span 
            key={text.id} 
            className="floating-number" 
            style={{ left: text.x, top: text.y }}
          >
            +1
          </span>
        ))}
      </div>

      <div className="cookie-counter">
        {sidebarOpen ? (
          <>
            <span className="counter-label">Cliques:</span>
            <span className="counter-number">{count}</span>
          </>
        ) : (
          <span className="counter-number-mini">{count}</span>
        )}
      </div>
    </div>
  );
};

export default CookieClicker;
