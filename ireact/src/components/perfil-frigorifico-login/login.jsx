import  { useState } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';

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

  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

  const SIGN_UP_URL = 'http://localhost:8000/idjango/api' + '/signup/';
  const SIGN_IN_URL = 'http://localhost:8000/idjango/api' + '/login/';

  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameLogin || !passwordLogin) {
      setPopupConfig({
        isOpen: true,
        title: 'Campos em Falta',
        message: 'Por favor, preenche todos os campos de login.',
        singleButton: true,
        onConfirm: closePopup
      });
      return;
    }
   
    axios.post(SIGN_IN_URL, { username: usernameLogin, password: passwordLogin }, { withCredentials: true })
      .then((response) => {
        localStorage.setItem('utilizadorId', response.data.utilizadorId);
        console.log('logged in');
        navigate(-1);
      })
    .catch( () => {
        setPopupConfig({
            isOpen: true,
            title: 'Erro de Login',
            message: 'Credenciais inválidas. Tenta novamente.',
            singleButton: true,
            onConfirm: closePopup
        });
    })
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      setPopupConfig({
        isOpen: true,
        title: 'Campos em Falta',
        message: 'Por favor, preenche todos os campos de registo.',
        singleButton: true,
        onConfirm: closePopup
      });
      return;
    }
    if (password !== confirmPassword) {
      setPopupConfig({
        isOpen: true,
        title: 'Erro na Password',
        message: 'As passwords não coincidem.',
        singleButton: true,
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
        navigate(-1);
    }).catch( (error) => {
        let errorMsg = 'Por favor, tenha atenção à sua linguagem. Não são permitidos palavrões, links ou anúncios no registo.';
        if (error.response && error.response.data) {
            if (typeof error.response.data === 'object' && error.response.data.msg) {
                errorMsg = error.response.data.msg;
            } else if (typeof error.response.data === 'string') {
                errorMsg = error.response.data;
            }
        }
        setPopupConfig({
            isOpen: true,
            title: 'Atenção à Linguagem',
            message: errorMsg,
            singleButton: true,
            onConfirm: closePopup
        });
    });
  };

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />
        
        <main className="auth-container">

          <section className="auth-section">
            <h1 className="auth-title">Login</h1>
            <form className="auth-form" onSubmit={handleLogin}>
              <input 
                type="text" 
                placeholder="Username" 
                className="auth-input" 
                value={usernameLogin}
                onChange={(e) => setUsernameLogin(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="auth-input" 
                value={passwordLogin}
                onChange={(e) => setPasswordLogin(e.target.value)}
              />
              <button type="submit" className="btn-auth">Login</button>
            </form>
          </section>

          <div className="auth-divider">
            <span>OU</span>
          </div>


          <section className="auth-section">
            <h1 className="auth-title">Registar</h1>
            <form className="auth-form" onSubmit={handleRegister}>
              <input 
                type="text" 
                placeholder="Nome" 
                className="auth-input" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Apelido" 
                className="auth-input" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Username" 
                className="auth-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="auth-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="auth-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input 
                type="password" 
                placeholder="Confirmar Password" 
                className="auth-input" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />        
              <button type="submit" className="btn-auth">Registar</button>
            </form>
          </section>
        </main>
      </div>

      <PopupModal
        isOpen={popupConfig.isOpen}
        title={popupConfig.title}
        message={popupConfig.message}
        singleButton={popupConfig.singleButton}
        confirmText="OK"
        onConfirm={popupConfig.onConfirm}
        onCancel={popupConfig.onCancel}
      />
    </div>
  );
};

export default Login;
