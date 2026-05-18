import React from 'react';
import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate as useReactNavigate } from 'react-router-dom';
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';

const CriarEvento = () => {

    const navigate = useReactNavigate();
    const fileInputRef = useRef(null);
    const dateInputRef = useRef(null);

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [capacidadeMax, setCapacidadeMax] = useState(5);
    const [horario, setHorario] = useState('20:00');
    const [dataEvento, setDataEvento] = useState('');
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);

    const [utilizadorId, setUtilizadorId] = useState(null);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const URL_CRIAR_EVENTO = import.meta.env.VITE_API_BASE_URL + '/eventos/';

    useEffect(() => {
        const userId = localStorage.getItem('utilizadorId');
        if (!userId) {
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
        setUtilizadorId(userId);
    }, [navigate]);

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


        axios.post(URL_CRIAR_EVENTO, formData, {
            headers: { 'X-CSRFToken': csrfToken, 'Content-Type': 'multipart/form-data' },
            withCredentials: true
        })
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: 'Evento Criado!',
                    message: 'O teu evento foi criado com sucesso!',
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: () => navigate('/eventos'),
                    onCancel: () => navigate('/eventos')
                });
            })
            .catch(err => {
                console.error(err);
                const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Erro de conexão.';
                showPopup('Erro ao Criar Evento', detail);
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
                    <h1 className="page-title-underline">Criar Evento</h1>
                    <div className="create-recipe-container">

                        {/* COLUNA ESQUERDA */}
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
                                    className="input-beige text-black"
                                    placeholder="Detalhes sobre o local, o cardápio e o que levar..."
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    style={{
                                        height: '220px',
                                        padding: '20px',
                                        resize: 'none'
                                    }}
                                />
                            </div>

                            {/* LINHA ÚNICA*/}
                            <div className="event-metadata-single-line" style={{
                                display: 'flex',
                                gap: '20px',
                                alignItems: 'center',
                                backgroundColor: '#fcfbfa',
                                padding: '15px 20px',
                                borderRadius: '14px',
                                border: '1px solid #eae7dc',
                                marginTop: '15px'
                            }}>

                                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                    <label style={{ marginBottom: '6px', display: 'block' }}>Data do Evento*</label>
                                    <div
                                        className="calendar-filter-wrapper"
                                        onClick={handleDateWrapperClick}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45px', cursor: 'pointer' }}
                                    >
                                        <span className="calendar-display-text" style={{ color: 'black', fontWeight: '600' }}>
                                            {dataEvento ? formatarDataExibicao(dataEvento) : "Selecionar data..."}
                                        </span>
                                        <input
                                            type="date"
                                            ref={dateInputRef}
                                            className="calendar-hidden-input"
                                            value={dataEvento}
                                            onChange={(e) => setDataEvento(e.target.value)}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                </div>

                                {/* Horário - Dropdown Nativo Igual ao da Capacidade */}
                                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                    <label style={{ marginBottom: '6px', display: 'block' }}>Horário*</label>
                                    <select
                                        className="input-beige text-black"
                                        value={horario}
                                        onChange={(e) => setHorario(e.target.value)}
                                        style={{ width: '100%', cursor: 'pointer', fontWeight: '600', height: '45px', textAlign: 'center' }}
                                    >
                                        {opcoesHoras.map(hora => (
                                            <option key={hora} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dropdown de Capacidade Máxima */}
                                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                                    <label style={{ marginBottom: '6px', display: 'block' }}>Capacidade*</label>
                                    <select
                                        className="input-beige text-black"
                                        value={capacidadeMax}
                                        onChange={(e) => setCapacidadeMax(parseInt(e.target.value, 10))}
                                        style={{ width: '100%', cursor: 'pointer', fontWeight: '600', height: '45px', textAlign: 'center' }}
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

                        {/* COLUNA DIREITA: Foto + Ações */}
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
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#D1CDBC' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                                        <p style={{ fontSize: '0.9rem' }}>Clica para adicionar foto*</p>
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
                            {fotoPreview && (
                                <button
                                    className="btn-cancel btn-cancel-small"
                                    style={{ marginTop: '8px', alignSelf: 'center' }}
                                    onClick={() => { setFoto(null); setFotoPreview(null); fileInputRef.current.value = ''; }}
                                >
                                    Remover foto
                                </button>
                            )}

                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
                                <button className="btn-create-submit" onClick={handleSubmit}>Criar</button>
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

