import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { validateInput } from '../../utils/validation.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Footer from '../maincomponents/Footer.jsx';

const FeedbackPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const userId = localStorage.getItem('utilizadorId');

    const [notaReceitas, setNotaReceitas] = useState(0);
    const [notaEventos, setNotaEventos] = useState(0);
    const [notaFrigorifico, setNotaFrigorifico] = useState(0);
    const [notaEstetica, setNotaEstetica] = useState(0);
    const [funcFavorita, setFuncFavorita] = useState('');
    const [comentarioLivre, setComentarioLivre] = useState('');
    const [hasFeedback, setHasFeedback] = useState(false);
    
    const [stats, setStats] = useState(null);
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {} });

    const URL_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/idjango/api';

    useEffect(() => {
        const showRestrictedPopup = () => {
            const timeoutId = setTimeout(() => {
                setPopupConfig({
                    isOpen: true, title: t('receitas.popups.acesso_restrito_titulo'), message: t('feedback.popups.login_necessario_msg'),
                    singleButton: false, confirmText: t('autenticacao.login'), cancelText: t('comum.cancelar'),
                    onConfirm: () => navigate('/login'), onCancel: () => navigate('/')
                });
            }, 0);
            return () => clearTimeout(timeoutId);
        };

        if (userId) {
            axios.get(`${URL_BASE}/utilizadores/${userId}`, { withCredentials: true })
                .then(response => {
                    if (response.data.role === 'Guest') {
                        showRestrictedPopup();
                    } else {
                        fetchMyFeedback();
                        fetchStats();
                    }
                })
                .catch(err => console.error("Error fetching user info", err));
        } else {
            showRestrictedPopup();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, navigate]);

    const fetchMyFeedback = () => {
        axios.get(`${URL_BASE}/feedback/`, { withCredentials: true })
            .then(res => {
                if (res.data.msg) {
                    setHasFeedback(false);
                    return; // Não existe feedback
                }
                setHasFeedback(true);
                setNotaReceitas(res.data.nota_receitas || 0);
                setNotaEventos(res.data.nota_eventos || 0);
                setNotaFrigorifico(res.data.nota_frigorifico || 0);
                setNotaEstetica(res.data.nota_estetica || 0);
                setFuncFavorita(res.data.funcionalidade_favorita || '');
                setComentarioLivre(res.data.comentario_livre || '');
            })
            .catch(err => console.error("Erro ao carregar o feedback do utilizador", err));
    };

    const fetchStats = () => {
        axios.get(`${URL_BASE}/feedback/stats/`)
            .then(res => {
                if (res.data.msg) return; // "Ainda não há feedback"
                setStats(res.data);
            })
            .catch(err => console.error("Erro ao carregar estatísticas", err));
    };

    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const handleSubmit = () => {
        if (!userId) {
            setPopupConfig({
                isOpen: true, title: t('receitas.popups.acesso_restrito_titulo'), message: t('feedback.popups.login_necessario_msg'),
                singleButton: false, confirmText: t('autenticacao.login'), cancelText: t('comum.cancelar'),
                onConfirm: () => navigate('/login'), onCancel: closePopup
            });
            return;
        }

        if (!notaReceitas || !notaEventos || !notaFrigorifico || !notaEstetica || !funcFavorita) {
            setPopupConfig({
                isOpen: true, title: t('feedback.popups.dados_incompletos_titulo'), message: t('feedback.popups.dados_incompletos_msg'),
                singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup
            });
            return;
        }

        if (comentarioLivre) {
            const validation = validateInput(comentarioLivre, 150);
            if (!validation.isValid) {
                setPopupConfig({
                    isOpen: true, title: t('feedback.popups.comentario_invalido_titulo'), message: validation.error,
                    singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup
                });
                return;
            }
        }

        const payload = {
            nota_receitas: notaReceitas,
            nota_eventos: notaEventos,
            nota_frigorifico: notaFrigorifico,
            nota_estetica: notaEstetica,
            funcionalidade_favorita: funcFavorita,
            comentario_livre: comentarioLivre
        };

        axios.post(`${URL_BASE}/feedback/`, payload, {
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true
        })
        .then(() => {
            setPopupConfig({
                isOpen: true, title: t('feedback.popups.sucesso_titulo'), message: t('feedback.popups.feedback_guardado'),
                singleButton: true, confirmText: t('comum.ok'), onConfirm: () => {
                    closePopup();
                    fetchStats(); // recarrega os graficos
                    fetchMyFeedback(); // recarrega o feedback do utilizador
                }
            });
        })
        .catch(err => {
            console.error(err);
            setPopupConfig({
                isOpen: true, title: t('receitas.popups.erro_titulo'), message: t('feedback.popups.erro_enviar_msg'),
                singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup
            });
        });
    };

    const handleDelete = () => {
        if (!userId || !hasFeedback) return;
        
        axios.delete(`${URL_BASE}/feedback/`, {
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true
        })
        .then(() => {
            setPopupConfig({
                isOpen: true, title: t('feedback.popups.removido_titulo'), message: t('feedback.popups.feedback_removido'),
                singleButton: true, confirmText: t('comum.ok'), onConfirm: () => {
                    closePopup();
                    setHasFeedback(false);
                    setNotaReceitas(0); setNotaEventos(0); setNotaFrigorifico(0); setNotaEstetica(0);
                    setFuncFavorita(''); setComentarioLivre('');
                    fetchStats();
                }
            });
        })
        .catch(err => {
            console.error(err);
            setPopupConfig({
                isOpen: true, title: t('receitas.popups.erro_titulo'), message: t('feedback.popups.erro_remover'),
                singleButton: true, confirmText: t('comum.ok'), onConfirm: closePopup
            });
        });
    };

    const renderStars = (value, setter) => {
        return (
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`star-icon ${star <= value ? 'star-active' : 'star-inactive'}`}
                          onClick={() => setter(star)} style={{ cursor: 'pointer', fontSize: '2rem' }}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="feedback-container" style={{ maxWidth: 'none', margin: '0' }}>
                        <h1 className="page-title-underline">{t('feedback.titulo')}</h1>
                        
                        <div className="profile-layout-container" style={{ flexDirection: 'column', gap: '30px' }}>
                            <div className="content-box-light" style={{ width: '100%' }}>
                                <h3 className="section-subtitle">{t('feedback.seccao_opiniao')}</h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div><label>{t('feedback.nossas_receitas')}</label>{renderStars(notaReceitas, setNotaReceitas)}</div>
                                    <div><label>{t('feedback.nossos_eventos')}</label>{renderStars(notaEventos, setNotaEventos)}</div>
                                    <div><label>{t('feedback.seccao_frigorifico')}</label>{renderStars(notaFrigorifico, setNotaFrigorifico)}</div>
                                    <div><label>{t('feedback.design_estetica')}</label>{renderStars(notaEstetica, setNotaEstetica)}</div>
                                </div>

                                <h3 className="section-subtitle" style={{ marginTop: '30px' }}>{t('feedback.funcionalidade_favorita')}</h3>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {['Receitas', 'Eventos', 'Frigorifico', 'Estetica'].map(f => (
                                        <button key={f} 
                                                className={`feedback-category-btn ${funcFavorita === f ? 'active' : ''}`}
                                                onClick={() => setFuncFavorita(f)}>
                                            <span className="feedback-cat-icon">
                                                {f === 'Frigorifico' ? '❄️' : f === 'Estetica' ? '✨' : f === 'Receitas' ? '🍳' : '📅'}
                                            </span>
                                            {f === 'Frigorifico' ? t('feedback.frigorifico') : f === 'Estetica' ? t('feedback.estetica') : f === 'Receitas' ? t('feedback.receitas') : t('feedback.eventos')}
                                        </button>
                                    ))}
                                </div>

                                <h3 className="section-subtitle" style={{ marginTop: '30px' }}>{t('feedback.diz_nos_porque')}</h3>
                                <textarea className="auth-input" style={{ minHeight: '100px', width: '100%', resize: 'vertical' }}
                                    placeholder={t('feedback.placeholder_comentario')}
                                    value={comentarioLivre} onChange={e => setComentarioLivre(e.target.value)}
                                    maxLength="150"></textarea>

                                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#888', marginTop: '4px', marginBottom: '8px' }}>
                                    {comentarioLivre.length} / 150
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                    <button className="btn-create-submit" style={{ flex: 1 }} onClick={handleSubmit}>{t('feedback.submeter_feedback')}</button>
                                    {hasFeedback && (
                                        <button className="btn-create-submit" style={{ flex: 1, backgroundColor: 'transparent', color: 'red', border: '1px solid red' }} onClick={handleDelete}>{t('feedback.remover_feedback')}</button>
                                    )}
                                </div>
                            </div>

                            {stats && (
                                <div className="content-box-light" style={{ width: '100%' }}>
                                    <h3 className="section-subtitle">{t('feedback.resultados_comunidade')} ({stats.total_respostas} {t('feedback.respostas')})</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <h4>{t('feedback.media_avaliacoes')}</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                                                <li>{t('feedback.receitas')}: ⭐ {stats.averages.avg_receitas?.toFixed(1)}/5</li>
                                                <li>{t('feedback.eventos')}: ⭐ {stats.averages.avg_eventos?.toFixed(1)}/5</li>
                                                <li>{t('feedback.frigorifico')}: ⭐ {stats.averages.avg_frigorifico?.toFixed(1)}/5</li>
                                                <li>{t('feedback.estetica')}: ⭐ {stats.averages.avg_estetica?.toFixed(1)}/5</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4>{t('feedback.funcionalidade_favorita_poll')}</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                                                {Object.entries(stats.poll).map(([k, v]) => (
                                                    <li key={k}>
                                                        {k === 'Frigorifico' ? t('feedback.frigorifico') : k === 'Estetica' ? t('feedback.estetica') : k === 'Receitas' ? t('feedback.receitas') : t('feedback.eventos')}: {v} {t('feedback.votos')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="footer-spacer"></div>
          <Footer />
                </main>
            </div>
            <PopupModal isOpen={popupConfig.isOpen} title={popupConfig.title} message={popupConfig.message} singleButton={popupConfig.singleButton} confirmText={popupConfig.confirmText} cancelText={popupConfig.cancelText} onConfirm={popupConfig.onConfirm} onCancel={popupConfig.onCancel} />
        </div>
    );
};

export default FeedbackPage;
