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
    
    // Get the ID passed through navigate state
    const eventoId = location.state?.id;

    const [evento, setEvento] = useState(null);
    const utilizadorId = localStorage.getItem('utilizadorId');
    const [inscrito, setInscrito] = useState(false);

    const [popupConfig, setPopupConfig] = useState({ 
        isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} 
    });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const EVENTO_URL = 'http://localhost:8000/idjango/api/eventos/';

    useEffect(() => {
        if (!eventoId) {
            navigate(-1);
            return;
        }

        // Fetch Event details
        axios.get(`${EVENTO_URL}${eventoId}`)
            .then(res => {
                setEvento(res.data);
                // Check if current user is in the participants list
                if (utilizadorId && res.data.inscritos?.includes(parseInt(utilizadorId, 10))) {
                    setInscrito(true);
                }
            })
            .catch(err => console.error("Erro ao carregar evento:", err));
    }, [eventoId, utilizadorId, navigate]);

    const handleJoin = () => {
        if (!utilizadorId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para te inscreveres neste evento.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
            return;
        }

        const isAlreadyInscribed = inscrito;
        let newInscritos = [...(evento.inscritos || [])];

        if (isAlreadyInscribed) {
            newInscritos = newInscritos.filter(id => id !== parseInt(utilizadorId, 10));
        } else {
            newInscritos.push(parseInt(utilizadorId, 10));
        }

        const updatedPayload = { ...evento, inscritos: newInscritos };

        axios.put(`${EVENTO_URL}${eventoId}`, updatedPayload)
            .then(res => {
                setEvento(res.data);
                setInscrito(!isAlreadyInscribed);
                // Optional: show a success message via popup
            })
            .catch(err => console.error("Erro ao atualizar inscrição:", err));
    };

    if (!evento) return <div className="loading-container">A carregar evento...</div>;

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="event-header-container">
                        {/* Title and Buttons Section */}
                        <div className="event-title-section">
                            <h1 className="page-title-underline">{evento.nome}</h1>
                            <div className="event-actions">
                                <button className="btn-voltar" onClick={() => navigate(-1)}>Voltar</button>
                                <button 
                                    className={inscrito ? "btn-join joined" : "btn-join"} 
                                    onClick={handleJoin}
                                >
                                    {inscrito ? 'Sair' : 'Join'}
                                </button>
                            </div>
                        </div>

                        {/* Event Details Grid */}
                        <div className="event-grid-layout">
                            <div className="event-info-main">
                                <p className="event-meta-info">
                                    <span className="icon">👤</span> <strong>Organizado por:</strong> {evento.criador_nome || 'Organizador'}
                                </p>
                                <p className="event-meta-info">
                                    <span className="icon">📅</span> <strong>Data:</strong> {new Date(evento.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                
                                <div className="description-section">
                                    <h3>Descrição:</h3>
                                    <div className="description-box-beige">
                                        {evento.descricao}
                                    </div>
                                </div>
                            </div>

                            {/* Main Image Placeholder */}
                            <div className="event-image-placeholder-large">
                                <div className="placeholder-x">✕</div>
                            </div>
                        </div>

                        {/* Bottom Row: Secondary Image and Schedule */}
                        <div className="event-bottom-grid">
                            <div className="event-image-placeholder-small">
                                <div className="placeholder-x">✕</div>
                            </div>

                            <div className="schedule-section">
                                <h3>Horário</h3>
                                <ul className="schedule-list">
                                    <li><strong>12:00</strong> Recepção</li>
                                    <li><strong>13:30</strong> Início da Atividade</li>
                                    <li><strong>15:00</strong> Coffee Break</li>
                                    <li><strong>16:30</strong> Encerramento</li>
                                </ul>
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