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
import { useState, forwardRef } from 'react'; // 1. ADDED forwardRef HERE
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import DisplayCard from '../maincomponents/DisplayCard.jsx';
import Footer from '../maincomponents/Footer.jsx';

const ExplorarEventos = () => {
    const { t, language } = useLanguage();

    const URL_BASE = 'http://localhost:8000';
    const URL_EVENTOS = `${URL_BASE}/idjango/api/eventos/`;
    const URL_USER = `${URL_BASE}/idjango/api/user/`;
    const URL_DEFAULT_EVENT = `${URL_BASE}/idjango/media/defaultEvent.png`;

    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [eventos, setEventos] = useState([]);
    const [userName, setUsername] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const [dataFiltro, setStartDate] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = parseInt(import.meta.env.VITE_EVENTS_PER_PAGE || '20', 10);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        axios.get(URL_EVENTOS).then( response => setEventos(response.data))
        .catch( () => console.log("unable to load events"));

        const userId = localStorage.getItem('utilizadorId');
        if (userId) {
            axios.get(`${URL_BASE}/idjango/api/utilizadores/${userId}`, {withCredentials: true})
                .then( response => {
                    setUsername(response.data.username);
                    setUserRole(response.data.role);
                })
                .catch( () => console.log("user not logged in"));
        }
    
    },[]);

    const formatarDataExibicao = (dateObj) => {
        if (!dateObj) return t('eventos.filtrar_data');
        
        const localeCode = language === 'pt' ? 'pt-PT' : language === 'es' ? 'es-ES' : 'en-US';
        const formatador = new Intl.DateTimeFormat(localeCode, { month: 'long', year: 'numeric' });
        const dataFormatada = formatador.format(dateObj);
        
        return dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, dataFiltro]);

    const eventosFiltrados = eventos.filter(evento => {
        const nomeEvento = evento.nome || "";
        const matchesSearch = nomeEvento.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!dataFiltro) return matchesSearch;
        if (!evento.data_evento) return false;

        const [anoEvento, mesEvento] = evento.data_evento.split('-'); 
        const anoFiltro = dataFiltro.getFullYear().toString();
        const mesFiltro = (dataFiltro.getMonth() + 1).toString().padStart(2, '0');

        const matchesDate = (mesEvento === mesFiltro) && (anoEvento === anoFiltro);

        return matchesSearch && matchesDate;
    });

    const handleCriarEvento = (e) =>{
        e.preventDefault();
        if( userName){
            navigate('/eventos/criarEvento')
        }
        else{
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('eventos.popups.acesso_restrito_criar'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
        }
    }

    const CustomCalendarInput = forwardRef(({ onClick }, ref) => (
        <button className={`calendar-filter-wrapper ${dataFiltro ? 'active' : ''}`} onClick={onClick} ref={ref} type="button">
            <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg icon-mr-8" />
            
            <span className={`calendar-display-text font-600 ${dataFiltro ? "mr-4" : ""}`}>
                {formatarDataExibicao(dataFiltro)}
            </span>
            
            <img src={iconeCalendario} alt="Calendário" className="recipe-icon-svg icon-ml-8" />
            
            {dataFiltro && (
                <button 
                    className="clear-date-btn" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setStartDate(null);
                    }}
                    title="Limpar filtro de data"
                    type="button"
                >
                    ×
                </button>
            )}
        </button>
    ));

    CustomCalendarInput.displayName = 'CustomCalendarInput';

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="profile-grid event-grid-full">
                        <h1 className="page-title-underline">{t('eventos.descobrir_eventos')}</h1>
                            <div className="recipes-action-bar">
                                <div className="recipes-search-container">
                                    <input
                                        type="text"
                                        placeholder={t('eventos.pesquisar_eventos')}
                                        className="main-search-input recipe-search-box"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                                </div>
                                
                                <div className="recipes-button-group">
                                    <div className="datepicker-anchor">
                                            <DatePicker
                                                selected={dataFiltro}
                                                onChange={(date) => setStartDate(date)}
                                                dateFormat="MM/yyyy"
                                                showMonthYearPicker
                                                customInput={<CustomCalendarInput />}
                                                popperPlacement="bottom-end"
                                                popperModifiers={[
                                                    {
                                                        name: "preventOverflow",
                                                        options: { 
                                                            boundary: "viewport",
                                                            altAxis: true 
                                                        }
                                                    }
                                                ]}
                                            />
                                    </div>
                                    {(userRole === 'Admin' || userRole === 'EventOrganizer') && (
                                        <button onClick={handleCriarEvento} className="btn-add-recipe">+</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {(() => {
                                const reversedFiltered = [...eventosFiltrados].reverse();
                                const indexOfLastEvent = currentPage * eventsPerPage;
                                const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
                                const currentEvents = reversedFiltered.slice(indexOfFirstEvent, indexOfLastEvent);

                                return currentEvents.map((evento, index) => {
                                    const fotoPath = evento.foto_url || evento.foto;
                                    const imageUrl = fotoPath 
                                        ? `${URL_BASE}${fotoPath.startsWith('/') ? '' : '/'}${fotoPath}` 
                                        : URL_DEFAULT_EVENT;

                                    return (
                                        <DisplayCard
                                            key={evento.id || index}
                                            title={evento.nome}
                                            imageUrl={imageUrl}
                                            onClick={() => navigate('verEvento', { state: { id: evento.id } })}
                                        />
                                    );
                                });
                            })()}
                            {eventosFiltrados.length === 0 && (
                                <p className="full-width-center-mt20">
                                    {t('eventos.nenhum_evento_encontrado')}
                                </p>
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={eventosFiltrados.length}
                            itemsPerPage={eventsPerPage}
                            onPageChange={setCurrentPage}
                        />
                        
                        <div className="footer-spacer"></div>
          <Footer />
                </main>
                </div>
                <PopupModal 
                    isOpen={popupConfig.isOpen}
                    title={popupConfig.title}
                    message={popupConfig.message}
                    singleButton={popupConfig.singleButton}
                    confirmText={popupConfig.confirmText || t('comum.ok')}
                    cancelText={popupConfig.cancelText || t('comum.cancelar')}
                    onConfirm={popupConfig.onConfirm}
                    onCancel={popupConfig.onCancel}
                />
            </div>
    );
};

export default ExplorarEventos;