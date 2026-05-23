import 'react';
import '../../css/styles.css';
import forks from '../../assets/forks.svg';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const Header = () => {
  const URL_BASE = 'http://localhost:8000';
  const URL_LOGOUT = `${URL_BASE}/idjango/api/logout/`;
  const URL_USER = `${URL_BASE}/idjango/api/user/`;

  const [username, setUsername] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };


  const handleLogout = () => {
    axios.get(URL_LOGOUT, { withCredentials: true })
      .then(() => {
        setUsername(null);
        localStorage.removeItem('utilizadorId');
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
      })
      .catch(() => {
        console.log('logout failed');
        localStorage.removeItem('utilizadorId');
        window.dispatchEvent(new Event('authChange'));
        navigate('/');
      });
  }

  useEffect(() => {
    axios.get(URL_USER, { withCredentials: true })
      .then(response => {
        setUsername(response.data.username);
        if (response.data.username && response.data.utilizadorId) {
          localStorage.setItem('utilizadorId', response.data.utilizadorId);
          window.dispatchEvent(new Event('authChange'));
        } else {
          localStorage.removeItem('utilizadorId');
          window.dispatchEvent(new Event('authChange'));
        }
      })
      .catch(() => {
        console.log("user not logged in");
        localStorage.removeItem('utilizadorId');
        window.dispatchEvent(new Event('authChange'));
      });
  }, []);

  const navigate = useNavigate();

  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="header">
      <button onClick={() => navigate('/')} className="logo">
        <img src={forks} alt="Forks" />
        <span className="brand-name">iFridge</span>
      </button>
      <div className="auth-group">
        <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="language-selector"
        >
            <option value="pt">🇵🇹 PT</option>
            <option value="en">🇬🇧 EN</option>
            <option value="es">🇪🇸 ES</option>
        </select>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <>
          {username ?
            <>
              <button className="logout-text" onClick={() => handleLogout()}>
                {t('header.sair')}, {username}
              </button>
            </> :
            <>
              <button className="login-text" onClick={() => navigate('/login')}>
                {t('header.registar_login')}
              </button>
            </>
          }
        </>
      </div>
    </header>
  );
};

export default Header;
