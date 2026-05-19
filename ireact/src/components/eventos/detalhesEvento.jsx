import React from 'react';
import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/PopupModal.jsx';

const VerEvento = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const eventoId = location.state?.id;

    const [evento, setEvento] = useState(null);
    const utilizadorId = localStorage.getItem('utilizadorId');
    const [inscrito, setInscrito] = useState(false);
    const [isLoadError, setIsLoadError] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [popupConfig, setPopupConfig] = useState({
        isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { }
    });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const EVENTO_URL = 'http://localhost:8000/idjango/api' + '/eventos/';

    const showLoginPopup = (actionMessage) => {
        setPopupConfig({
            isOpen: true,
            title: 'Acesso Restrito',
            message: `Precisas de iniciar sessão para ${actionMessage}. Cria uma conta ou faz login!`,
            singleButton: false,
            confirmText: 'Iniciar Sessão',
            onConfirm: () => navigate('/login'),
            onCancel: closePopup
        });
    };

    useEffect(() => {
        if (!eventoId) {
            navigate('/eventos');
            return;
        }

        axios.get(`${EVENTO_URL}${eventoId}`)
            .then(res => {
                setEvento(res.data);
                if (utilizadorId && res.data.inscritos?.includes(parseInt(utilizadorId, 10))) {
                    setInscrito(true);
                }
            })
            .catch(err => {
                console.error("Erro ao carregar evento:", err);
                setIsLoadError(true);
            });

        if (utilizadorId) {
            axios.get(`http://localhost:8000/idjango/api/utilizadores/${utilizadorId}`, { withCredentials: true })
                .then(res => {
                    if (res.data.role === 'Admin') {
                        setIsAdmin(true);
                    }
                })
                .catch(err => console.error("Erro ao obter papel do utilizador:", err));
        }
    }, [eventoId, utilizadorId, navigate]);

    const getImageUrl = (caminho) => {
        if (!caminho) return "http://localhost:8000/idjango/media/defaultEvent.png";
        if (caminho.startsWith('http')) return caminho;
        return `http://localhost:8000${caminho.startsWith('/') ? '' : '/'}${caminho}`;
    };

    const formatarHorario = (h) => {
        if (!h) return null;
        if (typeof h === 'object') {
            if (h.inicio && h.fim) {
                return `Inicio: ${h.inicio}, Fim: ${h.fim}`;
            }
            if (Object.keys(h).length === 0) return null;
        }
        if (typeof h === 'string') {
            try {
                const parsed = JSON.parse(h);
                if (parsed && typeof parsed === 'object' && parsed.inicio && parsed.fim) {
                    return `Inicio: ${parsed.inicio}, Fim: ${parsed.fim}`;
                }
            } catch (e) {}
            return h.replace(/"/g, '');
        }
        return JSON.stringify(h).replace(/"/g, '');
    };

    const handleJoin = () => {
        if (!utilizadorId) {
            showLoginPopup('te inscreveres neste evento');
            return;
        }

        const isAlreadyInscribed = inscrito;
        let newInscritos = [...(evento.inscritos || [])];

        if (isAlreadyInscribed) {
            newInscritos = newInscritos.filter(id => id !== parseInt(utilizadorId, 10));
        } else {
            newInscritos.push(parseInt(utilizadorId, 10));
        }


        const updatedPayload = {
            inscritos: newInscritos
        };

        axios.patch(`${EVENTO_URL}${eventoId}`, updatedPayload)
            .then(res => {
                setEvento(prev => ({
                    ...prev,
                    ...res.data,
                    inscritos: newInscritos
                }));
                setInscrito(!isAlreadyInscribed);

                setPopupConfig({
                    isOpen: true,
                    title: isAlreadyInscribed ? 'Inscrição Cancelada' : 'Inscrição Confirmada!',
                    message: isAlreadyInscribed ? 'Cancelaste a tua inscrição no evento.' : 'Estás oficialmente inscrito no evento!',
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
            })
            .catch(err => {
                console.error("Erro ao atualizar inscrição com PUT:", err);
                setEvento(prev => ({ ...prev, inscritos: newInscritos }));
                setInscrito(!isAlreadyInscribed);
            });
    };

    const handleDelete = () => {
        setPopupConfig({
            isOpen: true,
            title: 'Confirmar Eliminação',
            message: 'Tens a certeza que pretendes apagar este evento? Esta ação é irreversível.',
            singleButton: false,
            confirmText: 'Apagar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                axios.delete(`${EVENTO_URL}${eventoId}`)
                    .then(() => {
                        setPopupConfig({
                            isOpen: true,
                            title: 'Evento Apagado',
                            message: 'O teu evento foi removido com sucesso.',
                            singleButton: true,
                            confirmText: 'OK',
                            onConfirm: () => navigate('/eventos'),
                            onCancel: () => navigate('/eventos')
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        setPopupConfig({
                            isOpen: true,
                            title: 'Erro ao Apagar',
                            message: 'Não foi possível apagar o evento. Tenta novamente.',
                            singleButton: true,
                            confirmText: 'OK',
                            onConfirm: closePopup,
                            onCancel: closePopup
                        });
                    });
            },
            onCancel: closePopup
        });
    };

    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return "Data não definida";
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    if (isLoadError) return (
        <div className="loading-container">
            <p style={{ color: '#8b4b4b', marginBottom: '20px' }}>❌ Não foi possível carregar o evento.</p>
            <button className="btn-cancel" onClick={() => navigate('/eventos')}>Voltar aos Eventos</button>
        </div>
    );

    if (!evento) return <div className="loading-container">A carregar evento...</div>;

    const totalInscritos = evento.inscritos?.length || 0;
    const imagemCaminho = evento.foto_url || evento.foto;

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">

                    <div className="recipe-header-container">
                        <h1 className="page-title-underline">{evento.nome}</h1>
                        <div className="recipe-rating-text">
                            👥 {totalInscritos} / {evento.capacidade_max || 5} Inscritos
                        </div>
                    </div>

                    <div className="recipe-view-container">

                        <div className="recipe-top-row">
                            <div className="recipe-main-image flex-center">
                                <img
                                    src={getImageUrl(imagemCaminho)}
                                    alt={evento.nome}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
                                />
                            </div>

                            <div className="recipe-steps-nav">
                                <div className="step-nav-item" style={{ cursor: 'default', fontWeight: '600' }}>
                                    📅 {evento.data_evento ? formatarDataExibicao(evento.data_evento.substring(0, 10)) : "Sem data definida"}
                                </div>
                                <div className="step-nav-item" style={{ cursor: 'default', fontWeight: '600' }}>
                                    🕒 {formatarHorario(evento.horario) || "Sem horário definido"}
                                </div>
                                <div className="step-nav-item" style={{ cursor: 'default', fontWeight: '600' }}>
                                    📍 Capacidade Máxima: {evento.capacidade_max || 5} pessoas
                                </div>

                                 <div className="view-actions-group mt-auto">
                                    <button className="btn-cancel" onClick={() => navigate(-1)}>Voltar</button>

                                    {(Number(evento.criador) !== Number(utilizadorId) || isAdmin) && (
                                        <button
                                            className="btn-create-submit"
                                            onClick={handleJoin}
                                            style={inscrito ? { backgroundColor: '#8a9b8e' } : {}}
                                        >
                                            {inscrito ? 'Inscrito' : 'Inscrever-me'}
                                        </button>
                                    )}

                                    {(Number(evento.criador) === Number(utilizadorId) || isAdmin) && (
                                        <>
                                            <button
                                                className="btn-create-submit btn-action-edit"
                                                onClick={() => navigate('/eventos/criarEvento', { state: { editEvento: evento } })}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-create-submit btn-action-delete"
                                                onClick={handleDelete}
                                            >
                                                Remover
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="recipe-bottom-row recipe-bottom-row-flex">
                            <div className="recipe-descriptions-column recipe-col-2">
                                <div className="step-detail mb-15">
                                    <label className="section-subtitle">Sobre o Evento</label>
                                    <div className="content-box-light text-black" style={{ minHeight: '150px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                        {evento.descricao || "Este evento não possui uma descrição detalhada."}
                                    </div>
                                </div>
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

export default VerEvento;