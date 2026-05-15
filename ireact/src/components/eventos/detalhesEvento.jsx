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
                    <h1 className="page-title-underline">{evento.nome}</h1>
                    <div className="create-recipe-container">
                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>Descrição:</label>
                                <label>{evento.descricao}</label>
                            </div>
                        </div> 
                        <div className="recipe-image-section">
                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)} >Voltar</button>
                                <button className="btn-create-submit">Criar</button>
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