import React from 'react';
import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';

const VerEvento = () => {
    const URL_BASE = 'http://localhost:8000';
    const URL_EVENTOS = `${URL_BASE}/idjango/api/eventos/`;
    const URL_UTILIZADORES = `${URL_BASE}/idjango/api/utilizadores/`;
    const URL_DEFAULT_EVENT = `${URL_BASE}/idjango/media/defaultEvent.png`;

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

    const [contagem, setContagem] = useState('');

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
        axios.get(`${URL_EVENTOS}${eventoId}`)
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
            axios.get(`${URL_UTILIZADORES}${utilizadorId}`, { withCredentials: true })
                .then(res => {
                    if (res.data.role === 'Admin') {
                        setIsAdmin(true);
                    }
                })
                .catch(err => console.error("Erro ao obter papel do utilizador:", err));
        }

    }, [eventoId, utilizadorId, navigate, URL_EVENTOS]);

    const getImageUrl = (caminho) => {
        if (!caminho) return URL_DEFAULT_EVENT;
        if (caminho.startsWith('http')) return caminho;
        return `${URL_BASE}${caminho.startsWith('/') ? '' : '/'}${caminho}`;
    };

    useEffect(() => {
        if (!evento || !evento.data_evento || !evento.horario) return;

        const decreaseTimer = () => {
            const dataEvento = evento.data_evento.substring(0, 10);
            let horaInicio = '';

            if (typeof evento.horario === 'string') {
                try {
                    const parsed = JSON.parse(evento.horario);
                    horaInicio = parsed.inicio || '';
                } catch (e) {
                    horaInicio = evento.horario;
                }
            } else if (evento.horario && evento.horario.inicio) {
                horaInicio = evento.horario.inicio;
            }

            if (!dataEvento || !horaInicio) {
                setContagem("Sem data/hora");
                return;
            }

            const dataInicioEvento = new Date(`${dataEvento}T${horaInicio}`);
            const dataAtual = new Date();
            const dif = Math.floor((dataInicioEvento - dataAtual) / 1000);
            
            if (dif <= 0) {
                setContagem("O evento começou!");
                return;
            }

            const dias = Math.floor(dif / (60 * 60 * 24));
            const horas = Math.floor((dif % (60 * 60 * 24)) / (60 * 60));
            const minutos = Math.floor((dif % (60 * 60)) / 60);
            const segundos = dif % 60;
            
            setContagem(`${dias}d ${horas}h ${minutos}m ${segundos}s`);
        };

        decreaseTimer();
        const intervaloId = setInterval(decreaseTimer, 1000);
        return () => clearInterval(intervaloId);
    }, [evento]);

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

        const updatedPayload = { inscritos: newInscritos };

        axios.patch(`${URL_EVENTOS}${eventoId}`, updatedPayload, { 
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true 
        })
            .then(res => {
                setEvento(prev => ({
                    ...prev,
                    ...res.data,
                    inscritos: newInscritos
                }));
                setInscrito(!isAlreadyInscribed);
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
                axios.delete(`${URL_EVENTOS}${eventoId}`, {
                    headers: { 'X-CSRFToken': getCSRFToken() },
                    withCredentials: true
                })
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
            <p className="error-message">❌ Não foi possível carregar o evento.</p>
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
                            <div className="recipe-main-image-column" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '1' }}>
                                <div className="recipe-main-image flex-center">
                                    <img
                                        src={getImageUrl(imagemCaminho)}
                                        alt={evento.nome}
                                        className="cover-image-rounded"
                                    />
                                </div>
                                
                                <div className="step-detail">
                                    <label className="section-subtitle">Sobre o Evento</label>
                                    <div className="content-box-light text-black event-description-box" style={{ marginTop: '8px' }}>
                                        {evento.descricao || "Este evento não possui uma descrição detalhada."}
                                    </div>
                                </div>
                            </div>

                            <div className="recipe-steps-nav">
                                <div className="step-nav-item step-nav-item-default">
                                    📅 {evento.data_evento ? formatarDataExibicao(evento.data_evento.substring(0, 10)) : "Sem data definida"}
                                </div>
                                <div className="step-nav-item step-nav-item-default">
                                    ⏳ Contagem Decrescente: <br />{contagem || "A calcular..."}
                                </div>
                                <div className="step-nav-item step-nav-item-default">
                                    <table className="horario-row">
                                        <thead>
                                            <tr>
                                                <th>🕒 Atividade</th>
                                                <th>🕒 Horários</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {evento.horario && Object.entries(evento.horario).map(([chave, valor], index) => (
                                                <tr key={index}>
                                                    <td>{chave}</td>
                                                    <td>{valor}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="step-nav-item step-nav-item-default">
                                    🔢 Capacidade Máxima: {evento.capacidade_max || 5} pessoas
                                </div>

                                <div className="view-actions-group mt-auto">
                                    <button className="btn-cancel" onClick={() => navigate(-1)}>Voltar</button>

                                    {(Number(evento.criador) !== Number(utilizadorId) || isAdmin) && (
                                        <button
                                            className={`btn-create-submit ${inscrito ? "btn-registered" : ""}`}
                                            onClick={handleJoin}
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