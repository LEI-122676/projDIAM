import 'react';
import '../css/styles.css';

// Importação das imagens (ajuste o caminho conforme a sua pasta)
import iconeReceitas from '../assets/receitas.svg';
import iconeEventos from '../assets/calendario.svg';
import iconePerfil from '../assets/perfil.svg';
import iconeFrigorifico from '../assets/frigorifico.svg';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul className="nav-list">
        <li className="nav-item">
          <img src={iconeReceitas} alt="Receitas" className="nav-icon-img" />
          <span>Receitas</span>
        </li>
        <li className="nav-item">
          <img src={iconeEventos} alt="Eventos" className="nav-icon-img" />
          <span>Eventos</span>
        </li>
        <li className="nav-item">
          <img src={iconeFrigorifico} alt="Frigorífico" className="nav-icon-img" />
          <span>Frigorífico</span>
        </li>
        <li className="nav-item">
          <img src={iconePerfil} alt="Perfil" className="nav-icon-img" />
          <span>Perfil</span>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;