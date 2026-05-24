import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import cookieImg from '../../assets/cookie-clicker.gif';
import { getCSRFToken } from '../../utils/csrf.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

let cachedCount = null;
let cachedUserId = undefined; 

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

// Helper to check the correct storage engine based on whether a user exists
const getStorageItem = (key, isUser) => {
  return isUser ? localStorage.getItem(key) : sessionStorage.getItem(key);
};

const setStorageItem = (key, value, isUser) => {
  if (isUser) {
    localStorage.setItem(key, value);
  } else {
    sessionStorage.setItem(key, value);
  }
};

const removeStorageItem = (key, isUser) => {
  if (isUser) {
    localStorage.removeItem(key);
  } else {
    sessionStorage.removeItem(key);
  }
};

const CookieClicker = ({ sidebarOpen }) => {
  const { t } = useLanguage();
  const URL_BASE = 'http://localhost:8000';
  const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;
  const URL_CLICK_SOUND = `${URL_BASE}/idjango/media/cookie-clicker-click-sound.mp3`;
  
  const syncIntervalMs = 3000;
  const [utilizadorId, setUtilizadorId] = useState(getSafeUserId);

  const [count, setCount] = useState(() => {
    const currentId = getSafeUserId();
    if (cachedUserId === currentId && cachedCount !== null) {
      return safeParseInt(cachedCount);
    }
    if (currentId) {
      return safeParseInt(getStorageItem(`cookie_clicks_${currentId}`, true));
    } else {
      return safeParseInt(getStorageItem('guest_cookie_clicks', false));
    }
  });

  const [isLoaded, setIsLoaded] = useState(() => {
    const currentId = getSafeUserId();
    return cachedUserId === currentId && cachedCount !== null;
  });
  
  const [isClicking, setIsClicking] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const countRef = useRef(count);
  const lastSyncedCountRef = useRef(count);
  const pendingBaseRef = useRef(count);
  const isLoadedRef = useRef(isLoaded);
  const userIdRef = useRef(utilizadorId);

  const clickAudioRef = useRef(new Audio(URL_CLICK_SOUND));

  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  useEffect(() => {
    userIdRef.current = utilizadorId;
  }, [utilizadorId]);

  // Handle global auth change
  useEffect(() => {
    const handleAuthChange = () => {
      const nextUserId = getSafeUserId();
      
      if (nextUserId !== cachedUserId) {
        // Clear global variable runtime cache
        cachedCount = null;
        cachedUserId = undefined;

        // FIX: If logging out, explicitly clear sessionStorage so guest returns to 0
        if (!nextUserId) {
          removeStorageItem('guest_cookie_clicks', false);
        }

        const storageKey = nextUserId ? `cookie_clicks_${nextUserId}` : 'guest_cookie_clicks';
        const freshClicks = safeParseInt(getStorageItem(storageKey, !!nextUserId));

        setCount(freshClicks);
        countRef.current = freshClicks;
        lastSyncedCountRef.current = freshClicks;
        pendingBaseRef.current = freshClicks;
      }
      
      setUtilizadorId(nextUserId);
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Sync state count to ref, cache, and correct Storage Engine
  useEffect(() => {
    countRef.current = count;
    cachedCount = count;
    cachedUserId = utilizadorId;

    if (isLoaded) {
      if (!utilizadorId) {
        setStorageItem('guest_cookie_clicks', count.toString(), false);
      } else {
        setStorageItem(`cookie_clicks_${utilizadorId}`, count.toString(), true);
      }
    }
  }, [count, utilizadorId, isLoaded]);

  // Load initial click count on mount or identity shifts
  useEffect(() => {
    setIsLoaded(false);
    
    let initialClicks = 0;
    if (cachedUserId === utilizadorId && cachedCount !== null) {
      initialClicks = safeParseInt(cachedCount);
    } else {
      const storageKey = utilizadorId ? `cookie_clicks_${utilizadorId}` : 'guest_cookie_clicks';
      initialClicks = safeParseInt(getStorageItem(storageKey, !!utilizadorId));
    }
    
    setCount(initialClicks);
    countRef.current = initialClicks;
    lastSyncedCountRef.current = initialClicks;
    pendingBaseRef.current = initialClicks;

    if (!utilizadorId) {
      cachedCount = initialClicks;
      cachedUserId = null;
      setIsLoaded(true);
      return;
    }

    axios.get(`${URL_UTILIZADORES}${utilizadorId}`, { withCredentials: true })
      .then(res => {
        const djangoClicks = safeParseInt(res.data.cookie_clicks);
        const pendingClicks = countRef.current - pendingBaseRef.current;
        const trueClicks = djangoClicks + (pendingClicks > 0 ? pendingClicks : 0);
        
        setCount(trueClicks);
        countRef.current = trueClicks;
        lastSyncedCountRef.current = djangoClicks;
        cachedCount = trueClicks;
        cachedUserId = utilizadorId;
        setStorageItem(`cookie_clicks_${utilizadorId}`, trueClicks.toString(), true);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("Error loading user cookie clicks:", err);
        setIsLoaded(true); 
      });
  }, [utilizadorId]);

  // Periodic synchronization interval (every 3 seconds)
  useEffect(() => {
    if (!isLoaded) return;

    const intervalId = setInterval(() => {
      const currentCount = countRef.current;
      const lastSynced = lastSyncedCountRef.current;

      if (currentCount === lastSynced) return;

      if (!utilizadorId) {
        lastSyncedCountRef.current = currentCount;
      } else {
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

  // Emergency synchronization on unmount
  useEffect(() => {
    return () => {
      if (!isLoadedRef.current) return;

      const currentCount = countRef.current;
      const lastSynced = lastSyncedCountRef.current;
      const actingUserId = userIdRef.current;
      
      if (currentCount !== lastSynced) {
        if (!actingUserId) {
          setStorageItem('guest_cookie_clicks', currentCount.toString(), false);
        } else {
          axios.patch(`${URL_UTILIZADORES}${actingUserId}`, 
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
  }, []);

  const handleCookieClick = (e) => {
    setCount(prev => (safeParseInt(prev) || 0) + 1);

    const clickAudio = new Audio(URL_CLICK_SOUND);
    clickAudio.currentTime = 0;
    clickAudio.play().catch(err => console.error("Sound playback failed:", err)); 

    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newFloatingText = {
      id: Date.now() + Math.random(),
      x,
      y
    };

    setFloatingTexts(prev => [...prev, newFloatingText]);

    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newFloatingText.id));
    }, 800);
  };

  return (
    <div className="cookie-clicker-container">
      {sidebarOpen && <div className="cookie-title">{t('cookies.fome_de_cookies')}</div>}
      
      <div className="cookie-wrapper" onClick={handleCookieClick} style={{ position: 'relative', display: 'inline-block' }}>
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
        {/* Badge with the number of clicks */}
        <span 
          className="cookie-badge" 
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-10px',
            background: 'var(--brand-color, #E85D04)',
            color: 'white',
            borderRadius: '12px',
            padding: '2px 6px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            zIndex: 10
          }}
        >
          {safeParseInt(count)}
        </span>
      </div>

      <div className="cliques-display" style={{ marginTop: '8px' }}>
        {sidebarOpen && (
          <span className="counter-label">{t('cookies.cliques')}</span>
        )}
      </div>
    </div>
  );
};

export default CookieClicker;