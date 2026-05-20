import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/popupModal.jsx';
import axios from 'axios';
import { getCSRFToken } from '../../utils/csrf.js';

const EditarPerfil = () => {
  const URL_USER = 'http://localhost:8000/idjango/api' + '/user_info/';
  const URL_USER_INFO = 'http://localhost:8000/idjango/api' + '/utilizadores/';
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('utilizadorId');

  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  const [userData, setUserData] = useState({ username: '', nome: '', apelido: '', imagem: '', user: null, frigorifico: null });
  const [userInfo, setUserInfo] = useState({ email: '', username: '' });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));
  
  const showPopup = (title, message) => {
    setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: 'OK', onConfirm: closePopup, onCancel: closePopup });
  };

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

    axios.get(`${URL_USER_INFO}${userId}`, { withCredentials: true })
      .then(res => {
        setUserData(res.data);
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
        setBio(res.data.bio || '');
        if (res.data.imagem) {
          const imagePath = res.data.imagem.startsWith('http') ? res.data.imagem : `http://localhost:8000${res.data.imagem}`;
          setFotoPreview(imagePath);
        }
      })
      .catch(err => console.error("Erro ao carregar perfil (utilizador):", err));

    axios.get(`${URL_USER}${userId}`, { withCredentials: true })
      .then(res => {
        setUserInfo(res.data);
        setEmail(res.data.email || '');
      })
      .catch(err => console.error("Erro ao carregar perfil (user):", err));
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
      showPopup('Erro', 'Utilizador não identificado. Faça login novamente.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      showPopup('Campo Obrigatório', 'Por favor, insira um e-mail.');
      return;
    }
    if (!emailRegex.test(email)) {
      showPopup('E-mail Inválido', 'O formato do e-mail introduzido não é válido.');
      return;
    }

    const formDataUtilizador = new FormData();
    formDataUtilizador.append('nome', firstName);
    formDataUtilizador.append('apelido', lastName);
    formDataUtilizador.append('bio', bio);
    
    if (userData.user) formDataUtilizador.append('user', userData.user);
    if (userData.frigorifico) formDataUtilizador.append('frigorifico', userData.frigorifico);
    
    if (foto instanceof File) {
      formDataUtilizador.append('imagem', foto);
    }

    const dataUser = {
      username: userInfo.username,
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

      await axios.put(`${URL_USER}${userId}`, dataUser, {
        headers: { 
          'X-CSRFToken': csrfToken,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      setPopupConfig({
        isOpen: true,
        title: 'Perfil Atualizado!',
        message: 'As tuas alterações foram salvas com sucesso.',
        singleButton: true,
        confirmText: 'OK',
        onConfirm: () => navigate('/perfil'), 
        onCancel: () => navigate('/perfil')
      });

    } catch (err) {
      console.error(err);
      const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Erro de conexão ao salvar dados.';
      showPopup('Erro ao Guardar', detail);
    }
  };

  return (
    <div className="body-wrapper">
      <Header />
      <div className="main-wrapper">
        <Sidebar />
        <main className="content-profile">
          <h1 className="page-title-underline">Editar Perfil</h1>
          <div className="create-recipe-container">
            
            <div className="recipe-form-section">
              <div className="form-group">
                <label>Nome:</label>
                <input 
                  type="text" 
                  className="input-beige text-black" 
                  placeholder={userData.first_name || "O teu nome"} 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Apelido:</label>
                <input 
                  type="text" 
                  className="input-beige text-black" 
                  placeholder={userData.last_name || "O teu apelido"} 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  className="input-beige text-black" 
                  placeholder={userInfo.email || "exemplo@email.com"} 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Biografia:</label>
                <textarea
                  className="input-beige text-area-bio"
                  placeholder={userData.bio || "Conta um pouco sobre ti..."}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div> 
            </div>

            <div className="recipe-image-section">
              <div
                className="image-upload-placeholder"
                onClick={() => fileInputRef.current.click()}
                title="Clica para alterar a foto de perfil"
              >
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto de Perfil"
                    className="cover-image-large-rounded"
                  />
                ) : (
                  <div className="avatar-placeholder-container">
                    <div className="avatar-placeholder-icon">👤</div>
                    <p className="text-small">Clica para adicionar foto de perfil</p>
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
                    setFotoPreview(userData.imagem || null); 
                    fileInputRef.current.value = ''; 
                  }}
                >
                  Cancelar alteração
                </button>
              )}

              <div className="create-actions-group">
                <button className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
                <button className="btn-create-submit" onClick={handleSubmit}>Guardar</button>
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
        confirmText={popupConfig.confirmText || 'OK'}
        cancelText={popupConfig.cancelText || 'Cancelar'}
        onConfirm={popupConfig.onConfirm}
        onCancel={popupConfig.onCancel}
      />
    </div>
  );
};

export default EditarPerfil;