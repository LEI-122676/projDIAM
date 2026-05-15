import  { useState } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const SIGN_UP_URL = 'http://localhost:8000/idjango/api/signup/';
  const SIGN_IN_URL = 'http://localhost:8000/idjango/api/login/';

  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameLogin || !passwordLogin) {
      alert('Por favor, preencha todos os campos de login');
      return;
    }
   
    axios.post(SIGN_IN_URL, { username: usernameLogin, password: passwordLogin }, { withCredentials: true })
      .then((response) => {
        localStorage.setItem('utilizadorId', response.data.utilizadorId);
        console.log('logged in');
        navigate(-1);
      })
    .catch( () => console.log('login failed'))
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos de registo');
      return;
    }
    if (password !== confirmPassword) {
      alert('As passwords não coincidem');
      return;
    }
      
    axios.post(SIGN_UP_URL, { firstName, lastName, username, password, email}, { withCredentials: true }).then( response => {
        console.log('Signup successful!', response.data.msg);
        localStorage.setItem('utilizadorId', response.data.utilizadorId);
        navigate(-1);
    }).catch( err => console.log('Signup failed...', err.response.data.msg));
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
    </div>
  );
};

export default Login;