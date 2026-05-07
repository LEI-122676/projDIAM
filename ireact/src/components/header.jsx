import 'react'; // Adicionado o nome React para garantir compatibilidade
import '../css/styles.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <div style={{ width: '30px', height: '30px', background: '#2E4A35',  borderRadius: '6px' }}></div>
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