import { useState, useEffect } from 'react';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import Footer from '../maincomponents/Footer.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const Login = () => {
  
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameLogin, setUsernameLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { t } = useLanguage();
  const [limits, setLimits] = useState({});
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    getFieldLimits().then(data => setLimits(data));
  }, []);

  const URL_BASE = 'http://localhost:8000';
  const SIGN_UP_URL = `${URL_BASE}/idjango/api/signup/`;
  const SIGN_IN_URL = `${URL_BASE}/idjango/api/login/`;

  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameLogin || !passwordLogin) {
      setPopupConfig({
        isOpen: true,
        title: t('autenticacao.popups.campos_falta_titulo'),
        message: t('autenticacao.popups.campos_falta_login_msg'),
        singleButton: true,
        confirmText: t('comum.ok'),
        onConfirm: closePopup
      });
      return;
    }
   
    axios.post(SIGN_IN_URL, { username: usernameLogin, password: passwordLogin }, { withCredentials: true })
      .then((response) => {
        localStorage.setItem('utilizadorId', response.data.utilizadorId);
        window.dispatchEvent(new Event('authChange'));
        console.log('logged in');
        navigate(-1);
      })
    .catch( () => {
        setPopupConfig({
            isOpen: true,
            title: t('autenticacao.popups.erro_login_titulo'),
            message: t('autenticacao.popups.erro_login_msg'),
            singleButton: true,
            confirmText: t('comum.ok'),
            onConfirm: closePopup
        });
    })
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setPopupConfig({
        isOpen: true,
        title: t('autenticacao.popups.campos_falta_titulo'),
        message: t('autenticacao.popups.campos_falta_registo_msg'),
        singleButton: true,
        confirmText: t('comum.ok'),
        onConfirm: closePopup
      });
      return;
    }
    if (password !== confirmPassword) {
      setPopupConfig({
        isOpen: true,
        title: t('autenticacao.popups.erro_password_titulo'),
        message: t('autenticacao.popups.erro_password_msg'),
        singleButton: true,
        confirmText: t('comum.ok'),
        onConfirm: closePopup
      });
      return;
    }

    const nameValidation = validateInput(firstName, limits.user_first_name_max_length || 30);
    if (!nameValidation.isValid) {
      setPopupConfig({
        isOpen: true,
        title: t('autenticacao.popups.erro_validacao_titulo'),
        message: `${t('autenticacao.nome')}: ${nameValidation.error}`,
        singleButton: true,
        confirmText: t('comum.ok'),
        onConfirm: closePopup
      });
      return;
    }

    const lastNameValidation = validateInput(lastName, limits.user_last_name_max_length || 30);
    if (!lastNameValidation.isValid) {
      setPopupConfig({
        isOpen: true,
        title: t('autenticacao.popups.erro_validacao_titulo'),
        message: `${t('autenticacao.apelido')}: ${lastNameValidation.error}`,
        singleButton: true,
        confirmText: t('comum.ok'),
        onConfirm: closePopup
      });
      return;
    }

    const usernameValidation = validateInput(username, limits.user_username_max_length || 30);
    if (!usernameValidation.isValid) {
      setPopupConfig({
        isOpen: true,
        title: t('autenticacao.popups.erro_validacao_titulo'),
        message: `${t('autenticacao.username')}: ${usernameValidation.error}`,
        singleButton: true,
        confirmText: t('comum.ok'),
        onConfirm: closePopup
      });
      return;
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('role', 'User');
      
    axios.post(SIGN_UP_URL, formData, { withCredentials: true }).then( response => {
        console.log('Signup successful!', response.data.msg);
        localStorage.setItem('utilizadorId', response.data.utilizadorId);
        window.dispatchEvent(new Event('authChange'));
        navigate(-1);
    }).catch( (error) => {
        let errorMsg = t('autenticacao.popups.atencao_linguagem_registo');
        if (error.response && error.response.data) {
            if (typeof error.response.data === 'object' && error.response.data.msg) {
                errorMsg = error.response.data.msg;
            } else if (typeof error.response.data === 'string') {
                errorMsg = error.response.data;
            }
        }
        setPopupConfig({
            isOpen: true,
            title: t('receitas.popups.atencao_linguagem_titulo'),
            message: errorMsg,
            singleButton: true,
            confirmText: t('comum.ok'),
            onConfirm: closePopup
        });
    });
  };

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />
        
        <main className="auth-container" style={{ flexDirection: 'column', padding: 0 }}>
          <div style={{ display: 'flex', width: '100%', flex: 1, alignItems: 'flex-start', justifyContent: 'center', padding: '60px 20px', flexWrap: 'wrap', gap: '40px' }}>
          <section className="auth-section">
            <h1 className="auth-title">{t('autenticacao.login')}</h1>
            <form className="auth-form" onSubmit={handleLogin}>
              <input 
                type="text" 
                placeholder={t('autenticacao.username')} 
                className="auth-input" 
                value={usernameLogin}
                onChange={(e) => setUsernameLogin(e.target.value)}
              />
              <div className="auth-password-wrapper">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  placeholder={t('autenticacao.password')} 
                  className="auth-input" 
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                />
                <button type="button" className="auth-password-eye" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label="Mostrar password">
                  {showLoginPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button type="submit" className="btn-auth">{t('autenticacao.login')}</button>
            </form>
          </section>

          <div className="auth-divider">
            <span>{t('autenticacao.ou')}</span>
          </div>


          <section className="auth-section">
            <h1 className="auth-title">{t('autenticacao.registar')}</h1>
            <form className="auth-form" onSubmit={handleRegister}>
              <input 
                type="text" 
                placeholder={t('autenticacao.nome')} 
                className="auth-input" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={limits.user_first_name_max_length || 30}
              />
              <input 
                type="text" 
                placeholder={t('autenticacao.apelido')} 
                className="auth-input" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={limits.user_last_name_max_length || 30}
              />
              <input 
                type="text" 
                placeholder={t('autenticacao.username')} 
                className="auth-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={limits.user_username_max_length || 30}
              />
              <input 
                type="email" 
                placeholder={t('autenticacao.email')} 
                className="auth-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="auth-password-wrapper">
                <input 
                  type={showRegisterPassword ? "text" : "password"} 
                  placeholder={t('autenticacao.password')} 
                  className="auth-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="auth-password-eye" onClick={() => setShowRegisterPassword(!showRegisterPassword)} aria-label="Mostrar password">
                  {showRegisterPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="auth-password-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder={t('autenticacao.confirmar_password')} 
                  className="auth-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />        
                <button type="button" className="auth-password-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Mostrar password">
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <button type="submit" className="btn-auth">{t('autenticacao.registar')}</button>
            </form>
          </section>
          </div>
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

export default Login;
