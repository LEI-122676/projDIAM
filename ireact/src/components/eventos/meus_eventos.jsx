import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import DisplayCard from '../maincomponents/DisplayCard.jsx';
import Footer from '../maincomponents/Footer.jsx';

const OsMeusEventos = () => {
    const navigate = useNavigate();

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
                                        Ainda não tens nenhum evento criado.
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
                            <h2 className="my-recipes-section-title">Eventos Inscritos</h2>
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
                                        Ainda não se inscreveu em nenhum evento.
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
                confirmText={popupConfig.confirmText || 'OK'}
                cancelText={popupConfig.cancelText || 'Cancelar'}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default OsMeusEventos;