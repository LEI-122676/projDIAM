import 'react'; // Adicionado o nome React para garantir compatibilidade
import '../../css/styles.css';
import forks from '../../assets/forks.svg';
import { useNavigate } from 'react-router-dom'; // Importante para a navegação



const Header = () => {
  const navigate = useNavigate(); // Inicializa o hook
  return (
    <header className="header">
      <button onClick={() => navigate('/')} className="logo">
        <img src={forks} alt="Forks" />
        <span className="brand-name">iFridge</span>
      </button>
      <span className="breadcrumb">Páginas / Perfil</span>
      <div className="auth-group">
        <button className="login-text" onClick={() => navigate('/login')}>
          Registar/Login
        </button>
        <button className="logout-text" onClick={() => navigate('/login')}>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;