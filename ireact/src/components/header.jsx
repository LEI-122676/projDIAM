import React from 'react'; // Adicionado o nome React para garantir compatibilidade
import '../css/styles.css';
import forks from '../assets/forks.svg';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src={forks} alt="Forks" />
        <span className="brand-name">iFridge</span>
      </div>
      <span className="breadcrumb">Páginas / Perfil</span>
      <div className="auth-group">
        <span className="login-text">Registar/Login</span>
        <span className="logout-text">Sair</span>
      </div>
    </header>
  );
};

export default Header;