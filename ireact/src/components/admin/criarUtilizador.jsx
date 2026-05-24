import { useState, useEffect } from 'react';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import { useNavigate } from 'react-router-dom';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import Footer from '../maincomponents/Footer.jsx';
import PopupModal from '../maincomponents/popupModal.jsx';
import '../../css/styles.css';
import axios from 'axios';
import { getCSRFToken } from '../../utils/csrf.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const AdminCriarUtilizador = () => {
    const { t } = useLanguage();
    const URL_BASE = 'http://localhost:8000';
    const CREATE_USER_URL = `${URL_BASE}/idjango/api/admin/create-user/`;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        role: 'User'
    });
    const [image, setImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [limits, setLimits] = useState({});
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        getFieldLimits().then(data => setLimits(data));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password) {
            setModalConfig({
                isOpen: true,
                title: t('admin.popups.aviso_titulo'),
                message: t('admin.popups.campos_obrigatorios'),
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const nameValidation = validateInput(formData.firstName, limits.user_first_name_max_length || 30);
        if (!nameValidation.isValid) {
            setModalConfig({
                isOpen: true,
                title: t('admin.popups.erro_validacao_titulo'),
                message: `${t('admin.nome')}: ${nameValidation.error}`,
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const lastNameValidation = validateInput(formData.lastName, limits.user_last_name_max_length || 30);
        if (!lastNameValidation.isValid) {
            setModalConfig({
                isOpen: true,
                title: t('admin.popups.erro_validacao_titulo'),
                message: `${t('admin.apelido')}: ${lastNameValidation.error}`,
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const usernameValidation = validateInput(formData.username, limits.user_username_max_length || 30);
        if (!usernameValidation.isValid) {
            setModalConfig({
                isOpen: true,
                title: t('admin.popups.erro_validacao_titulo'),
                message: `${t('admin.username')}: ${usernameValidation.error}`,
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const data = new FormData();
        data.append('firstName', formData.firstName);
        data.append('lastName', formData.lastName);
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', formData.role);
        
        if (image) {
            data.append('imagem', image);
        }

        try {
            const response = await axios.post(CREATE_USER_URL, data, {
                headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (response.status === 201) {
                setModalConfig({
                    isOpen: true,
                    title: t('admin.popups.sucesso_titulo'),
                    message: t('admin.popups.utilizador_criado_msg').replace('{role}', formData.role),
                    onConfirm: () => {
                        setModalConfig({ ...modalConfig, isOpen: false });
                        navigate('/admin/gerir-utilizadores');
                    }
                });
            }
        } catch (error) {
            setModalConfig({
                isOpen: true,
                title: t('admin.popups.erro_titulo'),
                message: error.response?.data?.msg || t('admin.popups.erro_criar_msg'),
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
        }
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">{t('admin.criar_utilizador')}</h1>
                    
                    <div className="create-recipe-container">
                        <form onSubmit={handleSubmit} className="recipe-form-section" style={{ maxWidth: '600px' }}>
                            <div className="form-group">
                                <label>{t('autenticacao.nome')}* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({formData.firstName.length}/{limits.user_first_name_max_length || 30})</span></label>
                                <input 
                                    type="text" 
                                    name="firstName" 
                                    className="input-beige text-black" 
                                    value={formData.firstName} 
                                    onChange={handleChange} 
                                    maxLength={limits.user_first_name_max_length || 30}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('autenticacao.apelido')}* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({formData.lastName.length}/{limits.user_last_name_max_length || 30})</span></label>
                                <input 
                                    type="text" 
                                    name="lastName" 
                                    className="input-beige text-black" 
                                    value={formData.lastName} 
                                    onChange={handleChange} 
                                    maxLength={limits.user_last_name_max_length || 30}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('autenticacao.username')}* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({formData.username.length}/{limits.user_username_max_length || 30})</span></label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    className="input-beige text-black" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    maxLength={limits.user_username_max_length || 30}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('autenticacao.email')}*</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="input-beige text-black" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    maxLength={254}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('autenticacao.password')}*</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        className="input-beige text-black" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        maxLength={128}
                                        style={{ width: '100%', paddingRight: '40px' }}
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                                        title={showPassword ? t('autenticacao.ocultar') || 'Ocultar' : t('autenticacao.mostrar') || 'Mostrar'}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>{t('admin.tabela.permissao')}*</label>
                                <select 
                                    name="role" 
                                    className="input-beige text-black event-metadata-select" 
                                    value={formData.role} 
                                    onChange={handleChange}
                                >
                                    <option value="User">User</option>
                                    <option value="EventOrganizer">EventOrganizer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </form>

                        <div className="recipe-image-section">
                            <div className="form-group admin-create-image-group">
                                <label className="admin-create-image-label">{t('admin.foto_perfil') || 'Foto de Perfil'}</label>
                                <div className="image-upload-placeholder" onClick={() => document.getElementById('profilePicInput').click()}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="admin-create-preview-img" />
                                    ) : (
                                        <div className="admin-create-upload-info">
                                            <span className="admin-create-upload-icon">👤</span>
                                            <span className="image-upload-text">{t('admin.selecionar_foto')}</span>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    id="profilePicInput" 
                                    accept="image/*" 
                                    className="hidden-element" 
                                    onChange={handleImageChange} 
                                />
                            </div>

                            <div className="create-actions-group">
                                <button type="button" className="btn-cancel admin-create-btn-flex" onClick={() => navigate(-1)}>{t('comum.cancelar')}</button>
                                <button type="button" className="btn-create-submit admin-create-btn-flex" onClick={handleSubmit}>{t('admin.criar_utilizador')}</button>
                            </div>
                        </div>
                    </div>
                    <div className="footer-spacer"></div>
          <Footer />
                </main>
            </div>

            <PopupModal 
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
                singleButton={true}
            />
        </div>
    );
};

export default AdminCriarUtilizador;
