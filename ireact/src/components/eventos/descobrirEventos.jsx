import React from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeCalendario from "../../assets/calendario.svg"; 
import { useNavigate } from 'react-router-dom';
import '../../css/styles.css';
import axios from 'axios';
import { useEffect } from 'react';
import { useState, useRef } from 'react';
import PopupModal from '../maincomponents/PopupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';

const ExplorarEventos = () => {

    const URL_EVENTOS = 'http://localhost:8000/idjango/api' + '/eventos/';
    const URL_USER = 'http://localhost:8000/idjango/api' + '/user/';

    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [eventos, setEventos] = React.useState([]);
    const [userName, setUsername] = React.useState(null);

    const [dataFiltro, setDataFiltro] = useState('');

    const dateInputRef = useRef(null);

    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = parseInt(import.meta.env.VITE_EVENTS_PER_PAGE || '20', 10);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        axios.get(URL_EVENTOS).then( response => setEventos(response.data))
        .catch( () => console.log("unable to load events"));

        axios.get(URL_USER, {withCredentials: true})
            .then( response => setUsername(response.data.username))
            .catch( () => console.log("user not logged in"));
    
    },[]);
    const handleWrapperClick = () => {
        if (dateInputRef.current) {
            if (typeof dateInputRef.current.showPicker === 'function') {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.click();
            }
        }
    };

    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return "Filtrar por data";
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dataFiltro]);

    const eventosFiltrados = eventos.filter(evento => {
        const nomeEvento = evento.nome || "";
        const matchesSearch = nomeEvento.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!dataFiltro) return matchesSearch;
        if (!evento.data_evento) return false;

        const dataEventoFormatada = evento.data_evento.substring(0, 10);
        return matchesSearch && (dataEventoFormatada === dataFiltro);
    });

    const handleCriarEvento = (e) =>{
        e.preventDefault();
        if( userName){
            navigate('/eventos/criarEvento')
        }
        else{
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para criar um novo evento. Crie uma conta ou faça login para criar o seu evento!',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
        }
    }

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="profile-grid event-grid-full">
                        <h1 className="page-title-underline">Descobrir Eventos</h1>
                            <div className="recipes-action-bar">
                                <div className="recipes-search-container">
                                    <input
                                        type="text"
                                        placeholder="Pesquisar eventos..."
                                        className="main-search-input recipe-search-box"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                                </div>
                                
                                <div className="recipes-button-group">
                                    <div className="calendar-filter-wrapper" onClick={handleWrapperClick}>
                                        
                                        <input 
                                            type="date" 
                                            ref={dateInputRef}
                                            className="calendar-hidden-input"
                                            value={dataFiltro}
                                            onChange={(e) => setDataFiltro(e.target.value)}
                                        />

                                        <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg mr-6" />
                                        <img src={iconeCalendario} alt="Calendário" className="recipe-icon-svg mr-8" />
                                        
                                        <span className={`calendar-display-text font-600 ${dataFiltro ? "mr-4" : ""}`}>
                                            {formatarDataExibicao(dataFiltro)}
                                        </span>
                                        
                                        {dataFiltro && (
                                            <button 
                                                className="clear-date-btn relative-z10" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDataFiltro('');
                                                    if (dateInputRef.current) {
                                                        dateInputRef.current.value = ''; 
                                                    }
                                                }}
                                                title="Limpar filtro de data"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    <button onClick={handleCriarEvento} className="btn-add-recipe">+</button>
                                </div>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {(() => {
                                const reversedFiltered = [...eventosFiltrados].reverse();
                                const indexOfLastEvent = currentPage * eventsPerPage;
                                const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
                                const currentEvents = reversedFiltered.slice(indexOfFirstEvent, indexOfLastEvent);

                                return currentEvents.map((evento, index) => (
                                <div 
                                    key={evento.id || index} 
                                    className="recipe-card-premium cursor-pointer relative-container"
                                    onClick={() => navigate('verEvento', { state: { id: evento.id } })}
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
                            {eventosFiltrados.length === 0 && (
                                <p className="full-width-center-mt20">
                                    Nenhum evento encontrado com estes critérios.
                                </p>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={eventosFiltrados.length}
                            itemsPerPage={eventsPerPage}
                            onPageChange={setCurrentPage}
                        />
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

export default ExplorarEventos;