import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/popupModal.jsx';
import axios from 'axios';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const Perfil = () => {
  const { t } = useLanguage();
  const URL_BASE = 'http://localhost:8000';
  const URL_UTILIZADOR = `${URL_BASE}/idjango/api/utilizadores/`;
  const URL_DEFAULT_PROFILE = `${URL_BASE}/idjango/media/defaultProfile.png`;
  const URL_LOGOUT = `${URL_BASE}/idjango/api/logout/`;
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
        title: t('perfil.popups.sessao_expirada'),
        message: t('perfil.popups.precisas_autenticado'),
        singleButton: false,
        confirmText: t('autenticacao.login'),
        onConfirm: () => navigate('/login'),
        onCancel: () => navigate('/')
      });
      return;
    }

    // Apenas UM pedido resolve o teu perfil por completo!
    axios.get(`${URL_UTILIZADOR}${userId}`, { withCredentials: true })
      .then(res => {
        setUserData(res.data);
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
            <h1 className="page-title-underline">{t('perfil.titulo')}</h1>

            <div className="profile-layout-container">

              <div className="profile-details-card">
                <div className="user-main-info">
                  <div className="user-avatar-large flex-center-overflow-hidden">
                      <img
                        src={userData.imagem ? (userData.imagem.startsWith('http') ? userData.imagem : `${URL_BASE}${userData.imagem.startsWith('/') ? '' : '/'}${userData.imagem}`) : URL_DEFAULT_PROFILE}
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
                  <span><strong>{t('perfil.email')}:</strong> {userData.email} </span>
                  <br />
                  <span><strong>{t('perfil.biografia')}:</strong> {userData.bio || t('perfil.sem_biografia')}</span>
                </div>

                <div className="profile-actions">
                  <button className="btn-edit-profile" onClick={() => navigate('/perfil/editar-perfil')}>{t('perfil.editar_perfil')}</button>
                  <button className="btn-logout-link" onClick={() => {
                    axios.get(URL_LOGOUT, { withCredentials: true })
                      .then(() => {
                        localStorage.removeItem('utilizadorId');
                        window.dispatchEvent(new Event('authChange'));
                        navigate('/login');
                      })
                      .catch(() => {
                        localStorage.removeItem('utilizadorId');
                        window.dispatchEvent(new Event('authChange'));
                        navigate('/login');
                      });
                  }}>{t('header.sair')}</button>
                </div>
              </div>

              <div className="profile-shortcuts-grid">
                <div className="shortcut-card" onClick={() => navigate('/frigorifico')}>
                  {t('frigorifico.titulo')}
                </div>
                <div className="shortcut-card" onClick={() => navigate('/perfil/minhas-receitas')}>
                  {t('perfil.as_minhas_receitas')}
                </div>
                <div className="shortcut-card" onClick={() => navigate('/perfil/meus-eventos')}>
                  {t('perfil.os_meus_eventos')}
                </div>
                {userData.role === 'Admin' && (
                  <div className="shortcut-card" onClick={() => navigate('/admin/gerir-utilizadores')}>
                    {t('perfil.gerir_utilizadores')}
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
        confirmText={popupConfig.confirmText || t('comum.ok')}
        cancelText={popupConfig.cancelText || t('comum.cancelar')}
        onConfirm={popupConfig.onConfirm}
        onCancel={popupConfig.onCancel}
      />
    </div>
  );
};

export default Perfil;