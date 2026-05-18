import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css';
import { useNavigate } from 'react-router-dom';
import PopupModal from '../maincomponents/PopupModal.jsx';
import axios from 'axios';

const EditarPerfil = () => {
  const URL_USER = import.meta.env.VITE_API_BASE_URL + '/user_info/';
  const URL_USER_INFO = import.meta.env.VITE_API_BASE_URL + '/utilizadores/';
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('utilizadorId');

  // Estados dos Modais e Dados Originais
  const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
  const [userData, setUserData] = useState({ username: '', nome: '', apelido: '', imagem: '', user: null, frigorifico: null });
  const [userInfo, setUserInfo] = useState({ email: '', username: '' });

  // Estados dos Inputs do Formulário
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  // Estados para Gestão da Imagem de Perfil
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

    // Buscar info detalhada do utilizador (Tabela Utilizadores)
    axios.get(`${URL_USER_INFO}${userId}`, { withCredentials: true })
      .then(res => {
        setUserData(res.data);
        setFirstName(res.data.nome || '');
        setLastName(res.data.apelido || '');
        setBio(res.data.bio || ''); // CORREÇÃO: bio pertence à tabela Utilizador
        if (res.data.imagem) {
          setFotoPreview(res.data.imagem);
        }
      })
      .catch(err => console.error("Erro ao carregar perfil (utilizador):", err));

    // Buscar info da tabela User base do Django
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

  const getCSRFToken = () => {
    return document.cookie.split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };

  // Submissão do Formulário (Guardar Alterações)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      showPopup('Erro', 'Utilizador não identificado. Faça login novamente.');
      return;
    }

    // 1. Validação do Formato do E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      showPopup('Campo Obrigatório', 'Por favor, insira um e-mail.');
      return;
    }
    if (!emailRegex.test(email)) {
      showPopup('E-mail Inválido', 'O formato do e-mail introduzido não é válido.');
      return;
    }

    // 2. CORREÇÃO: Construção dos dados para a tabela Utilizadores
    const formDataUtilizador = new FormData();
    formDataUtilizador.append('nome', firstName);
    formDataUtilizador.append('apelido', lastName);
    formDataUtilizador.append('bio', bio); // Mudado para aqui!
    
    // O Django exige a chave estrangeira do User e do Frigorifico no PUT
    if (userData.user) formDataUtilizador.append('user', userData.user);
    if (userData.frigorifico) formDataUtilizador.append('frigorifico', userData.frigorifico);
    
    if (foto instanceof File) {
      formDataUtilizador.append('imagem', foto);
    }

    // 3. CORREÇÃO: Construção dos dados para a tabela User base (Django)
    const dataUser = {
      username: userInfo.username, // Obrigatório pelo UserSerializer no PUT
      email: email,
      first_name: firstName,
      last_name: lastName
    };

    const csrfToken = getCSRFToken();

    try {
      // Pedido 1: Atualiza Tabela Utilizadores
      await axios.put(`${URL_USER_INFO}${userId}`, formDataUtilizador, {
        headers: { 'X-CSRFToken': csrfToken,'Content-Type': 'multipart/form-data' 
        },
        withCredentials: true
      });

      // Pedido 2: Atualiza Tabela User
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
            
            {/* COLUNA ESQUERDA: Formulário */}
            <div className="recipe-form-section">
              <div className="form-group">
                <label>Nome:</label>
                <input 
                  type="text" 
                  className="input-beige text-black" 
                  placeholder={userData.nome || "O teu nome"} 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Apelido:</label>
                <input 
                  type="text" 
                  className="input-beige text-black" 
                  placeholder={userData.apelido || "O teu apelido"} 
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
                  className="input-beige"
                  placeholder={userData.bio || "Conta um pouco sobre ti..."} // Ajustado placeholder
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ 
                    color: 'black', 
                    height: '150px', 
                    padding: '20px', 
                    resize: 'none'
                  }}
                />
              </div> 
            </div>

            {/* COLUNA DIREITA: Upload da Foto de Perfil + Ações */}
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
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#D1CDBC' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
                    <p style={{ fontSize: '0.9rem' }}>Clica para adicionar foto de perfil</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
              />
              
              {foto && (
                <button
                  className="btn-cancel btn-cancel-small"
                  style={{ marginTop: '8px', alignSelf: 'center' }}
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