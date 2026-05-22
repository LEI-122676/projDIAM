import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/styles.css';

import iconeReceitas from '../../assets/receitas.svg';
import iconeEventos from '../../assets/calendario.svg';
import iconeFrigorifico from '../../assets/frigorifico.svg';
import iconePerfil from '../../assets/perfil.svg';
import CookieClicker from './CookieClicker.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  
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
      </ul>

      <CookieClicker sidebarOpen={isOpen} />
    </nav>
  );
};

export default Sidebar;
