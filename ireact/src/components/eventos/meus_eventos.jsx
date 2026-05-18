import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';

const OsMeusEventos = () => {
    const navigate = useNavigate();

    const RECEITAS_URL = 'http://localhost:8000/idjango/api/eventos/';
    const UTILIZADORES_URL = 'http://localhost:8000/idjango/api/utilizadores/';

    const [eventos, setEventos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const userId = localStorage.getItem('utilizadorId');

    const getEventos = () => {
        axios.get(RECEITAS_URL)
            .then(res => setEventos(res.data))
            .catch(err => console.error("Erro ao carregar receitas:", err));
    };

    useEffect(() => {
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para ver as tuas receitas.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        getEventos();
    }, [userId, navigate]);


    // Filtrar primeiro pelas condições globais (texto e frigorífico)
    const filteredEventos = eventos.filter(evento => {
        const nomeEvento = evento.nome || "";
        const matchesSearch = nomeEvento.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });


    const criadasPorMim = filteredEventos.filter(r => Number(r.criador) === Number(userId));
    const eventosInscritos = filteredEventos.filter(r => (r.inscritos || []).map(Number).includes(Number(userId)) && Number(r.criador) !== Number(userId));
    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="profile-grid profile-grid-full">

                        <h1 className="page-title-underline">Os Meus Eventos</h1>

                        <div className="recipes-action-bar">
                            <div className="recipes-search-container">
                                <input
                                    type="text"
                                    placeholder="Pesquisar eventos..."
                                    className="main-search-input recipe-search-box text-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                            </div>

                            <div className="recipes-button-group">
                                <button className="btn-add-recipe" onClick={() => navigate('/eventos/criarEvento')}>+</button>
                            </div>
                        </div>

                        {/* SECÇÃO: CRIADAS POR MIM */}
                        <div className="mt-30">
                            <h2 className="my-recipes-section-title">Criados por Mim</h2>
                            <div className="recipes-grid mt-20">
                                {[...criadasPorMim].reverse().map((evento) => (
                                    <div
                                        key={`criada-${evento.id}`}
                                        className="recipe-card-premium"
                                        onClick={() => navigate('/eventos/verEvento', { state: { id: evento.id } })}
                                        style={{ position: 'relative' }}
                                    >
                                        <div className="recipe-image-placeholder">
                                            {(evento.foto_url || evento.foto) ? (
                                                <img
                                                    src={`http://localhost:8000${(evento.foto_url || evento.foto).startsWith('/') ? '' : '/'}${evento.foto_url || evento.foto}`}
                                                    alt={evento.nome}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <img
                                                    src={`http://localhost:8000/idjango/media/defaultEvent.png`}
                                                    alt={evento.nome}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            )}
                                        </div>
                                        <div className="recipe-card-footer">
                                            <span className="ingredient-name">{evento.nome}</span>
                                        </div>
                                    </div>
                                ))}
                                {criadasPorMim.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não tens nenhum evento criado.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-50">
                            <h2 className="my-recipes-section-title">Eventos Inscritos</h2>
                            <div className="recipes-grid mt-20">
                                {[...eventosInscritos].reverse().map((evento) => (
                                    <div
                                        key={`guardada-${evento.id}`}
                                        className="recipe-card-premium"
                                        onClick={() => navigate('/eventos/verEvento', { state: { id: evento.id } })}
                                        style={{ position: 'relative' }}
                                    >

                                        <div className="recipe-image-placeholder">
                                            {(evento.foto_url || evento.foto) ? (
                                                <img
                                                    src={`http://localhost:8000${(evento.foto_url || evento.foto).startsWith('/') ? '' : '/'}${evento.foto_url || evento.foto}`}
                                                    alt={evento.nome}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <img
                                                    src={`http://localhost:8000/idjango/media/defaultEvent.png`}
                                                    alt={evento.nome}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            )}
                                        </div>
                                        <div className="recipe-card-footer">
                                            <span className="ingredient-name">{evento.nome}</span>
                                        </div>
                                    </div>
                                ))}
                                {eventosInscritos.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não se inscreveu em nenhum evento.
                                    </p>
                                )}
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

export default OsMeusEventos;