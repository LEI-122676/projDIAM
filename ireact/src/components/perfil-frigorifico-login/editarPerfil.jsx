import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/popupModal.jsx';
import axios from 'axios';
import { getCSRFToken } from '../../utils/csrf.js';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Footer from '../maincomponents/Footer.jsx';

const EditarPerfil = () => {
  const { t } = useLanguage();
  const URL_BASE = 'http://localhost:8000';
  const URL_USER = `${URL_BASE}/idjango/api/user_info/`;
  const URL_USER_INFO = `${URL_BASE}/idjango/api/utilizadores/`;
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('utilizadorId');

  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  const [userData, setUserData] = useState({ username: '', email: '', first_name: '', last_name: '', imagem: '', user: null, frigorifico: null });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [limits, setLimits] = useState({});

  const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));
  
  const showPopup = (title, message) => {
    setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup, onCancel: closePopup });
  };

  useEffect(() => {
    getFieldLimits().then(data => setLimits(data));
  }, []);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    axios.get(`${URL_USER_INFO}${userId}`, { withCredentials: true })
      .then(res => {
        setUserData(res.data);
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
        setEmail(res.data.email || '');
        setBio(res.data.bio || '');
        if (res.data.imagem) {
          const isDefault = res.data.imagem.endsWith('defaultProfile.png') || res.data.imagem.endsWith('defaultProfile.svg');
          const imagePath = isDefault 
            ? `${URL_BASE}/idjango/media/defaultProfile.svg`
            : (res.data.imagem.startsWith('http') ? res.data.imagem : `${URL_BASE}${res.data.imagem.startsWith('/') ? '' : '/'}${res.data.imagem}`);
          setFotoPreview(imagePath);
        }
      })
      .catch(err => console.error("Erro ao carregar perfil (utilizador):", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, navigate]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      showPopup(t('receitas.popups.erro_titulo'), t('perfil.popups.erro_identificacao'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      showPopup(t('receitas.popups.campo_obrigatorio_titulo'), t('perfil.popups.campo_obrigatorio'));
      return;
    }
    if (!emailRegex.test(email)) {
      showPopup(t('perfil.popups.email_invalido_titulo'), t('perfil.popups.email_invalido_msg'));
      return;
    }

    const emailValidation = validateInput(email, limits.user_email_max_length || 254);
    if (!emailValidation.isValid) {
      showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('perfil.email')}: ${emailValidation.error}`);
      return;
    }

    const nameValidation = validateInput(firstName, limits.user_first_name_max_length || 30);
    if (!nameValidation.isValid) {
      showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('perfil.nome')}: ${nameValidation.error}`);
      return;
    }

    const lastNameValidation = validateInput(lastName, limits.user_last_name_max_length || 30);
    if (!lastNameValidation.isValid) {
      showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('perfil.apelido')}: ${lastNameValidation.error}`);
      return;
    }

    const bioValidation = validateInput(bio, limits.utilizador_bio_max_length || 200);
    if (!bioValidation.isValid) {
      showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('perfil.biografia')}: ${bioValidation.error}`);
      return;
    }

    const formDataUtilizador = new FormData();
    formDataUtilizador.append('bio', bio);
    
    if (userData.user) formDataUtilizador.append('user', userData.user);
    if (userData.frigorifico) formDataUtilizador.append('frigorifico', userData.frigorifico);
    
    if (foto instanceof File) {
      formDataUtilizador.append('imagem', foto);
    }

    const dataUser = {
      username: userData.username,
      email: email,
      first_name: firstName,
      last_name: lastName
    };

    const csrfToken = getCSRFToken();

    try {
      await axios.put(`${URL_USER_INFO}${userId}`, formDataUtilizador, {
        headers: { 
          'X-CSRFToken': csrfToken,
          'Content-Type': 'multipart/form-data' 
        },
        withCredentials: true
      });

      await axios.put(`${URL_USER}${userData.user}`, dataUser, {
        headers: { 
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      navigate('/perfil');

    } catch (err) {
      console.error(err);
      const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Erro de conexão ao salvar dados.';
      showPopup(t('perfil.popups.erro_guardar'), detail);
    }
  };

  return (
    <div className="body-wrapper">
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <main className="content-profile">
          <h1 className="page-title-underline">{t('perfil.editar_titulo')}</h1>
          <div className="create-recipe-container">
            
            <div className="recipe-form-section">
              <div className="form-group">
                <label>{t('perfil.nome')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({firstName.length}/{limits.user_first_name_max_length || 30})</span>:</label>
                <input 
                  type="text" 
                  className="input-beige text-black" 
                  placeholder={userData.first_name || t('perfil.o_teu_nome')} 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  maxLength={limits.user_first_name_max_length || 30}
                />
              </div>
              <div className="form-group">
                <label>{t('perfil.apelido')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({lastName.length}/{limits.user_last_name_max_length || 30})</span>:</label>
                <input 
                  type="text" 
                  className="input-beige text-black" 
                  placeholder={userData.last_name || t('perfil.o_teu_apelido')} 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  maxLength={limits.user_last_name_max_length || 30}
                />
              </div>
              <div className="form-group">
                <label>{t('perfil.email')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({email.length}/{limits.user_email_max_length || 254})</span>:</label>
                <input 
                  type="email" 
                  className="input-beige text-black" 
                  placeholder={userData.email || t('perfil.exemplo_email')} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  maxLength={limits.user_email_max_length || 254}
                />
              </div>
              <div className="form-group">
                <label>{t('perfil.biografia')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({bio.length}/{limits.utilizador_bio_max_length || 200})</span>:</label>
                <textarea
                  className="input-beige text-area-bio"
                  placeholder={userData.bio || t('perfil.conta_sobre_ti')}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={limits.utilizador_bio_max_length || 200}
                />
              </div> 
            </div>

            <div className="recipe-image-section">
              <div
                className="image-upload-placeholder"
                onClick={() => fileInputRef.current.click()}
                title={t('perfil.clica_alterar_foto')}
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto de Perfil"
                    className="image-preview-fit"
                  />
                ) : (
                  <div className="avatar-placeholder-container">
                    <div className="avatar-placeholder-icon">👤</div>
                    <p className="text-small">{t('perfil.clica_adicionar_foto')}</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden-element"
                onChange={handleFotoChange}
              />
              
              {foto && (
                <button
                  className="btn-cancel btn-cancel-small"
                  className="mt-8-center"
                  onClick={() => { 
                    setFoto(null); 
                    if (userData.imagem) {
                      const isDefault = userData.imagem.endsWith('defaultProfile.png') || userData.imagem.endsWith('defaultProfile.svg');
                      const imagePath = isDefault
                        ? `${URL_BASE}/idjango/media/defaultProfile.svg`
                        : (userData.imagem.startsWith('http') ? userData.imagem : `${URL_BASE}${userData.imagem.startsWith('/') ? '' : '/'}${userData.imagem}`);
                      setFotoPreview(imagePath);
                    } else {
                      setFotoPreview(null);
                    }
                    fileInputRef.current.value = ''; 
                  }}
                >
                  {t('perfil.cancelar_alteracao')}
                </button>
              )}

              <div className="create-actions-group">
                <button className="btn-cancel" onClick={() => navigate(-1)}>{t('comum.cancelar')}</button>
                <button className="btn-create-submit" onClick={handleSubmit}>{t('receitas.detalhes.guardar')}</button>
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

export default EditarPerfil;