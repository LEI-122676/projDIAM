import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/styles.css';

// Importação das imagens
import iconeReceitas from '../../assets/receitas.svg';
import iconeEventos from '../../assets/calendario.svg';
import iconeFrigorifico from '../../assets/frigorifico.svg';
import iconePerfil from '../../assets/perfil.svg';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header-section">
        {isOpen && <span className="explore-text">Explorar</span>}

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
          <img src={iconeReceitas} alt="Receitas" className="nav-icon-img" />
          {isOpen && <span className="nav-text">Receitas</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/eventos')}>
          <img src={iconeEventos} alt="Eventos" className="nav-icon-img" />
          {isOpen && <span className="nav-text">Eventos</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/frigorifico')}>
          <img src={iconeFrigorifico} alt="Frigorífico" className="nav-icon-img" />
          {isOpen && <span className="nav-text">Frigorífico</span>}
        </li>

        <li className="nav-item" onClick={() => navigate('/perfil')}>
          <img src={iconePerfil} alt="Perfil" className="nav-icon-img" />
          {isOpen && <span className="nav-text">Perfil</span>}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;