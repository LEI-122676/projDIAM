import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/styles.css';

import iconeReceitas from '../../assets/receitas.svg';
import iconeEventos from '../../assets/calendario.svg';
import iconeFrigorifico from '../../assets/frigorifico.svg';
import iconePerfil from '../../assets/perfil.svg';
import iconeDashboard from '../../assets/dashboard.svg';
import iconeGerirUsers from '../../assets/edit-user.svg';
import CookieClicker from './CookieClicker.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

import axios from 'axios';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    const userId = localStorage.getItem('utilizadorId');
    if (userId) {
      const URL_BASE = 'http://localhost:8000';
      axios.get(`${URL_BASE}/idjango/api/utilizadores/${userId}`, {withCredentials: true})
        .then(response => setUserRole(response.data.role))
        .catch(err => {
            console.error("Error fetching user role for sidebar", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403 || err.response.status === 404)) {
                localStorage.removeItem('utilizadorId');
            }
        });
    }
  }, []);

  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header-section">
        {isOpen && <span className="explore-text">{t('sidebar.explorar')}</span>}

        <button
          className={`hamburger-btn ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="line"></span>
          <span className="line"></span>
          <span className="line"></span>
        </button>
      </div>

      <ul className="nav-list">
        <li className="nav-item" onClick={() => navigate('/receitas')}>
          <img src={iconeReceitas} alt={t('sidebar.receitas')} className="nav-icon-img" />
          {isOpen && <span className="nav-text">{t('sidebar.receitas')}</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/eventos')}>
          <img src={iconeEventos} alt={t('sidebar.eventos')} className="nav-icon-img" />
          {isOpen && <span className="nav-text">{t('sidebar.eventos')}</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/frigorifico')}>
          <img src={iconeFrigorifico} alt={t('sidebar.frigorifico')} className="nav-icon-img" />
          {isOpen && <span className="nav-text">{t('sidebar.frigorifico')}</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/perfil')}>
          <img src={iconePerfil} alt={t('sidebar.perfil')} className="nav-icon-img" />
          {isOpen && <span className="nav-text">{t('sidebar.perfil')}</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/feedback')}>
          <span className="nav-icon-img" style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</span>
          {isOpen && <span className="nav-text">{t('sidebar.dar_feedback')}</span>}
        </li>
        
        {userRole === 'Admin' && (
          <>
            <li className="nav-item" onClick={() => navigate('/admin/dashboard')}>
              <img src={iconeDashboard} alt="Dashboard" className="nav-icon-img" />
              {isOpen && <span className="nav-text">Dashboard</span>}
            </li>
            <li className="nav-item" onClick={() => navigate('/admin/gerir-utilizadores')}>
              <img src={iconeGerirUsers} alt="Gerir Utilizadores" className="nav-icon-img" />
              {isOpen && <span className="nav-text">{t('admin.gerir_utilizadores') || 'Gerir Utilizadores'}</span>}
            </li>
          </>
        )}
      </ul>

      <CookieClicker sidebarOpen={isOpen} />
    </nav>
  );
};

export default Sidebar;
