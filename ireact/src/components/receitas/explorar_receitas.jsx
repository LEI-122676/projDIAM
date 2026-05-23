import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import DisplayCard from '../maincomponents/DisplayCard.jsx';
import Footer from '../maincomponents/Footer.jsx';

const ExplorarReceitas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const autoFilterAttempted = useRef(false);
    const { t } = useLanguage();

    const URL_BASE = 'http://localhost:8000';
    const RECEITAS_URL = `${URL_BASE}/idjango/api/receitas/`;
    const UTILIZADORES_URL = `${URL_BASE}/idjango/api/utilizadores/`;

    const [receitas, setReceitas] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFridgeFilterActive, setIsFridgeFilterActive] = useState(false);
    const [fridgeIngredients, setFridgeIngredients] = useState([]);
    const [ratingFilter, setRatingFilter] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = parseInt(import.meta.env.VITE_RECIPES_PER_PAGE || '20', 10);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const getReceitas = () => {
        axios.get(RECEITAS_URL)
            .then(res => setReceitas(res.data || []))
            .catch(err => console.error("Erro ao carregar receitas:", err));
    };

    useEffect(() => {
        getReceitas();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, isFridgeFilterActive, ratingFilter]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParam = params.get('search');
        if (searchParam) {
            setSearchQuery(decodeURIComponent(searchParam));
        }
    }, [location.search]);

    const handleFridgeFilterToggle = (forceValue) => {
        const userId = localStorage.getItem('utilizadorId');

        const shouldBeActive = typeof forceValue === 'boolean' ? forceValue : !isFridgeFilterActive;

        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('receitas.popups.acesso_restrito_frigorifico'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
            return;
        }

        if (!shouldBeActive) {
            setIsFridgeFilterActive(false);
            setFridgeIngredients([]);
            return;
        }

        axios.get(`${UTILIZADORES_URL}${userId}/frigorifico`, { withCredentials: true })
            .then(res => {
                const ingredientes = res.data.ingredientes;
                if (!ingredientes || ingredientes.length === 0) {
                    setPopupConfig({
                        isOpen: true,
                        title: t('receitas.popups.frigorifico_vazio_titulo'),
                        message: t('receitas.popups.frigorifico_vazio_msg'),
                        singleButton: false,
                        confirmText: t('receitas.popups.ir_para_frigorifico'),
                        onConfirm: () => navigate('/frigorifico'),
                        onCancel: closePopup
                    });
                } else {
                    setFridgeIngredients(ingredientes || []);
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
                    onConfirm: () => navigate('/frigorifico'),
                    onCancel: closePopup
                });
            });
    };

    useEffect(() => {
        if (location.state?.autoFridge && !autoFilterAttempted.current) {
            autoFilterAttempted.current = true;
            handleFridgeFilterToggle(true);
        }
    }, [location]);

    const handleAddRecipeClick = () => {
        const userId = localStorage.getItem('utilizadorId');
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.acesso_restrito_titulo'),
                message: t('receitas.popups.acesso_restrito_criar'),
                singleButton: false,
                confirmText: t('comum.iniciar_sessao'),
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
        } else {
            navigate('/receitas/criar-receita');
        }
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

                matchesFridge = (receita.ingredientes || []).every(ing => {
                    const recipeIngId = typeof ing === 'object' && ing !== null ? Number(ing.id) : Number(ing);
                    return fridgeIds.includes(recipeIngId);
                });
            }
        }

        let matchesRating = true;
        if (ratingFilter !== 'all') {
            const minRating = parseFloat(ratingFilter);
            const recipeRating = receita.classificacao !== undefined && receita.classificacao !== null ? Number(receita.classificacao) : 0.0;
            matchesRating = recipeRating >= minRating;
        }

        return matchesSearch && matchesFridge && matchesRating;
    });

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="profile-grid profile-grid-full">

                        <h1 className="page-title-underline">{t('receitas.explorar_titulo')}</h1>

                        <div className="recipes-action-bar">
                            <div className="recipes-search-container">
                                <input
                                    type="text"
                                    placeholder={t('receitas.pesquisar_placeholder')}
                                    className="main-search-input recipe-search-box text-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                            </div>

                            <div className="recipes-button-group">
                                <div className={`rating-filter-wrapper ${ratingFilter !== 'all' ? 'active' : ''}`}>
                                    <select
                                        className="rating-filter-select-hidden"
                                        value={ratingFilter}
                                        onChange={(e) => setRatingFilter(e.target.value)}
                                    >
                                        <option value="all">{t('receitas.classificacao_todas')}</option>
                                        <option value="4.5">★ 4.5 {t('receitas.classificacao_superior')}</option>
                                        <option value="4.0">★ 4.0 {t('receitas.classificacao_superior')}</option>
                                        <option value="3.0">★ 3.0 {t('receitas.classificacao_superior')}</option>
                                        <option value="2.0">★ 2.0 {t('receitas.classificacao_superior')}</option>
                                        <option value="1.0">★ 1.0 {t('receitas.classificacao_superior')}</option>
                                    </select>
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg icon-mr-8" />
                                    <span className="rating-display-text">
                                        {ratingFilter === 'all' 
                                            ? t('receitas.classificacao_todas') 
                                            : `★ ${ratingFilter} ${t('receitas.classificacao_superior')}`
                                        }
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="chevron-down-icon icon-ml-8">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>

                                <button
                                    className={`btn-filter-fridge ${isFridgeFilterActive ? 'active' : ''}`}
                                    onClick={handleFridgeFilterToggle}
                                >
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg icon-mr-8" />
                                    {t('receitas.filtro_frigorifico')}
                                    <img src={iconeFrig} alt="Frigorifico" className="recipe-icon-svg icon-ml-8" />
                                </button>

                                <button className="btn-add-recipe" onClick={handleAddRecipeClick}>+</button>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {(() => {
                                const reversedFiltered = [...filteredReceitas].reverse();
                                const indexOfLastRecipe = currentPage * recipesPerPage;
                                const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
                                const currentRecipes = reversedFiltered.slice(indexOfFirstRecipe, indexOfLastRecipe);

                                return currentRecipes.map((receita, index) => (
                                     <DisplayCard
                                         key={receita.id || index}
                                         title={receita.nome}
                                         imageUrl={receita.foto_url ? `${URL_BASE}${receita.foto_url}` : null}
                                         fallbackText="🍲"
                                         rating={receita.classificacao}
                                         onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                     />
                                 ));
                            })()}
                            {filteredReceitas.length === 0 && (
                                <div className="text-empty-state-center">
                                    <p>{t('receitas.nenhuma_receita')}</p>
                                </div>
                            )}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredReceitas.length}
                            itemsPerPage={recipesPerPage}
                            onPageChange={setCurrentPage}
                        />

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

export default ExplorarReceitas;
