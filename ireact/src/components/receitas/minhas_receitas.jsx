import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';

const AsMinhasReceitas = () => {
    const navigate = useNavigate();

    const RECEITAS_URL = 'http://localhost:8000/idjango/api/receitas/';
    const UTILIZADORES_URL = 'http://localhost:8000/idjango/api/utilizadores/';

    const [receitas, setReceitas] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFridgeFilterActive, setIsFridgeFilterActive] = useState(false);
    const [fridgeIngredients, setFridgeIngredients] = useState([]);
    
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        // Carrega todas as receitas
        axios.get(RECEITAS_URL)
            .then(res => setReceitas(res.data))
            .catch(err => console.error("Erro ao carregar receitas:", err));
    }, [userId, navigate]);

    const handleFridgeFilterToggle = () => {
        if (!userId) return;

        if (isFridgeFilterActive) {
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

    // Filtrar primeiro pelas condições globais (texto e frigorífico)
    const filteredReceitas = receitas.filter(receita => {
        const nomeReceita = receita.nome || "";
        const matchesSearch = nomeReceita.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFridge = true;
        if (isFridgeFilterActive && fridgeIngredients.length > 0) {
            if (!receita.ingredientes || receita.ingredientes.length === 0) {
                matchesFridge = false;
            } else {
                matchesFridge = receita.ingredientes.every(ingId => fridgeIngredients.includes(ingId));
            }
        }
        return matchesSearch && matchesFridge;
    });

    // Dividir em Criadas vs Guardadas
    const criadasPorMim = filteredReceitas.filter(r => r.criador === parseInt(userId));
    const receitasGuardadas = filteredReceitas.filter(r => r.guardadores.includes(parseInt(userId)) && r.criador !== parseInt(userId));

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

                        {/* SECÇÃO: CRIADAS POR MIM */}
                        <div className="mt-30">
                            <h2 className="my-recipes-section-title">Criadas por Mim</h2>
                            <div className="recipes-grid mt-20">
                                {criadasPorMim.map((receita) => (
                                    <div
                                        key={`criada-${receita.id}`}
                                        className="recipe-card recipe-card-created"
                                        onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                    >
                                        <div className="recipe-image-placeholder">
                                            <span className="recipe-icon-large">✕</span>
                                        </div>
                                        <div className="recipe-card-footer">
                                            <span className="ingredient-name">{receita.nome}</span>
                                        </div>
                                    </div>
                                ))}
                                {criadasPorMim.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não tens nenhuma receita criada.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* SECÇÃO: RECEITAS GUARDADAS */}
                        <div className="mt-50">
                            <h2 className="my-recipes-section-title">Receitas Guardadas</h2>
                            <div className="recipes-grid mt-20">
                                {receitasGuardadas.map((receita) => (
                                    <div
                                        key={`guardada-${receita.id}`}
                                        className="recipe-card recipe-card-saved"
                                        onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                    >
                                        <div className="recipe-image-placeholder">
                                            <span className="recipe-icon-large">✕</span>
                                        </div>
                                        <div className="recipe-card-footer">
                                            <span className="ingredient-name">{receita.nome}</span>
                                        </div>
                                    </div>
                                ))}
                                {receitasGuardadas.length === 0 && (
                                    <p className="text-empty-state">
                                        Ainda não guardaste nenhuma receita.
                                    </p>
                                )}
                            </div>
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