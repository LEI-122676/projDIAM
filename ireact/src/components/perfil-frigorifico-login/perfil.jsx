import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/PopupModal.jsx';
import axios from 'axios';

const Perfil = () => {

  const URL_USER = import.meta.env.VITE_API_BASE_URL + '/user_info/';
  const URL_USER_INFO = import.meta.env.VITE_API_BASE_URL + '/utilizadores/';
  const navigate = useNavigate();

  const userId = localStorage.getItem('utilizadorId');
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  
  // CORREÇÃO: bio e imagem pertencem a userData (Utilizador)
  const [userData, setUserData] = useState({ nome: '', apelido: '', imagem: '', bio: '' });
  // CORREÇÃO: username e email pertencem a userInfo (User base)
  const [userInfo, setUserInfo] = useState({ username: '', email: '' });

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

    // Buscar info detalhada do utilizador (Tabela Utilizador: nome, apelido, imagem, bio)
    axios.get(`${URL_USER_INFO}${userId}`, { withCredentials: true })
      .then(res => {
        setUserData(res.data);
        console.log("Dados do Utilizador:", res.data);
      })
      .catch(err => {
        console.error("Erro ao carregar perfil (utilizador):", err);
      });

    // Buscar info da tabela User base (username, email)
    axios.get(`${URL_USER}${userId}`, { withCredentials: true })
      .then(res => {
        setUserInfo(res.data);
        console.log("Dados do User base:", res.data);
      })
      .catch(err => {
        console.error("Erro ao carregar perfil (user base):", err);
      });
  }, [userId, navigate]);

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-profile">
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <h1 className="page-title-underline">O Meu Perfil</h1>

            <div className="profile-layout-container">

            {/* COLUNA ESQUERDA: Cartão de Info */}
            <div className="profile-details-card">
              <div className="user-main-info">
                <div className="user-avatar-large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {/* CORREÇÃO: Se houver imagem em userData, mostra a tag img. Se não, mostra o boneco */}
                    <img 
                      src={userData.imagem ? (userData.imagem.startsWith('http') ? userData.imagem : `${import.meta.env.VITE_MEDIA_BASE_URL}${userData.imagem.startsWith('/') ? '' : '/'}${userData.imagem}`) : `${import.meta.env.VITE_MEDIA_BASE_URL}/idjango/media/defaultProfile.png`} 
                      alt="Imagem do utilizador" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} 
                    />
                </div>
                <div className="user-names">
                  <h2 style={{ color: '#2E4A35', margin: 0 }}>{userData.nome} {userData.apelido}</h2>
                  <p style={{ color: '#716259', fontSize: '0.9rem' }}>Username: {userData.username}</p>
                </div>
              </div>

              <hr className="profile-divider" />

              <div className="user-extra-info">
                <span><strong>Email:</strong> {userData.email} </span>
                <br />
                {/* CORREÇÃO: bio vem de userData */}
                <span><strong>Biografia:</strong> {userData.bio || "Sem biografia definida."}</span>
              </div>

              <div className="profile-actions">
                <button className="btn-edit-profile" onClick={() => navigate('/perfil/editar-perfil')}>Editar perfil</button>
                <button className="btn-logout-link" onClick={() => {
                  axios.get(import.meta.env.VITE_API_BASE_URL + '/logout/', { withCredentials: true })
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

            {/* COLUNA DIREITA: Atalhos */}
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