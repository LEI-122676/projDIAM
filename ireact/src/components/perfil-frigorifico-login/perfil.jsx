import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/popupModal.jsx';
import axios from 'axios';

const Perfil = () => {
  const URL_UTILIZADOR = 'http://localhost:8000/idjango/api/utilizadores/';
  const navigate = useNavigate();

  const userId = localStorage.getItem('utilizadorId');
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });

  // Guardamos tudo num único estado centralizado
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    imagem: '',
    bio: '',
    role: ''
  });

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
      return;
    }

    // Apenas UM pedido resolve o teu perfil por completo!
    axios.get(`${URL_UTILIZADOR}${userId}`, { withCredentials: true })
      .then(res => {
        setUserData(res.data);
        console.log("Dados Completos do Perfil:", res.data);
      })
      .catch(err => {
        console.error("Erro ao carregar perfil:", err);
      });
  }, [userId, navigate]);

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-profile">
          <div className="profile-container-inner">
            <h1 className="page-title-underline">O Meu Perfil</h1>

            <div className="profile-layout-container">

              <div className="profile-details-card">
                <div className="user-main-info">
                  <div className="user-avatar-large flex-center-overflow-hidden">
                      <img
                        src={userData.imagem ? (userData.imagem.startsWith('http') ? userData.imagem : `http://localhost:8000${userData.imagem.startsWith('/') ? '' : '/'}${userData.imagem}`) : `http://localhost:8000/idjango/media/defaultProfile.png`}
                        alt="Imagem do utilizador"
                        className="cover-image-large-rounded"
                      />
                  </div>
                  <div className="user-names">
                    {/* Usamos first_name e last_name que vêm mapeados do teu Serializer */}
                    <h2 className="profile-name-text">{userData.first_name} {userData.last_name}</h2>
                    <p className="profile-username-text">Username: {userData.username}</p>
                  </div>
                </div>

                <hr className="profile-divider" />

                <div className="user-extra-info">
                  {/* Puxa diretamente do serializer também */}
                  <span><strong>Email:</strong> {userData.email} </span>
                  <br />
                  <span><strong>Biografia:</strong> {userData.bio || "Sem biografia definida."}</span>
                </div>

                <div className="profile-actions">
                  <button className="btn-edit-profile" onClick={() => navigate('/perfil/editar-perfil')}>Editar perfil</button>
                  <button className="btn-logout-link" onClick={() => {
                    axios.get('http://localhost:8000/idjango/api/logout/', { withCredentials: true })
                      .then(() => {
                        localStorage.removeItem('utilizadorId');
                        navigate('/login');
                        window.location.reload();
                      })
                      .catch(() => {
                        localStorage.removeItem('utilizadorId');
                        navigate('/login');
                        window.location.reload();
                      });
                  }}>Log Out</button>
                </div>
              </div>

              <div className="profile-shortcuts-grid">
                <div className="shortcut-card" onClick={() => navigate('/frigorifico')}>
                  O meu Frigorífico
                </div>
                <div className="shortcut-card" onClick={() => navigate('/perfil/minhas-receitas')}>
                  As minhas Receitas
                </div>
                <div className="shortcut-card" onClick={() => navigate('/perfil/meus-eventos')}>
                  Os meus Eventos
                </div>
                {userData.role === 'Admin' && (
                  <div className="shortcut-card" onClick={() => navigate('/admin/gerir-utilizadores')}>
                    Gerir Utilizadores
                  </div>
                )}
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