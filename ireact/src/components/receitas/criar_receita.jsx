import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Footer from '../maincomponents/Footer.jsx';


const CriarReceita = () => {
    const URL_BASE = 'http://localhost:8000';
    const INGREDIENTES_URL = `${URL_BASE}/idjango/api/ingredientes/`;
    const RECEITAS_URL = `${URL_BASE}/idjango/api/receitas/`;

    const navigate = useNavigate();
    const location = useLocation();
    const editReceita = location.state?.editReceita;
    const { t } = useLanguage();
    const fileInputRef = useRef(null);

    const [nome, setNome] = useState(editReceita ? editReceita.nome || '' : '');
    const [passos, setPassos] = useState(editReceita ? editReceita.instrucao || [''] : ['']);
    const [ingredientesList, setIngredientesList] = useState(['']);
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(
        editReceita && editReceita.foto_url 
            ? (editReceita.foto_url.startsWith('http') ? editReceita.foto_url : `${URL_BASE}${editReceita.foto_url}`) 
            : null
    );

    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [utilizadorId, setUtilizadorId] = useState(() => localStorage.getItem('utilizadorId'));
    const [limits, setLimits] = useState({});

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const getIngredientes = () => {
        axios.get(INGREDIENTES_URL)
            .then(res => {
                setDbIngredientes(res.data);
                if (editReceita) {
                    const names = editReceita.ingredientes.map(ingId => {
                        const targetId = typeof ingId === 'object' && ingId !== null ? Number(ingId.id) : Number(ingId);
                        const found = res.data.find(i => Number(i.id) === targetId);
                        if (found) {
                            const key = found.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                            const translatedName = t(`ingredientes.${key}`) !== `ingredientes.${key}` ? t(`ingredientes.${key}`) : found.nome;
                            return translatedName;
                        }
                        return '';
                    }).filter(name => name !== '');
                    setIngredientesList(names.length > 0 ? names : ['']);
                }
            })
            .catch(err => console.error("Erro ao carregar ingredientes:", err));
    };

    useEffect(() => {
        getFieldLimits().then(data => setLimits(data));
    }, []);

    useEffect(() => {
        if (!utilizadorId) {
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('receitas.popups.acesso_restrito_cria_msg'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }
        getIngredientes();
    }, [navigate, utilizadorId]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleAddPasso = () => setPassos([...passos, '']);
    const handlePassoChange = (index, value) => {
        const newPassos = [...passos];
        newPassos[index] = value;
        setPassos(newPassos);
    };
    const handleRemovePasso = (index) => {
        const newPassos = [...passos];
        newPassos.splice(index, 1);
        setPassos(newPassos);
    };

    const handleAddIngrediente = () => setIngredientesList([...ingredientesList, '']);
    const handleIngredienteChange = (index, value) => {
        const newIngredientes = [...ingredientesList];
        newIngredientes[index] = value;
        setIngredientesList(newIngredientes);
    };
    const handleRemoveIngrediente = (index) => {
        const newIngredientes = [...ingredientesList];
        newIngredientes.splice(index, 1);
        setIngredientesList(newIngredientes);
    };

    const showPopup = (title, message) => {
        setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup, onCancel: closePopup });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nome.trim()) { showPopup(t('receitas.popups.campo_obrigatorio_titulo'), t('receitas.popups.nome_obrigatorio_msg')); return; }
        if (!utilizadorId) { showPopup(t('receitas.popups.erro_titulo'), t('receitas.popups.erro_identificacao_msg')); return; }

        const nomeValidation = validateInput(nome, limits.receita_nome_max_length || 50);
        if (!nomeValidation.isValid) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), `Nome da receita: ${nomeValidation.error}`);
            return;
        }

        for (let i = 0; i < passos.length; i++) {
            const stepValidation = validateInput(passos[i], limits.receita_instrucao_max_length || 500);
            if (!stepValidation.isValid) {
                showPopup(t('receitas.popups.erro_validacao_titulo'), `Passo ${i + 1}: ${stepValidation.error}`);
                return;
            }
        }

        if (passos.some(p => p.trim() === '')) {
            showPopup(t('receitas.popups.campos_em_branco_titulo'), t('receitas.popups.passos_em_branco_msg'));
            return;
        }

        if (ingredientesList.some(ing => ing.trim() === '')) {
            showPopup(t('receitas.popups.campos_em_branco_titulo'), t('receitas.popups.ingredientes_em_branco_msg'));
            return;
        }

        const passosFormatados = passos.map((p, index) => {
            const prefix = `Passo ${index + 1}: `;
            if (p.startsWith(prefix)) return p;
            if (p.match(/^Passo \d+:/)) return prefix + p.replace(/^Passo \d+:\s*/, '');
            return prefix + p;
        });

        if (passosFormatados.length === 0) { showPopup(t('receitas.popups.campo_obrigatorio_titulo'), t('receitas.popups.passo_obrigatorio_msg')); return; }

        const idsIngredientes = [];
        for (let ing of ingredientesList) {
            const found = dbIngredientes.find(dbI => {
                const key = dbI.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                const translatedName = t(`ingredientes.${key}`) !== `ingredientes.${key}` ? t(`ingredientes.${key}`) : dbI.nome;
                return dbI.nome.toLowerCase() === ing.trim().toLowerCase() || translatedName.toLowerCase() === ing.trim().toLowerCase();
            });
            if (found) {
                idsIngredientes.push(found.id);
            } else {
                showPopup(t('receitas.popups.ingrediente_nao_encontrado_titulo'), `${t('receitas.popups.ingrediente_nao_encontrado_msg_base')}${ing}${t('receitas.popups.ingrediente_nao_encontrado_msg_fim')}`);
                return;
            }
        }

        if (idsIngredientes.length === 0) { showPopup(t('receitas.popups.campo_obrigatorio_titulo'), t('receitas.popups.ingrediente_obrigatorio_msg')); return; }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('criador', utilizadorId);

        if (foto instanceof File) {
            formData.append('foto', foto);
        }

        formData.append('instrucao', JSON.stringify(passosFormatados));

        const uniqueIds = [...new Set(idsIngredientes)];
        uniqueIds.forEach(id => formData.append('ingredientes', id));

        const requestPromise = editReceita
            ? axios.patch(`${RECEITAS_URL}${editReceita.id}`, formData, {
                headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })
            : axios.post(RECEITAS_URL, formData, {
                headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

        requestPromise
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: editReceita ? t('receitas.popups.receita_atualizada_titulo') : t('receitas.popups.receita_criada_titulo'),
                    message: editReceita ? t('receitas.popups.receita_atualizada_msg') : t('receitas.popups.receita_criada_msg'),
                    singleButton: true,
                    confirmText: t('comum.ok'),
                    onConfirm: () => navigate('/receitas'),
                    onCancel: () => navigate('/receitas')
                });
            })
            .catch(err => {
                console.error(err);
                let message = t('receitas.popups.atencao_linguagem_msg');
                if (err.response && err.response.data) {
                    const data = err.response.data;
                    if (typeof data === 'object') {
                        const firstFieldErrors = Object.values(data)[0];
                        if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                            message = firstFieldErrors[0];
                        } else if (typeof data.msg === 'string') {
                            message = data.msg;
                        } else {
                            message = JSON.stringify(data);
                        }
                    } else if (typeof data === 'string') {
                        message = data;
                    }
                }
                showPopup(t('receitas.popups.atencao_linguagem_titulo'), message);
            });
    };


    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">{editReceita ? t('receitas.criar_receita.titulo_editar') : t('receitas.criar_receita.titulo_criar')}</h1>
                    <div className="create-recipe-container">

                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>{t('receitas.criar_receita.nome')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({nome.length}/{limits.receita_nome_max_length || 50})</span>:</label>
                                <input
                                    type="text"
                                    className="input-beige text-black"
                                    placeholder={t('receitas.criar_receita.nome_placeholder')}
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    maxLength={limits.receita_nome_max_length || 50}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('receitas.criar_receita.passos')}</label>
                                {passos.map((passo, index) => (
                                    <div key={index} className="dynamic-list-item dynamic-list-item-flex" style={{ alignItems: 'flex-start' }}>
                                        <span className="item-number" style={{ marginTop: '8px' }}>{index + 1}.</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <input
                                                type="text"
                                                className="input-beige flex-input-black"
                                                placeholder={t('receitas.criar_receita.passo_placeholder')}
                                                value={passo}
                                                onChange={(e) => handlePassoChange(index, e.target.value)}
                                                maxLength={limits.receita_instrucao_max_length || 500}
                                            />
                                            <span style={{ alignSelf: 'flex-end', fontSize: '0.75rem', color: '#888', marginTop: '2px', marginRight: '10px' }}>
                                                {passo.length}/{limits.receita_instrucao_max_length || 500}
                                            </span>
                                        </div>
                                        {passos.length > 1 && (
                                            <button className="btn-cancel btn-cancel-small" style={{ marginTop: '4px' }} onClick={() => handleRemovePasso(index)}>X</button>
                                        )}
                                    </div>
                                ))}
                                <button className="btn-add-dashed" onClick={handleAddPasso}>+</button>
                            </div>

                            <div className="form-group">
                                <label>{t('receitas.criar_receita.ingredientes')}</label>
                                {ingredientesList.map((ingrediente, index) => (
                                    <div key={index} className="dynamic-list-item dynamic-list-item-flex">
                                        <span className="item-number">{index + 1}.</span>
                                        <input
                                            type="text"
                                            className="input-beige flex-input-black"
                                            placeholder={t('receitas.criar_receita.ingrediente_placeholder')}
                                            list="lista-ingredientes"
                                            value={ingrediente}
                                            onChange={(e) => handleIngredienteChange(index, e.target.value)}
                                        />
                                        {ingredientesList.length > 1 && (
                                            <button className="btn-cancel btn-cancel-small" onClick={() => handleRemoveIngrediente(index)}>X</button>
                                        )}
                                    </div>
                                ))}
                                <datalist id="lista-ingredientes">
                                    {dbIngredientes.map(dbI => {
                                        const key = dbI.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                                        const translatedName = t(`ingredientes.${key}`) !== `ingredientes.${key}` ? t(`ingredientes.${key}`) : dbI.nome;
                                        return <option key={dbI.id} value={translatedName} />
                                    })}
                                </datalist>
                                <button className="btn-add-dashed" onClick={handleAddIngrediente}>+</button>
                            </div>
                        </div>

                        <div className="recipe-image-section">
                            <div
                                className="image-upload-placeholder"
                                onClick={() => fileInputRef.current.click()}
                                title={t('receitas.criar_receita.adicionar_foto_title')}
                            >
                                {fotoPreview ? (
                                    <img
                                        src={fotoPreview}
                                        alt="Pré-visualização"
                                        className="image-preview-fit"
                                    />
                                ) : (
                                    <div className="image-upload-info">
                                        <div className="image-upload-icon">📷</div>
                                        <p className="image-upload-text">{t('receitas.criar_receita.adicionar_foto')}</p>
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
                            {fotoPreview && (
                                <button
                                    className="btn-cancel btn-cancel-small btn-remove-photo"
                                    onClick={() => { setFoto(null); setFotoPreview(null); fileInputRef.current.value = ''; }}
                                >
                                    {t('receitas.criar_receita.remover_foto')}
                                </button>
                            )}

                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)}>{t('comum.cancelar')}</button>
                                <button className="btn-create-submit" onClick={handleSubmit}>{editReceita ? t('receitas.criar_receita.guardar') : t('receitas.criar_receita.criar')}</button>
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

export default CriarReceita;