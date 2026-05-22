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

const AdminCriarUtilizador = () => {
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
                title: 'Aviso',
                message: 'Preencha todos os campos obrigatórios (*).',
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const nameValidation = validateInput(formData.firstName, limits.user_first_name_max_length || 30);
        if (!nameValidation.isValid) {
            setModalConfig({
                isOpen: true,
                title: 'Erro de Validação',
                message: `Nome: ${nameValidation.error}`,
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const lastNameValidation = validateInput(formData.lastName, limits.user_last_name_max_length || 30);
        if (!lastNameValidation.isValid) {
            setModalConfig({
                isOpen: true,
                title: 'Erro de Validação',
                message: `Apelido: ${lastNameValidation.error}`,
                onConfirm: () => setModalConfig({ ...modalConfig, isOpen: false })
            });
            return;
        }

        const usernameValidation = validateInput(formData.username, limits.user_username_max_length || 30);
        if (!usernameValidation.isValid) {
            setModalConfig({
                isOpen: true,
                title: 'Erro de Validação',
                message: `Username: ${usernameValidation.error}`,
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
                    title: 'Sucesso',
                    message: `Utilizador criado com sucesso! Papel: ${formData.role}`,
                    onConfirm: () => {
                        setModalConfig({ ...modalConfig, isOpen: false });
                        navigate('/admin/gerir-utilizadores');
                    }
                });
            }
        } catch (error) {
            setModalConfig({
                isOpen: true,
                title: 'Erro',
                message: error.response?.data?.msg || 'Erro ao criar utilizador',
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
                    <h1 className="page-title-underline">Criar Utilizador</h1>
                    
                    <div className="create-recipe-container">
                        <form onSubmit={handleSubmit} className="recipe-form-section">
                            <div className="form-group">
                                <label>Nome* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({formData.firstName.length}/{limits.user_first_name_max_length || 30})</span></label>
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
                                <label>Apelido* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({formData.lastName.length}/{limits.user_last_name_max_length || 30})</span></label>
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
                                <label>Username* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({formData.username.length}/{limits.user_username_max_length || 30})</span></label>
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
                                <label>Email*</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="input-beige text-black" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Password*</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    className="input-beige text-black" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Permissão*</label>
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
                                <label className="admin-create-image-label">Foto de Perfil</label>
                                <div className="image-upload-placeholder" onClick={() => document.getElementById('profilePicInput').click()}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="admin-create-preview-img" />
                                    ) : (
                                        <div className="admin-create-upload-info">
                                            <span className="admin-create-upload-icon">👤</span>
                                            <span className="image-upload-text">Selecionar Foto</span>
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

                            <div className="admin-create-actions mt-20">
                                <button type="button" className="btn-cancel admin-create-btn-flex" onClick={() => navigate(-1)}>Cancelar</button>
                                <button type="button" className="btn-create-submit admin-create-btn-flex" onClick={handleSubmit}>Criar Utilizador</button>
                            </div>
                        </div>
                    </div>
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
