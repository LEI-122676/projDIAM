import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/popupModal.jsx';
import axios from 'axios';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Footer from '../maincomponents/Footer.jsx';

const Perfil = () => {
  const { t } = useLanguage();
  const URL_BASE = 'http://localhost:8000';
  const URL_UTILIZADOR = `${URL_BASE}/idjango/api/utilizadores/`;
  const URL_DEFAULT_PROFILE = `${URL_BASE}/idjango/media/defaultProfile.svg`;
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
                        src={!userData.imagem || userData.imagem.endsWith('defaultProfile.png') || userData.imagem.endsWith('defaultProfile.svg')
                          ? URL_DEFAULT_PROFILE
                          : (userData.imagem.startsWith('http') ? userData.imagem : `${URL_BASE}${userData.imagem.startsWith('/') ? '' : '/'}${userData.imagem}`)}
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

                <div className="profile-info-section">
                  <div className="profile-info-item">
                    <div className="profile-info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div className="profile-info-content">
                      <span className="profile-info-label">{t('perfil.email')}</span>
                      <span className="profile-info-value">{userData.email}</span>
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <div className="profile-info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="info-icon">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    </div>
                    <div className="profile-info-content">
                      <span className="profile-info-label">{t('perfil.biografia')}</span>
                      <div className="profile-info-value">
                        {userData.bio ? (
                          <p className="profile-bio-text">{userData.bio}</p>
                        ) : (
                          <span className="profile-no-bio">{t('perfil.sem_biografia')}</span>
                        )}
                      </div>
                    </div>
                  </div>
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
            
            <div className="footer-spacer"></div>
          <Footer />
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