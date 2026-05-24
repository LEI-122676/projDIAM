import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import DisplayCard from '../maincomponents/DisplayCard.jsx';
import Footer from '../maincomponents/Footer.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import SearchBar from '../maincomponents/SearchBar.jsx';

const AsMinhasReceitas = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const URL_BASE = 'http://localhost:8000';
    const RECEITAS_URL = `${URL_BASE}/idjango/api/receitas/`;
    const UTILIZADORES_URL = `${URL_BASE}/idjango/api/utilizadores/`;

    const [receitas, setReceitas] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFridgeFilterActive, setIsFridgeFilterActive] = useState(false);
    const [fridgeIngredients, setFridgeIngredients] = useState([]);
    
    const [currentPageCriadas, setCurrentPageCriadas] = useState(1);
    const [currentPageGuardadas, setCurrentPageGuardadas] = useState(1);
    const itemsPerPage = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '8', 10);
    
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const userId = localStorage.getItem('utilizadorId');

    const getReceitas = () => {
        axios.get(RECEITAS_URL)
            .then(res => setReceitas(res.data))
            .catch(err => console.error("Erro ao carregar receitas:", err));
    };

    useEffect(() => {
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('receitas.popups.acesso_restrito_receitas_msg'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                cancelText: t('comum.cancelar'),
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        getReceitas();
    }, [userId, navigate]);

    useEffect(() => {
        setCurrentPageCriadas(1);
        setCurrentPageGuardadas(1);
    }, [searchQuery, isFridgeFilterActive]);

    const handleFridgeFilterToggle = (forceValue) => {
        if (!userId) return;

        const shouldBeActive = typeof forceValue === 'boolean' ? forceValue : !isFridgeFilterActive;

        if (!shouldBeActive) {
            setIsFridgeFilterActive(false);
            setFridgeIngredients([]);
            return;
        }

        axios.get(`${UTILIZADORES_URL}${userId}/frigorifico`)
            .then(res => {
                const ingredientes = res.data.ingredientes;
                if (!ingredientes || ingredientes.length === 0) {
                    setPopupConfig({
                        isOpen: true,
                        title: t('receitas.popups.frigorifico_vazio_titulo'),
                        message: t('receitas.popups.frigorifico_vazio_msg'),
                        singleButton: false,
                        confirmText: t('receitas.popups.ir_para_frigorifico'),
                        cancelText: t('comum.cancelar'),
                        onConfirm: () => navigate('/frigorifico'),
                        onCancel: closePopup
                    });
                } else {
                    setFridgeIngredients(ingredientes);
                    setIsFridgeFilterActive(true);
                }
            })
            .catch(err => {
                console.error("Erro ao carregar frigorífico:", err);
                    setPopupConfig({
                        isOpen: true,
                        title: t('receitas.popups.sem_frigorifico_titulo'),
                        message: t('receitas.popups.sem_frigorifico_msg'),
                        singleButton: false,
                        confirmText: t('receitas.popups.ir_para_frigorifico'),
                        cancelText: t('comum.cancelar'),
                        onConfirm: () => navigate('/frigorifico'),
                        onCancel: closePopup
                    });
            });
    };

    const filteredReceitas = receitas.filter(receita => {
        const nomeReceita = receita.nome || "";
        const matchesSearch = nomeReceita.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFridge = true;
        if (isFridgeFilterActive) {
            if (fridgeIngredients.length === 0) {
                matchesFridge = false;
            } else if (!receita.ingredientes || receita.ingredientes.length === 0) {
                matchesFridge = false;
            } else {
                const fridgeIds = (fridgeIngredients || []).map(id => {
                    if (typeof id === 'object' && id !== null) return Number(id.id);
                    return Number(id);
                });

                matchesFridge = (receita.ingredientes || []).some(ingId => {
                    const idToMatch = typeof ingId === 'object' && ingId !== null ? Number(ingId.id) : Number(ingId);
                    return fridgeIds.includes(idToMatch);
                });
            }
        }
        return matchesSearch && matchesFridge;
    });


    const criadasPorMim = filteredReceitas.filter(r => Number(r.criador) === Number(userId));
    const receitasGuardadas = filteredReceitas.filter(r => (r.guardadores || []).map(Number).includes(Number(userId)) && Number(r.criador) !== Number(userId));
    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="profile-grid profile-grid-full">

                        <h1 className="page-title-underline">{t('perfil.as_minhas_receitas')}</h1>

                        <div className="recipes-action-bar">
                            <SearchBar
                                placeholder={t('receitas.pesquisar_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />

                            <div className="recipes-button-group">
                                <button
                                    className={`btn-filter-fridge ${isFridgeFilterActive ? 'active' : ''}`}
                                    onClick={handleFridgeFilterToggle}
                                >
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg icon-mr-8" />
                                    {t('receitas.filtro_frigorifico')}
                                    <img src={iconeFrig} alt="Frigorifico" className="recipe-icon-svg icon-ml-8" />
                                </button>

                                <button className="btn-add-recipe" onClick={() => navigate('/receitas/criar-receita')}>+</button>
                            </div>
                        </div>

                        <div className="mt-30">
                            <h2 className="my-recipes-section-title">{t('receitas.criadas_por_mim')}</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedCriadas = [...criadasPorMim].reverse();
                                    const indexOfLast = currentPageCriadas * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentCriadas = reversedCriadas.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentCriadas.map((receita) => (
                                        <DisplayCard
                                            key={`criada-${receita.id}`}
                                            title={receita.nome}
                                            imageUrl={receita.foto_url ? `${URL_BASE}${receita.foto_url}` : null}
                                            fallbackText="🍲"
                                            rating={receita.classificacao}
                                            onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                        />
                                    ));
                                })()}
                                {criadasPorMim.length === 0 && (
                                    <p className="text-empty-state">
                                        {t('receitas.sem_receitas_criadas')}
                                    </p>
                                )}
                            </div>
                            <Pagination
                                currentPage={currentPageCriadas}
                                totalItems={criadasPorMim.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPageCriadas}
                            />
                        </div>

                        <div className="mt-50">
                            <h2 className="my-recipes-section-title">{t('receitas.receitas_guardadas')}</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedGuardadas = [...receitasGuardadas].reverse();
                                    const indexOfLast = currentPageGuardadas * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentGuardadas = reversedGuardadas.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentGuardadas.map((receita) => (
                                        <DisplayCard
                                            key={`guardada-${receita.id}`}
                                            title={receita.nome}
                                            imageUrl={receita.foto_url ? `${URL_BASE}${receita.foto_url}` : null}
                                            fallbackText="🍲"
                                            rating={receita.classificacao}
                                            onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                        />
                                    ));
                                })()}
                                {receitasGuardadas.length === 0 && (
                                    <p className="text-empty-state">
                                        {t('receitas.sem_receitas_guardadas')}
                                    </p>
                                )}
                            </div>
                            <Pagination
                                currentPage={currentPageGuardadas}
                                totalItems={receitasGuardadas.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPageGuardadas}
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

export default AsMinhasReceitas;