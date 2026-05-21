import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { validateInput } from '../../utils/validation.js';

const FeedbackPage = () => {
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
        fetchStats();
        if (userId) {
            fetchMyFeedback();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

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
                isOpen: true, title: 'Login Necessário', message: 'Precisas de iniciar sessão para dar feedback.',
                singleButton: false, confirmText: 'Login', cancelText: 'Cancelar',
                onConfirm: () => navigate('/login'), onCancel: closePopup
            });
            return;
        }

        if (!notaReceitas || !notaEventos || !notaFrigorifico || !notaEstetica || !funcFavorita) {
            setPopupConfig({
                isOpen: true, title: 'Dados Incompletos', message: 'Por favor, avalia todas as categorias e escolhe a tua funcionalidade favorita.',
                singleButton: true, confirmText: 'OK', onConfirm: closePopup
            });
            return;
        }

        if (comentarioLivre) {
            const validation = validateInput(comentarioLivre, 150);
            if (!validation.isValid) {
                setPopupConfig({
                    isOpen: true, title: 'Comentário Inválido', message: validation.error,
                    singleButton: true, confirmText: 'OK', onConfirm: closePopup
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
                isOpen: true, title: 'Sucesso', message: 'Feedback guardado com sucesso! Obrigado pela tua contribuição.',
                singleButton: true, confirmText: 'OK', onConfirm: () => {
                    closePopup();
                    fetchStats(); // recarrega os graficos
                    fetchMyFeedback(); // recarrega o feedback do utilizador
                }
            });
        })
        .catch(err => {
            console.error(err);
            setPopupConfig({
                isOpen: true, title: 'Erro', message: 'Ocorreu um erro ao enviar o feedback. Tenta novamente mais tarde.',
                singleButton: true, confirmText: 'OK', onConfirm: closePopup
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
                isOpen: true, title: 'Removido', message: 'O teu feedback foi removido com sucesso.',
                singleButton: true, confirmText: 'OK', onConfirm: () => {
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
                isOpen: true, title: 'Erro', message: 'Ocorreu um erro ao remover o feedback.',
                singleButton: true, confirmText: 'OK', onConfirm: closePopup
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
                    <div className="feedback-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h1 className="page-title-underline">Ajuda-nos a Melhorar</h1>
                        <p style={{ color: '#716259', marginBottom: '30px', fontSize: '1.1rem' }}>A tua opinião é fundamental para melhorarmos a nossa plataforma. Por favor, partilha o teu feedback!</p>
                        
                        <div className="profile-layout-container" style={{ flexDirection: 'column', gap: '30px' }}>
                            <div className="content-box-light" style={{ width: '100%' }}>
                                <h3 className="section-subtitle">O que achas das seguintes secções?</h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div><label>As nossas Receitas</label>{renderStars(notaReceitas, setNotaReceitas)}</div>
                                    <div><label>Os nossos Eventos</label>{renderStars(notaEventos, setNotaEventos)}</div>
                                    <div><label>A secção do Frigorífico</label>{renderStars(notaFrigorifico, setNotaFrigorifico)}</div>
                                    <div><label>Design e Estética Geral</label>{renderStars(notaEstetica, setNotaEstetica)}</div>
                                </div>

                                <h3 className="section-subtitle" style={{ marginTop: '30px' }}>Qual é a tua funcionalidade favorita?</h3>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                    {['Receitas', 'Eventos', 'Frigorifico', 'Estetica'].map(f => (
                                        <button key={f} 
                                                className={`btn-profile-pill ${funcFavorita === f ? '' : 'secondary'}`}
                                                onClick={() => setFuncFavorita(f)}>
                                            {f === 'Frigorifico' ? 'Frigorífico' : f === 'Estetica' ? 'Estética' : f}
                                        </button>
                                    ))}
                                </div>

                                <h3 className="section-subtitle" style={{ marginTop: '30px' }}>Diz-nos o porquê (Opcional)</h3>
                                <textarea className="auth-input" style={{ minHeight: '100px', width: '100%', resize: 'vertical' }}
                                    placeholder="Gostei muito disto, porque..."
                                    value={comentarioLivre} onChange={e => setComentarioLivre(e.target.value)}
                                    maxLength="150"></textarea>

                                <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                    <button className="btn-create-submit" onClick={handleSubmit}>Submeter Feedback</button>
                                    {hasFeedback && (
                                        <button className="btn-profile-pill secondary" style={{ color: 'red', borderColor: 'red' }} onClick={handleDelete}>Remover Feedback</button>
                                    )}
                                </div>
                            </div>

                            {stats && (
                                <div className="content-box-light" style={{ width: '100%' }}>
                                    <h3 className="section-subtitle">Resultados da Comunidade ({stats.total_respostas} respostas)</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <h4>Média das Avaliações</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                                                <li>Receitas: ⭐ {stats.averages.avg_receitas?.toFixed(1)}/5</li>
                                                <li>Eventos: ⭐ {stats.averages.avg_eventos?.toFixed(1)}/5</li>
                                                <li>Frigorífico: ⭐ {stats.averages.avg_frigorifico?.toFixed(1)}/5</li>
                                                <li>Estética: ⭐ {stats.averages.avg_estetica?.toFixed(1)}/5</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4>Funcionalidade Favorita (Poll)</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                                                {Object.entries(stats.poll).map(([k, v]) => (
                                                    <li key={k}>
                                                        <strong>{k === 'Frigorifico' ? 'Frigorífico' : k === 'Estetica' ? 'Estética' : k}</strong>: {v} votos
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <PopupModal isOpen={popupConfig.isOpen} title={popupConfig.title} message={popupConfig.message} singleButton={popupConfig.singleButton} confirmText={popupConfig.confirmText} cancelText={popupConfig.cancelText} onConfirm={popupConfig.onConfirm} onCancel={popupConfig.onCancel} />
        </div>
    );
};

export default FeedbackPage;
