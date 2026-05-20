import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate as useReactNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';

const CriarEvento = () => {

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
                return `http://localhost:8000${editEvento.foto_url}`;
            } else if (editEvento.foto) {
                return editEvento.foto;
            }
        }
        return null;
    });

    const [utilizadorId, setUtilizadorId] = useState(() => localStorage.getItem('utilizadorId'));

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const URL_CRIAR_EVENTO = 'http://localhost:8000/idjango/api' + '/eventos/';

    useEffect(() => {
        if (!utilizadorId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para criares um evento.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        axios.get(`http://localhost:8000/idjango/api/utilizadores/${utilizadorId}`, { withCredentials: true })
            .then(res => {
                const userRole = res.data.role;
                if (userRole !== 'Admin' && userRole !== 'EventOrganizer') {
                    setPopupConfig({
                        isOpen: true,
                        title: 'Acesso Restrito',
                        message: 'Precisas de ter permissão de Organizador de Eventos (EventOrganizer) para criares um evento.',
                        singleButton: true,
                        confirmText: 'Voltar',
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

    const getCSRFToken = () => {
        return document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
    };

    const handleDateWrapperClick = () => {
        if (dateInputRef.current) {
            try {
                if (typeof dateInputRef.current.showPicker === 'function') {
                    dateInputRef.current.showPicker();
                } else {
                    dateInputRef.current.click();
                }
            } catch (error) {
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
        setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: 'OK', onConfirm: closePopup, onCancel: closePopup });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nome.trim()) { showPopup('Campo Obrigatório', 'Por favor, dê um nome ao evento.'); return; }
        if (descricao.length < 10) { showPopup('Campo Obrigatório', 'Por favor, dê uma descrição ao evento (tamanho mínimo de dez caracteres).'); return; }
        if (!dataEvento) { showPopup('Campo Obrigatório', 'Por favor, selecione a data do evento.'); return; }
        if (!horario) { showPopup('Campo Obrigatório', 'Por favor, defina um horário para o evento.'); return; }
        if (!utilizadorId) { showPopup('Erro', 'Não foi possível identificar o utilizador. Faz login novamente.'); return; }

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
            ? axios.patch(`${URL_CRIAR_EVENTO}${editEvento.id}/`, formData, {
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
                    title: editEvento ? 'Evento Atualizado!' : 'Evento Criado!',
                    message: editEvento ? 'O teu evento foi atualizado com sucesso!' : 'O teu evento foi criado com sucesso!',
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: () => navigate('/eventos'),
                    onCancel: () => navigate('/eventos')
                });
            })
            .catch(err => {
                console.error(err);
                const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Erro de conexão.';
                showPopup(editEvento ? 'Erro ao Atualizar Evento' : 'Erro ao Criar Evento', detail);
            });
    };

    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return "Selecionar data...";
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">{editEvento ? 'Editar Evento' : 'Criar Evento'}</h1>
                    <div className="create-recipe-container">

                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>Nome*:</label>
                                <input
                                    type="text"
                                    className="input-beige text-black"
                                    placeholder="Dê um nome ao seu evento"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição*:</label>
                                <textarea
                                    className="input-beige text-black event-description-textarea"
                                    placeholder="Detalhes sobre o local, o cardápio e o que levar..."
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                />
                            </div>

                            <div className="event-metadata-single-line">

                                <div className="form-group event-metadata-form-group">
                                    <label className="event-metadata-label">Data do Evento*</label>
                                    <div
                                        className="calendar-filter-wrapper"
                                        onClick={handleDateWrapperClick}
                                    >
                                        <span className="calendar-display-text">
                                            {dataEvento ? formatarDataExibicao(dataEvento) : "Selecionar data..."}
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
                                    <label className="event-metadata-label">Horário*</label>
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
                                    <label className="event-metadata-label">Capacidade*</label>
                                    <select
                                        className="input-beige text-black event-metadata-select"
                                        value={capacidadeMax}
                                        onChange={(e) => setCapacidadeMax(parseInt(e.target.value, 10))}
                                    >
                                        {opcoesCapacidade.map(num => (
                                            <option key={num} value={num}>
                                                {num} pessoas Max.
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
                                title="Clica para adicionar uma foto"
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
                                        <p className="image-upload-text">Clica para adicionar foto*</p>
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
                                    Remover foto
                                </button>
                            )}

                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
                                <button className="btn-create-submit" onClick={handleSubmit}>{editEvento ? 'Guardar' : 'Criar'}</button>
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

export default CriarEvento;

