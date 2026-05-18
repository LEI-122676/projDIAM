import 'react'; // Adicionado o nome React para garantir compatibilidade
import '../../css/styles.css';
import forks from '../../assets/forks.svg';
import { useNavigate } from 'react-router-dom'; // Importante para a navegação
import { useEffect } from 'react';
import 'react'; // Adicionado o nome React para garantir compatibilidade
import axios from 'axios';
import { useState } from 'react';


const Header = () => {

  const URL_LOGOUT = import.meta.env.VITE_API_BASE_URL + '/logout/';
  const URL_USER = import.meta.env.VITE_API_BASE_URL + '/user/';

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
        navigate('/');
      })
      .catch(() => {
        console.log('logout failed');
        localStorage.removeItem('utilizadorId');
        navigate('/');
      });
  }

  useEffect(() => {
    axios.get(URL_USER, { withCredentials: true })
      .then(response => {
        setUsername(response.data.username);
        if (!response.data.username) {
          localStorage.removeItem('utilizadorId');
        }
      })
      .catch(() => {
        console.log("user not logged in");
        localStorage.removeItem('utilizadorId');
      });
  }, []);

  const navigate = useNavigate(); 

  return (
    <header className="header">
      <button onClick={() => navigate('/')} className="logo">
        <img src={forks} alt="Forks" />
        <span className="brand-name">iFridge</span>
      </button>
      <span className="breadcrumb">Páginas / Perfil</span>
      <div className="auth-group">
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <>
        {username ?
        <>
        <button className="logout-text" onClick={() => handleLogout()}>
          Sair, {username}
        </button>
        </>:
        <>
        <button className="login-text" onClick={() => navigate('/login')}>
          Registar/Login
        </button>
        </>
        }
        </>
      </div>
    </header>
  );
};

export default Header;