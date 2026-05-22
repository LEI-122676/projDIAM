import 'react';
import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate as useReactNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const CriarEvento = () => {
    const { t } = useLanguage();
    const URL_BASE = 'http://localhost:8000';
    const URL_CRIAR_EVENTO = `${URL_BASE}/idjango/api/eventos/`;
    const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;

    const navigate = useReactNavigate();
    const location = useLocation();
    const editEvento = location.state?.editEvento;
    const fileInputRef = useRef(null);
    const dateInputRef = useRef(null);

    const [nome, setNome] = useState(editEvento ? editEvento.nome || '' : '');
    const [descricao, setDescricao] = useState(editEvento ? editEvento.descricao || '' : '');
    const [capacidadeMax, setCapacidadeMax] = useState(editEvento ? editEvento.capacidade_max || 5 : 5);
    const [horario, setHorario] = useState(() => {
        if (editEvento && editEvento.horario) {
            if (typeof editEvento.horario === 'string') {
                return editEvento.horario.replace(/"/g, '');
            }
        }
        return '20:00';
    });
    const [dataEvento, setDataEvento] = useState(() => {
        if (editEvento && editEvento.data_evento) {
            return editEvento.data_evento.substring(0, 10);
        }
        return '';
    });
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(() => {
        if (editEvento) {
            if (editEvento.foto_url) {
                return `${URL_BASE}${editEvento.foto_url}`;
            } else if (editEvento.foto) {
                return editEvento.foto;
            }
        }
        return null;
    });

    const utilizadorId = localStorage.getItem('utilizadorId');
    const [limits, setLimits] = useState({});

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        getFieldLimits().then(data => setLimits(data));
    }, []);

    

    useEffect(() => {
        if (!utilizadorId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('eventos.popups.acesso_restrito_criar'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        axios.get(`${URL_UTILIZADORES}${utilizadorId}`, { withCredentials: true })
            .then(res => {
                const userRole = res.data.role;
                if (userRole !== 'Admin' && userRole !== 'EventOrganizer') {
                    setPopupConfig({
                        isOpen: true,
                        title: t('receitas.popups.acesso_restrito_titulo'),
                        message: t('eventos.popups.acesso_restrito_admin'),
                        singleButton: true,
                        confirmText: t('comum.voltar'),
                        onConfirm: () => navigate('/eventos'),
                        onCancel: () => navigate('/eventos')
                    });
                }
            })
            .catch(err => {
                console.error("Erro ao verificar permissão do utilizador:", err);
            });
    }, [navigate, utilizadorId]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleDateWrapperClick = () => {
        if (dateInputRef.current) {
            try {
                if (typeof dateInputRef.current.showPicker === 'function') {
                    dateInputRef.current.showPicker();
                } else {
                    dateInputRef.current.click();
                }
            } catch {
                dateInputRef.current.click();
            }
        }
    };

    const gerarOpcoesHoras = () => {
        const horas = [];
        for (let h = 0; h < 24; h += 2) {
            horas.push(`${h.toString().padStart(2, '0')}:00`);
        }
        return horas;
    };

    const opcoesHoras = gerarOpcoesHoras();

    const opcoesCapacidade = [];
    for (let i = 5; i <= 50; i += 5) {
        opcoesCapacidade.push(i);
    }

    const showPopup = (title, message) => {
        setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup, onCancel: closePopup });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nome.trim()) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_nome')); return; }
        if (!descricao.trim()) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_descricao')); return; }

        const nomeValidation = validateInput(nome, limits.evento_nome_max_length || 50);
        if (!nomeValidation.isValid) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('eventos.nome')}: ${nomeValidation.error}`);
            return;
        }

        const descricaoValidation = validateInput(descricao, limits.evento_descricao_max_length || 500);
        if (!descricaoValidation.isValid) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), `${t('eventos.descricao')}: ${descricaoValidation.error}`);
            return;
        }

        if (descricao.trim().length < 10) { showPopup(t('receitas.popups.erro_validacao_titulo'), t('eventos.popups.descricao_curta_msg')); return; }
        if (!dataEvento) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_data')); return; }
        if (!horario) { showPopup(t('receitas.popups.campos_em_branco_titulo'), t('eventos.popups.campos_em_branco_horario')); return; }
        if (!utilizadorId) { showPopup(t('receitas.popups.erro_titulo'), t('receitas.popups.erro_identificacao_msg')); return; }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('capacidade_max', capacidadeMax);
        formData.append('horario', JSON.stringify(horario));
        formData.append('data_evento', dataEvento);
        formData.append('criador', parseInt(utilizadorId, 10));

        if (foto instanceof File) {
            formData.append('foto', foto);
        }

        const csrfToken = getCSRFToken();


        const requestPromise = editEvento
            ? axios.patch(`${URL_CRIAR_EVENTO}${editEvento.id}`, formData, {
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })
            : axios.post(URL_CRIAR_EVENTO, formData, {
                headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

        requestPromise
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: editEvento ? t('eventos.popups.evento_atualizado') : t('eventos.popups.evento_criado'),
                    message: editEvento ? t('eventos.popups.evento_atualizado') : t('eventos.popups.evento_criado'),
                    singleButton: true,
                    confirmText: t('comum.ok'),
                    onConfirm: () => navigate('/eventos'),
                    onCancel: () => navigate('/eventos')
                });
            })
            .catch(err => {
                console.error(err);
                const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Erro de conexão.';
                showPopup(editEvento ? t('eventos.popups.erro_ao_atualizar') : t('eventos.popups.erro_ao_criar'), detail);
            });
    };

    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return t('eventos.selecionar_data');
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">{editEvento ? t('eventos.editar_evento') : t('eventos.criar_evento')}</h1>
                    <div className="create-recipe-container">

                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>{t('eventos.nome')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({nome.length}/{limits.evento_nome_max_length || 50})</span>:</label>
                                <input
                                    type="text"
                                    className="input-beige text-black"
                                    placeholder={t('eventos.nome_placeholder')}
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    maxLength={limits.evento_nome_max_length || 50}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('eventos.descricao')} <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({descricao.length}/{limits.evento_descricao_max_length || 500})</span>:</label>
                                <textarea
                                    className="input-beige text-black event-description-textarea"
                                    placeholder={t('eventos.descricao_placeholder')}
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    maxLength={limits.evento_descricao_max_length || 500}
                                />
                            </div>

                            <div className="event-metadata-single-line">

                                <div className="form-group event-metadata-form-group">
                                    <label className="event-metadata-label">{t('eventos.data_evento')}</label>
                                    <div
                                        className="calendar-filter-wrapper"
                                        onClick={handleDateWrapperClick}
                                    >
                                        <span className="calendar-display-text">
                                            {dataEvento ? formatarDataExibicao(dataEvento) : t('eventos.selecionar_data')}
                                        </span>
                                        <input
                                            type="date"
                                            ref={dateInputRef}
                                            className="calendar-hidden-input"
                                            value={dataEvento}
                                            onChange={(e) => setDataEvento(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group event-metadata-form-group">
                                    <label className="event-metadata-label">{t('eventos.horario')}</label>
                                    <select
                                        className="input-beige text-black event-metadata-select"
                                        value={horario}
                                        onChange={(e) => setHorario(e.target.value)}
                                    >
                                        {opcoesHoras.map(hora => (
                                            <option key={hora} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group event-metadata-form-group">
                                    <label className="event-metadata-label">{t('eventos.capacidade')}</label>
                                    <select
                                        className="input-beige text-black event-metadata-select"
                                        value={capacidadeMax}
                                        onChange={(e) => setCapacidadeMax(parseInt(e.target.value, 10))}
                                    >
                                        {opcoesCapacidade.map(num => (
                                            <option key={num} value={num}>
                                                {num} {t('eventos.pessoas_max')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                <button className="btn-create-submit" onClick={handleSubmit}>{editEvento ? t('receitas.criar_receita.guardar') : t('receitas.criar_receita.criar')}</button>
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
                confirmText={popupConfig.confirmText || t('comum.ok')}
                cancelText={popupConfig.cancelText || t('comum.cancelar')}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default CriarEvento;

