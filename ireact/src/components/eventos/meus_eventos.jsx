import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import DisplayCard from '../maincomponents/DisplayCard.jsx';
import Footer from '../maincomponents/Footer.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import SearchBar from '../maincomponents/SearchBar.jsx';

const OsMeusEventos = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const URL_BASE = 'http://localhost:8000';
    const URL_EVENTOS = `${URL_BASE}/idjango/api/eventos/`;
    const URL_DEFAULT_EVENT = `${URL_BASE}/idjango/media/defaultEvent.png`;

    const [eventos, setEventos] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [currentPageCriados, setCurrentPageCriados] = useState(1);
    const [currentPageInscritos, setCurrentPageInscritos] = useState(1);
    const itemsPerPage = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '8', 10);
    
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const userId = localStorage.getItem('utilizadorId');

    const getEventos = () => {
        axios.get(URL_EVENTOS)
            .then(res => setEventos(res.data))
            .catch(err => console.error("Erro ao carregar receitas:", err));
    };

    useEffect(() => {
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: t('eventos.popups.acesso_restrito_titulo'),
                message: t('eventos.popups.acesso_restrito_eventos_msg'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                cancelText: t('comum.cancelar'),
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

                        <h1 className="page-title-underline">{t('eventos.meus_eventos')}</h1>

                        <div className="recipes-action-bar">
                            <SearchBar
                                placeholder={t('eventos.pesquisar_eventos')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <div className="recipes-button-group">
                                <button className="btn-add-recipe" onClick={() => navigate('/eventos/criarEvento')}>+</button>
                            </div>
                        </div>

                        <div className="mt-30">
                            <h2 className="my-recipes-section-title">{t('eventos.criados_por_mim')}</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedCriados = [...criadasPorMim].reverse();
                                    const indexOfLast = currentPageCriados * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentCriados = reversedCriados.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentCriados.map((evento) => {
                                        const fotoPath = evento.foto_url || evento.foto;
                                        const imageUrl = fotoPath 
                                            ? `${URL_BASE}${fotoPath.startsWith('/') ? '' : '/'}${fotoPath}` 
                                            : URL_DEFAULT_EVENT;

                                        return (
                                            <DisplayCard
                                                key={`criada-${evento.id}`}
                                                title={evento.nome}
                                                imageUrl={imageUrl}
                                                onClick={() => navigate('/eventos/verEvento', { state: { id: evento.id } })}
                                            />
                                        );
                                    });
                                })()}
                                {criadasPorMim.length === 0 && (
                                    <p className="text-empty-state">
                                        {t('eventos.sem_eventos_criados')}
                                    </p>
                                )}
                            </div>
                            <Pagination
                                currentPage={currentPageCriados}
                                totalItems={criadasPorMim.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPageCriados}
                            />
                        </div>

                        <div className="mt-50">
                            <h2 className="my-recipes-section-title">{t('eventos.eventos_inscritos')}</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedInscritos = [...eventosInscritos].reverse();
                                    const indexOfLast = currentPageInscritos * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentInscritos = reversedInscritos.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentInscritos.map((evento) => {
                                         const fotoPath = evento.foto_url || evento.foto;
                                         const imageUrl = fotoPath 
                                             ? `${URL_BASE}${fotoPath.startsWith('/') ? '' : '/'}${fotoPath}` 
                                             : URL_DEFAULT_EVENT;

                                         return (
                                             <DisplayCard
                                                 key={`guardada-${evento.id}`}
                                                 title={evento.nome}
                                                 imageUrl={imageUrl}
                                                 onClick={() => navigate('/eventos/verEvento', { state: { id: evento.id } })}
                                             />
                                         );
                                     });
                                })()}
                                {eventosInscritos.length === 0 && (
                                    <p className="text-empty-state">
                                        {t('eventos.sem_eventos_inscritos')}
                                    </p>
                                )}
                            </div>
                            <Pagination
                                currentPage={currentPageInscritos}
                                totalItems={eventosInscritos.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPageInscritos}
                            />
                        </div>
                    </div>
                    
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

export default OsMeusEventos;