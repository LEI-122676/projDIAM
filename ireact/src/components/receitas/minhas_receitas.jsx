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

const AsMinhasReceitas = () => {
    const navigate = useNavigate();

    const RECEITAS_URL = 'http://localhost:8000/idjango/api' + '/receitas/';
    const UTILIZADORES_URL = 'http://localhost:8000/idjango/api' + '/utilizadores/';

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
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para ver as tuas receitas.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
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
                        title: 'Frigorífico Vazio',
                        message: 'Ainda não tens nenhum ingrediente no teu frigorífico! Queres ir adicioná-los agora?',
                        singleButton: false,
                        confirmText: 'Ir para o Frigorífico',
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
                    title: 'Sem Frigorífico',
                    message: 'O teu frigorífico está vazio ou ainda não existe. Queres ir adicioná-los agora?',
                    singleButton: false,
                    confirmText: 'Ir para o Frigorífico',
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

                        <h1 className="page-title-underline">As Minhas Receitas</h1>

                        <div className="recipes-action-bar">
                            <div className="recipes-search-container">
                                <input
                                    type="text"
                                    placeholder="Pesquisar receitas..."
                                    className="main-search-input recipe-search-box text-black"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                            </div>

                            <div className="recipes-button-group">
                                <button
                                    className={`btn-filter-fridge ${isFridgeFilterActive ? 'active' : ''}`}
                                    onClick={handleFridgeFilterToggle}
                                >
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg icon-mr-8" />
                                    Frigorífico
                                    <img src={iconeFrig} alt="Frigorifico" className="recipe-icon-svg icon-ml-8" />
                                </button>

                                <button className="btn-add-recipe" onClick={() => navigate('/receitas/criar-receita')}>+</button>
                            </div>
                        </div>

                        <div className="mt-30">
                            <h2 className="my-recipes-section-title">Criadas por Mim</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedCriadas = [...criadasPorMim].reverse();
                                    const indexOfLast = currentPageCriadas * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentCriadas = reversedCriadas.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentCriadas.map((receita) => (
                                        <div
                                            key={`criada-${receita.id}`}
                                            className="recipe-card-premium cursor-pointer relative-container"
                                            onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                        >
                                            <div className="card-rating-badge">
                                                ⭐ {receita.classificacao || '0.0'}
                                            </div>
                                            <div className="recipe-image-placeholder">
                                                {receita.foto_url ? (
                                                    <img
                                                        src={`http://localhost:8000${receita.foto_url}`}
                                                        alt={receita.nome}
                                                        className="cover-image"
                                                    />
                                                ) : (
                                                    <span className="recipe-icon-large">🍲</span>
                                                )}
                                            </div>
                                            <div className="recipe-card-footer">
                                                <span className="ingredient-name">{receita.nome}</span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                {criadasPorMim.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não tens nenhuma receita criada.
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
                            <h2 className="my-recipes-section-title">Receitas Guardadas</h2>
                            <div className="recipes-grid mt-20">
                                {(() => {
                                    const reversedGuardadas = [...receitasGuardadas].reverse();
                                    const indexOfLast = currentPageGuardadas * itemsPerPage;
                                    const indexOfFirst = indexOfLast - itemsPerPage;
                                    const currentGuardadas = reversedGuardadas.slice(indexOfFirst, indexOfLast);
                                    
                                    return currentGuardadas.map((receita) => (
                                        <div
                                            key={`guardada-${receita.id}`}
                                            className="recipe-card-premium cursor-pointer relative-container"
                                            onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                        >
                                            <div className="card-rating-badge">
                                                ⭐ {receita.classificacao || '0.0'}
                                            </div>
                                            <div className="recipe-image-placeholder">
                                                {receita.foto_url ? (
                                                    <img
                                                        src={`http://localhost:8000${receita.foto_url}`}
                                                        alt={receita.nome}
                                                        className="cover-image"
                                                    />
                                                ) : (
                                                    <span className="recipe-icon-large">🍲</span>
                                                )}
                                            </div>
                                            <div className="recipe-card-footer">
                                                <span className="ingredient-name">{receita.nome}</span>
                                            </div>
                                        </div>
                                    ));
                                })()}
                                {receitasGuardadas.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não guardaste nenhuma receita.
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

export default AsMinhasReceitas;