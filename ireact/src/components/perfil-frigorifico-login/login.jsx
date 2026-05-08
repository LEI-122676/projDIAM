import React, { useState } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';

const Login = () => {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameLogin, setUsernameLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameLogin && passwordLogin) {
      console.log('Login bem-sucedido:', { usernameLogin, passwordLogin });
    } else {
      alert('Por favor, preencha todos os campos de login');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (username && email && password && confirmPassword) {
      if (password === confirmPassword) {
        console.log('Registro bem-sucedido:', { username, email, password });
      } else {
        alert('As senhas não coincidem');
      }
    } else {
      alert('Por favor, preencha todos os campos de registo');
    }
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