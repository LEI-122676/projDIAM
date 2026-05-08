import 'react'; // Adicionado o nome React para garantir compatibilidade
import '../../css/styles.css';
import forks from '../../assets/forks.svg';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src={forks} alt="Forks" />
        <span className="brand-name">iFridge</span>
      </div>
      <span className="breadcrumb">Páginas / Perfil</span>
      <div className="auth-group">
        <button className="login-text" onClick={() => window.location.href = '/login'}>
          Registar/Login
        </button>
        <button className="logout-text" onClick={() => window.location.href = '/login'}>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;