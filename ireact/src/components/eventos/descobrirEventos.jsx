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

    const URL_EVENTOS = 'http://localhost:8000/idjango/api/eventos/';
    const URL_USER = 'http://localhost:8000/idjango/api/user/';

    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [eventos, setEventos] = React.useState([]);
    const [userName, setUsername] = React.useState(null);

    // Estado para guardar a data selecionada no formato "YYYY-MM-DD"
    const [dataFiltro, setDataFiltro] = useState('');

    // Referência para o input invisível de data
    const dateInputRef = useRef(null);

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

    // Abre o seletor nativo de data ao clicar na div pai
    const handleWrapperClick = (e) => {
        if (dateInputRef.current) {
            if (typeof dateInputRef.current.showPicker === 'function') {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.click();
            }
        }
    };

    // Formata a data de "YYYY-MM-DD" para "DD/MM/YYYY" para exibição limpa
    const formatarDataExibicao = (dataStr) => {
        if (!dataStr) return "Filtrar por data";
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    // Lógica de filtragem combinada (Pesquisa por texto + Filtro por Data)
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
                                        style={{ color: 'black' }}
                                    />
                                    <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                                </div>
                                
                                <div className="recipes-button-group">
                                    {/* Botão de Calendário com evento de clique em toda a área */}
                                    <div className="calendar-filter-wrapper" onClick={handleWrapperClick}>
                                        
                                        {/* 1. O input fica no topo do DOM interno do wrapper */}
                                        <input 
                                            type="date" 
                                            ref={dateInputRef}
                                            className="calendar-hidden-input"
                                            value={dataFiltro}
                                            onChange={(e) => setDataFiltro(e.target.value)}
                                        />

                                        {/* 2. Elementos visuais (ficam organizados lado a lado) */}
                                        <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg" style={{marginRight: '6px'}} />
                                        <img src={iconeCalendario} alt="Calendário" className="recipe-icon-svg" style={{marginRight: '8px'}} />
                                        
                                        <span className="calendar-display-text" style={{ color: 'black', fontWeight: '600', marginRight: dataFiltro ? '4px' : '0' }}>
                                            {formatarDataExibicao(dataFiltro)}
                                        </span>
                                        
                                        {/* 3. O botão de limpar ganha um zIndex alto para ficar acima da máscara do input invisível */}
                                        {dataFiltro && (
                                            <button 
                                                className="clear-date-btn" 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Trava a propagação para o wrapper
                                                    setDataFiltro('');
                                                    if (dateInputRef.current) {
                                                        dateInputRef.current.value = ''; 
                                                    }
                                                }}
                                                style={{ position: 'relative', zIndex: 10 }} // Adicionado zIndex para garantir o clique
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
                            {eventosFiltrados.reverse().map((evento, index) => (
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
                            {eventosFiltrados.length === 0 && (
                                <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                                    Nenhum evento encontrado com estes critérios.
                                </p>
                            )}
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

export default ExplorarEventos;