import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/PopupModal.jsx';
import axios from 'axios';

const Perfil = () => {

  const URL_USER = 'http://localhost:8000/idjango/api/user/';
  const URL_USER_INFO = 'http://localhost:8000/idjango/api/utilizadores/';
  const navigate = useNavigate();

  const userId = localStorage.getItem('utilizadorId');
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  const [userName, setUsername] = useState(null);

  useEffect(() => {
    if (!userId) {
      setPopupConfig({
        isOpen: true,
        title: 'Sessão Expirada',
        message: 'Precisas de estar autenticado para ver o teu perfil.',
        singleButton: false,
        confirmText: 'Login',
        onConfirm: () => navigate('/login'),
        onCancel: () => navigate('/')
      });
    }

    axios.get(URL_USER, {withCredentials: true}).then( response => setUsername(response.data.username)).catch( () => console.log("user not logged in"));
    
  }, [userId, navigate]);

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-profile">
          <h1 className="page-title-underline">O Meu Perfil</h1>

          <div className="profile-layout-container">

            {/* COLUNA ESQUERDA: Cartão de Info */}
            <div className="profile-details-card">
              <div className="user-main-info">
                <div className="user-avatar-large">
                  {/* Ícone de utilizador simples */}
                  <span style={{ fontSize: '50px', color: '#D1CDBC' }}>👤</span>
                </div>
                <div className="user-names">
                  <p >{userName}</p>
                </div>
              </div>

              <hr className="profile-divider" />

              <div className="user-extra-info">
                <h3>Info:</h3>
                <ul>
                  <li>- Info A</li>
                  <li>- Info B</li>
                  <li>- Info C</li>
                  <li>- Info D</li>
                  <li>- Info E</li>
                </ul>
              </div>

              <div className="profile-actions">
                <button className="btn-edit-profile">Editar perfil</button>
                <button className="btn-logout-link" onClick={() => navigate('/')}>Log Out</button>
              </div>
            </div>

            {/* COLUNA DIREITA: Atalhos */}
            <div className="profile-shortcuts-grid">
              <div className="shortcut-card" onClick={() => navigate('/frigorifico')}>
                O meu Frigorífico
              </div>
              <div className="shortcut-card" onClick={() => navigate('/perfil/minhas-receitas')}>
                As minhas Receitas
              </div>
              <div className="shortcut-card" onClick={() => navigate('/eventos')}>
                Os meus Eventos
              </div>
            </div>

          </div>
        </main>
      </div>
      <PopupModal 
        isOpen={popupConfig.isOpen}
        title={popupConfig.title}
        message={popupConfig.message}
        singleButton={popupConfig.singleButton}
        confirmText={popupConfig.confirmText}
        onConfirm={popupConfig.onConfirm}
        onCancel={popupConfig.onCancel}
      />
    </div>
  );
};

export default Perfil;