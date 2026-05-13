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
import { useState } from 'react';
import PopupModal from '../maincomponents/PopupModal.jsx';


const ExplorarEventos = () => {

    const URL_EVENTOS = 'http://localhost:8000/idjango/api/eventos/';
    const URL_USER = 'http://localhost:8000/idjango/api/user/';

    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = React.useState('');
    const [eventos, setEventos] = React.useState([]);

    const [userName, setUsername] = React.useState(null);

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

    const eventosFiltrados = eventos.filter( evento =>{
        const nomeEvento = evento.nome || "";
        const matchesSearch = nomeEvento.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch
    })

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
                    {/* Alinhado à esquerda */}
                    <div className="profile-grid" style={{ margin: '0', maxWidth: '100%' }}>
                        { userName ? <><h1 className="page-title-underline">Descobrir Eventos - {userName}</h1></>:
                        <><h1 className="page-title-underline">Descobrir Eventos</h1></>}
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
                                    <button className="btn-filter-fridge">
                                        <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg" style={{marginRight: '8px'}} />
                                        Calendario
                                        <img src={iconeCalendario} alt="Calendario" className="recipe-icon-svg" style={{marginLeft: '8px'}} />
                                    </button>

                                    <button onClick={handleCriarEvento} className="btn-add-recipe">+</button>
                                </div>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {eventosFiltrados.map((evento, index) => (
                                <div 
                                    key={evento.id || index} 
                                    className="recipe-card" 
                                    onClick={() => navigate('eventos/verEvento', { state: { id: evento.id } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="recipe-image-placeholder">
                                        <span style={{ fontSize: '40px', color: '#D1CDBC' }}>✕</span>
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