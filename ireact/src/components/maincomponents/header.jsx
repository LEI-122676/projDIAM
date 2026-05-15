import 'react'; // Adicionado o nome React para garantir compatibilidade
import '../../css/styles.css';
import forks from '../../assets/forks.svg';
import { useNavigate } from 'react-router-dom'; // Importante para a navegação
import { useEffect } from 'react';
import 'react'; // Adicionado o nome React para garantir compatibilidade
import axios from 'axios';
import { useState } from 'react';


const Header = () => {

  const URL_LOGOUT = 'http://localhost:8000/idjango/api/logout/';
  const URL_USER = 'http://localhost:8000/idjango/api/user/';

  const [username, setUsername] = useState(null);


  const handleLogout = () => {
    axios.get(URL_LOGOUT, {withCredentials: true})
    .then( () => setUsername(null), navigate('/'))
    .catch( () => console.log('logout failed'));
  }
  
  useEffect(() => {axios.get(URL_USER, {withCredentials: true})
    .then( response => setUsername(response.data.username))
    .catch( () => console.log("user not logged in"));
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