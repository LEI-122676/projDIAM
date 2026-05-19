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
    const eventsPerPage = 20;

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        axios.get(URL_EVENTOS).then( response => setEventos(response.data))
        .catch( () => console.log("unable to load events"));

        axios.get(URL_USER, {withCredentials: true})
            .then( response => setUsername(response.data.username))
            .catch( () => console.log("user not logged in"));
    
    },[]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/eventos?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleWrapperClick = (e) => {
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
                    <div className="profile-grid" style={{ margin: '0', maxWidth: '100%' }}>
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

                                        <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg" style={{marginRight: '6px'}} />
                                        <img src={iconeCalendario} alt="Calendário" className="recipe-icon-svg" style={{marginRight: '8px'}} />
                                        
                                        <span className="calendar-display-text" style={{ fontWeight: '600', marginRight: dataFiltro ? '4px' : '0' }}>
                                            {formatarDataExibicao(dataFiltro)}
                                        </span>
                                        
                                        {dataFiltro && (
                                            <button 
                                                className="clear-date-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDataFiltro('');
                                                    if (dateInputRef.current) {
                                                        dateInputRef.current.value = ''; 
                                                    }
                                                }}
                                                style={{ position: 'relative', zIndex: 10 }}
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
                                    className="recipe-card-premium cursor-pointer"
                                    onClick={() => navigate('verEvento', { state: { id: evento.id } })}
                                    style={{ cursor: 'pointer' }}
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
                                                src="http://localhost:8000/idjango/media/defaultEvent.png"
                                                alt={evento.nome}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                                <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                                    Nenhum evento encontrado com estes critérios.
                                </p>
                            )}
                        </div>

                        {Math.ceil(eventosFiltrados.length / eventsPerPage) > 1 && (
                            <div className="pagination-container flex-center mt-30" style={{ gap: '20px', paddingBottom: '30px' }}>
                                <button
                                    className="btn-popup-confirm"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '10px 25px',
                                        opacity: currentPage === 1 ? 0.4 : 1,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Anterior
                                </button>
                                
                                <span style={{ fontWeight: '600', minWidth: '160px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    Página
                                    <select
                                        value={currentPage}
                                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                                        className="page-select-dropdown"
                                    >
                                        {Array.from({ length: Math.ceil(eventosFiltrados.length / eventsPerPage) }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                    de {Math.ceil(eventosFiltrados.length / eventsPerPage)}
                                </span>
                                
                                <button
                                    className="btn-popup-confirm"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(eventosFiltrados.length / eventsPerPage)))}
                                    disabled={currentPage === Math.ceil(eventosFiltrados.length / eventsPerPage)}
                                    style={{
                                        padding: '10px 25px',
                                        opacity: currentPage === Math.ceil(eventosFiltrados.length / eventsPerPage) ? 0.4 : 1,
                                        cursor: currentPage === Math.ceil(eventosFiltrados.length / eventsPerPage) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Seguinte
                                </button>
                            </div>
                        )}
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