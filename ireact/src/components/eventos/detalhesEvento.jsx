import React from 'react';
import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const VerEvento = () => {
    const { t } = useLanguage();
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

    

    const showLoginPopup = (actionMessage) => {
        setPopupConfig({
            isOpen: true,
            title: t('receitas.popups.acesso_restrito_titulo'),
            message: t('receitas.popups.acesso_restrito_msg_base') + actionMessage + t('receitas.popups.acesso_restrito_msg_fim'),
            singleButton: false,
            confirmText: t('comum.iniciar_sessao'),
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
            } catch (e) { /* empty */ }
            return h.replace(/"/g, '');
        }
        return JSON.stringify(h).replace(/"/g, '');
    };

    const handleJoin = () => {
        if (!utilizadorId) {
            showLoginPopup(t('eventos.popups.acesso_restrito_inscrever'));
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

        axios.patch(`${EVENTO_URL}${eventoId}`, updatedPayload, { 
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
            title: t('receitas.popups.confirmar_eliminacao_titulo'),
            message: t('eventos.popups.confirmar_eliminacao'),
            singleButton: false,
            confirmText: t('receitas.popups.apagar'),
            cancelText: t('comum.cancelar'),
            onConfirm: () => {
                axios.delete(`${EVENTO_URL}${eventoId}`, {
                    headers: { 'X-CSRFToken': getCSRFToken() },
                    withCredentials: true
                })
                    .then(() => {
                        setPopupConfig({
                            isOpen: true,
                            title: t('receitas.popups.receita_apagada_titulo'), // Reusing the same concept
                            message: t('eventos.popups.evento_apagado'),
                            singleButton: true,
                            confirmText: t('comum.ok'),
                            onConfirm: () => navigate('/eventos'),
                            onCancel: () => navigate('/eventos')
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        setPopupConfig({
                            isOpen: true,
                            title: t('receitas.popups.erro_apagar_titulo'),
                            message: t('eventos.popups.erro_ao_apagar'),
                            singleButton: true,
                            confirmText: t('comum.ok'),
                            onConfirm: closePopup,
                            onCancel: closePopup
                        });
                    });
            },
            onCancel: closePopup
        });
    };

    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return t('eventos.sem_data');
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    if (isLoadError) return (
        <div className="loading-container">
            <p className="error-message">{t('eventos.nao_foi_possivel_carregar')}</p>
            <button className="btn-cancel" onClick={() => navigate('/eventos')}>{t('eventos.voltar_aos_eventos')}</button>
        </div>
    );

    if (!evento) return <div className="loading-container">{t('eventos.a_carregar')}</div>;

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
                            👥 {totalInscritos} / {evento.capacidade_max || 5} {t('eventos.inscritos')}
                        </div>
                    </div>

                    <div className="recipe-view-container">

                        <div className="recipe-top-row">
                            <div className="recipe-main-image flex-center">
                                <img
                                    src={getImageUrl(imagemCaminho)}
                                    alt={evento.nome}
                                    className="cover-image-rounded"
                                />
                            </div>

                            <div className="recipe-steps-nav">
                                <div className="step-nav-item step-nav-item-default">
                                    📅 {evento.data_evento ? formatarDataExibicao(evento.data_evento.substring(0, 10)) : t('eventos.sem_data')}
                                </div>
                                <div className="step-nav-item step-nav-item-default">
                                    🕒 {formatarHorario(evento.horario) || t('eventos.sem_horario')}
                                </div>
                                <div className="step-nav-item step-nav-item-default">
                                    📍 {t('eventos.capacidade_maxima')}: {evento.capacidade_max || 5} {t('eventos.pessoas')}
                                </div>

                                 <div className="view-actions-group mt-auto">
                                    <button className="btn-cancel" onClick={() => navigate(-1)}>{t('comum.voltar')}</button>

                                    {(Number(evento.criador) !== Number(utilizadorId) || isAdmin) && (
                                        <button
                                            className={`btn-create-submit ${inscrito ? "btn-registered" : ""}`}
                                            onClick={handleJoin}
                                        >
                                            {inscrito ? t('eventos.inscrito') : t('eventos.inscrever_me')}
                                        </button>
                                    )}

                                    {(Number(evento.criador) === Number(utilizadorId) || isAdmin) && (
                                        <>
                                            <button
                                                className="btn-create-submit btn-action-edit"
                                                onClick={() => navigate('/eventos/criarEvento', { state: { editEvento: evento } })}
                                            >
                                                {t('eventos.editar')}
                                            </button>
                                            <button
                                                className="btn-create-submit btn-action-delete"
                                                onClick={handleDelete}
                                            >
                                                {t('eventos.remover')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="recipe-bottom-row recipe-bottom-row-flex">
                            <div className="recipe-descriptions-column recipe-col-2">
                                <div className="step-detail mb-15">
                                    <label className="section-subtitle">{t('eventos.sobre_evento')}</label>
                                    <div className="content-box-light text-black event-description-box">
                                        {evento.descricao || t('eventos.sem_descricao')}
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
                confirmText={popupConfig.confirmText || t('comum.ok')}
                cancelText={popupConfig.cancelText || t('comum.cancelar')}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default VerEvento;