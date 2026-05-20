import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';

const OsMeusEventos = () => {
    const navigate = useNavigate();

    const RECEITAS_URL = 'http://localhost:8000/idjango/api' + '/eventos/';
    const UTILIZADORES_URL = 'http://localhost:8000/idjango/api' + '/utilizadores/';

    const [eventos, setEventos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [currentPageCriados, setCurrentPageCriados] = useState(1);
    const [currentPageInscritos, setCurrentPageInscritos] = useState(1);
    const itemsPerPage = 8;
    
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

    useEffect(() => {
        setCurrentPageCriados(1);
        setCurrentPageInscritos(1);
    }, [searchQuery]);


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

                        <div className="mt-30">
                            <h2 className="my-recipes-section-title">Criados por Mim</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedCriados = [...criadasPorMim].reverse();
                                    const indexOfLast = currentPageCriados * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentCriados = reversedCriados.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentCriados.map((evento) => (
                                        <div
                                            key={`criada-${evento.id}`}
                                            className="recipe-card-premium cursor-pointer relative-container"
                                            onClick={() => navigate('/eventos/verEvento', { state: { id: evento.id } })}
                                        >
                                            <div className="recipe-image-placeholder">
                                                {(evento.foto_url || evento.foto) ? (
                                                    <img
                                                        src={`http://localhost:8000${(evento.foto_url || evento.foto).startsWith('/') ? '' : '/'}${evento.foto_url || evento.foto}`}
                                                        alt={evento.nome}
                                                        className="cover-image"
                                                    />
                                                ) : (
                                                    <img
                                                        src="http://localhost:8000/idjango/media/defaultEvent.png"
                                                        alt={evento.nome}
                                                        className="cover-image"
                                                    />
                                                )}
                                            </div>
                                            <div className="recipe-card-footer">
                                                <span className="ingredient-name">{evento.nome}</span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                {criadasPorMim.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não tens nenhum evento criado.
                                    </p>
                                )}
                            </div>
                            {Math.ceil(criadasPorMim.length / itemsPerPage) > 1 && (
                                <div className="pagination-container flex-center mt-30 gap-20-pb30">
                                    <button
                                        className="btn-popup-confirm pagination-btn"
                                        onClick={() => setCurrentPageCriados(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPageCriados === 1}
                                    >
                                        Anterior
                                    </button>
                                    
                                    <span className="pagination-page-display">
                                        Página
                                        <select
                                            value={currentPageCriados}
                                            onChange={(e) => setCurrentPageCriados(Number(e.target.value))}
                                            className="page-select-dropdown"
                                        >
                                            {Array.from({ length: Math.ceil(criadasPorMim.length / itemsPerPage) }, (_, i) => i + 1).map(num => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                        de {Math.ceil(criadasPorMim.length / itemsPerPage)}
                                    </span>
                                    
                                    <button
                                        className="btn-popup-confirm pagination-btn"
                                        onClick={() => setCurrentPageCriados(prev => Math.min(prev + 1, Math.ceil(criadasPorMim.length / itemsPerPage)))}
                                        disabled={currentPageCriados === Math.ceil(criadasPorMim.length / itemsPerPage)}
                                    >
                                        Seguinte
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="mt-50">
                            <h2 className="my-recipes-section-title">Eventos Inscritos</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedInscritos = [...eventosInscritos].reverse();
                                    const indexOfLast = currentPageInscritos * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentInscritos = reversedInscritos.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentInscritos.map((evento) => (
                                        <div
                                            key={`guardada-${evento.id}`}
                                            className="recipe-card-premium cursor-pointer relative-container"
                                            onClick={() => navigate('/eventos/verEvento', { state: { id: evento.id } })}
                                        >

                                            <div className="recipe-image-placeholder">
                                                {(evento.foto_url || evento.foto) ? (
                                                    <img
                                                        src={`http://localhost:8000${(evento.foto_url || evento.foto).startsWith('/') ? '' : '/'}${evento.foto_url || evento.foto}`}
                                                        alt={evento.nome}
                                                        className="cover-image"
                                                    />
                                                ) : (
                                                    <img
                                                        src="http://localhost:8000/idjango/media/defaultEvent.png"
                                                        alt={evento.nome}
                                                        className="cover-image"
                                                    />
                                                )}
                                            </div>
                                            <div className="recipe-card-footer">
                                                <span className="ingredient-name">{evento.nome}</span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                {eventosInscritos.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não se inscreveu em nenhum evento.
                                    </p>
                                )}
                            </div>
                            {Math.ceil(eventosInscritos.length / itemsPerPage) > 1 && (
                                <div className="pagination-container flex-center mt-30 gap-20-pb30">
                                    <button
                                        className="btn-popup-confirm pagination-btn"
                                        onClick={() => setCurrentPageInscritos(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPageInscritos === 1}
                                    >
                                        Anterior
                                    </button>
                                    
                                    <span className="pagination-page-display">
                                        Página
                                        <select
                                            value={currentPageInscritos}
                                            onChange={(e) => setCurrentPageInscritos(Number(e.target.value))}
                                            className="page-select-dropdown"
                                        >
                                            {Array.from({ length: Math.ceil(eventosInscritos.length / itemsPerPage) }, (_, i) => i + 1).map(num => (
                                                <option key={num} value={num}>
                                                    {num}
                                                </option>
                                            ))}
                                        </select>
                                        de {Math.ceil(eventosInscritos.length / itemsPerPage)}
                                    </span>
                                    
                                    <button
                                        className="btn-popup-confirm pagination-btn"
                                        onClick={() => setCurrentPageInscritos(prev => Math.min(prev + 1, Math.ceil(eventosInscritos.length / itemsPerPage)))}
                                        disabled={currentPageInscritos === Math.ceil(eventosInscritos.length / itemsPerPage)}
                                    >
                                        Seguinte
                                    </button>
                                </div>
                            )}
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