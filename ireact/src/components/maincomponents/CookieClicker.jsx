import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cookieImg from '../../assets/cookie-clicker.gif';
import { getCSRFToken } from '../../utils/csrf.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

// Module-level cache to persist click counts across component mount/unmount (e.g. during page navigation)
// without losing unsynced clicks or causing race conditions.
let cachedCount = null;
let cachedUserId = undefined; // undefined = uninitialized, null = guest, number/string = user

const safeParseInt = (val) => {
  if (val === null || val === undefined || val === 'null' || val === 'undefined' || val === 'NaN') return 0;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const getSafeUserId = () => {
  const id = localStorage.getItem('utilizadorId');
  if (id === 'null' || id === 'undefined' || !id) return null;
  return id;
};

const CookieClicker = ({ sidebarOpen }) => {
  const { t } = useLanguage();
  const URL_BASE = 'http://localhost:8000';
  const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;
  const URL_CLICK_SOUND = `${URL_BASE}/idjango/media/cookie-clicker-click-sound.mp3`;

  const [utilizadorId, setUtilizadorId] = useState(getSafeUserId);

  // Initialize count state from cache or localStorage if possible, to avoid rendering 0/stale value
  const [count, setCount] = useState(() => {
    if (cachedUserId === utilizadorId && cachedCount !== null) {
      return safeParseInt(cachedCount);
    }
    if (utilizadorId) {
      return safeParseInt(localStorage.getItem(`cookie_clicks_${utilizadorId}`));
    } else {
      return safeParseInt(localStorage.getItem('guest_cookie_clicks'));
    }
  });

  const [isLoaded, setIsLoaded] = useState(() => {
    // If cache is valid, we are already loaded!
    return cachedUserId === utilizadorId && cachedCount !== null;
  });
  const [isClicking, setIsClicking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);

  // Use refs to track values across the periodic sync interval without resetting it
  const countRef = useRef(count);
  const lastSyncedCountRef = useRef(count);
  const pendingBaseRef = useRef(count); // Keeps track of what count was when we started fetching from Django

  useEffect(() => {
    const handleAuthChange = () => {
      setUtilizadorId(getSafeUserId());
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Sync state count to ref, cache, and localStorage
  useEffect(() => {
    countRef.current = count;
    cachedCount = count;
    cachedUserId = utilizadorId;

    if (isLoaded) {
      if (!utilizadorId) {
        localStorage.setItem('guest_cookie_clicks', count.toString());
      } else {
        localStorage.setItem(`cookie_clicks_${utilizadorId}`, count.toString());
      }
    }
  }, [count, utilizadorId, isLoaded]);

  // Load initial click count on mount or login change
  useEffect(() => {
    setIsLoaded(false);
    if (utilizadorId) {
      // First try to load from localStorage or cache as fallback so the UI is never blank
      let initialClicks = 0;
      if (cachedUserId === utilizadorId && cachedCount !== null) {
        initialClicks = safeParseInt(cachedCount);
      } else {
        initialClicks = safeParseInt(localStorage.getItem(`cookie_clicks_${utilizadorId}`));
      }
      setCount(initialClicks);
      countRef.current = initialClicks;
      lastSyncedCountRef.current = initialClicks;
      pendingBaseRef.current = initialClicks;

      axios.get(`${URL_UTILIZADORES}${utilizadorId}`, { withCredentials: true })
        .then(res => {
          const djangoClicks = safeParseInt(res.data.cookie_clicks);
          
          // Number of clicks the user made WHILE the fetch request was pending
          const pendingClicks = countRef.current - pendingBaseRef.current;
          
          // True clicks: whatever Django has + the clicks we just made right now
          const trueClicks = djangoClicks + (pendingClicks > 0 ? pendingClicks : 0);
          
          setCount(trueClicks);
          countRef.current = trueClicks;
          
          // The database currently holds 'djangoClicks'. We have 'trueClicks'. 
          // Setting lastSyncedCountRef to djangoClicks ensures that the difference (if pendingClicks > 0) will be patched.
          lastSyncedCountRef.current = djangoClicks;
          cachedCount = trueClicks;
          cachedUserId = utilizadorId;
          localStorage.setItem(`cookie_clicks_${utilizadorId}`, trueClicks.toString());
          setIsLoaded(true);
        })
        .catch(err => {
          console.error("Error loading user cookie clicks:", err);
          setIsLoaded(true);
        });
    } else {
      const clicks = safeParseInt(localStorage.getItem('guest_cookie_clicks'));
      setCount(clicks);
      countRef.current = clicks;
      lastSyncedCountRef.current = clicks;
      cachedCount = clicks;
      cachedUserId = null;
      setIsLoaded(true);
    }
  }, [utilizadorId]);

  const [syncIntervalMs, setSyncIntervalMs] = useState(3000);

  useEffect(() => {
    fetch('/refresh_intervals.json')
      .then(res => res.json())
      .then(data => {
        if (data.cookie_clicker_sync_ms) setSyncIntervalMs(data.cookie_clicker_sync_ms);
      })
      .catch(err => console.error("Error loading refresh config:", err));
  }, []);

  // Periodic synchronization interval
  useEffect(() => {
    if (!isLoaded) return;

    const intervalId = setInterval(() => {
      const currentCount = countRef.current;
      const lastSynced = lastSyncedCountRef.current;

      if (currentCount === lastSynced) return;

      if (!utilizadorId) {
        // Guest user: save to localStorage (already done in click effect, but sync lastSynced count)
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
    }, syncIntervalMs);

    return () => clearInterval(intervalId);
  }, [isLoaded, utilizadorId, syncIntervalMs]);

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
    // Increment local state counter immediately and save directly to localStorage
    setCount(prev => {
      const next = (safeParseInt(prev) || 0) + 1;
      if (!utilizadorId) {
        localStorage.setItem('guest_cookie_clicks', next.toString());
      } else {
        localStorage.setItem(`cookie_clicks_${utilizadorId}`, next.toString());
      }
      return next;
    });

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
      {sidebarOpen && <div className="cookie-title">{t('cookies.fome_de_cookies')}</div>}
      
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

      <div className="cliques-display">
        {sidebarOpen ? (
          <>
            <span className="counter-label">{t('cookies.cliques')}</span>
            <span className="counter-number">{safeParseInt(count)}</span>
          </>
        ) : (
          <span className="counter-number-mini">{safeParseInt(count)}</span>
        )}
      </div>
    </div>
  );
};

export default CookieClicker;
