import React, { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/PopupModal.jsx';

const ExplorarReceitas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const autoFilterAttempted = useRef(false);
    
    const [receitas, setReceitas] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFridgeFilterActive, setIsFridgeFilterActive] = useState(false);
    const [fridgeIngredients, setFridgeIngredients] = useState([]);
    
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        // Carrega todas as receitas
        axios.get('http://localhost:8000/idjango/api/receitas/')
            .then(res => setReceitas(res.data))
            .catch(err => console.error("Erro ao carregar receitas:", err));
    }, []);

    useEffect(() => {
        if (location.state?.autoFridge && !autoFilterAttempted.current) {
            autoFilterAttempted.current = true;
            handleFridgeFilterToggle(true); // Pass true to force it open
        }
    }, [location]);

    const handleFridgeFilterToggle = (forceOpen = false) => {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para utilizar o filtro do Frigorífico.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
            return;
        }

        if (isFridgeFilterActive && !forceOpen) {
            setIsFridgeFilterActive(false);
            setFridgeIngredients([]);
            return;
        }

        // Tenta ir buscar o frigorífico do utilizador
        axios.get(`http://localhost:8000/idjango/api/utilizadores/${userId}/frigorifico`)
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

    const handleAddRecipeClick = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para criar uma nova receita. Cria uma conta ou faz login para partilhares as tuas criações culinárias!',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: closePopup
            });
        } else {
            navigate('/receitas/criar-receita');
        }
    };

    const filteredReceitas = receitas.filter(receita => {
        // Filtro da barra de pesquisa
        const nomeReceita = receita.nome || "";
        const matchesSearch = nomeReceita.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filtro do frigorífico (mostrar apenas receitas onde temos os ingredientes)
        let matchesFridge = true;
        if (isFridgeFilterActive && fridgeIngredients.length > 0) {
            // Verifica se tem TODOS os ingredientes necessários para a receita
            if (!receita.ingredientes || receita.ingredientes.length === 0) {
                 matchesFridge = false; // Se a receita não tem ingredientes, ignorar
            } else {
                 matchesFridge = receita.ingredientes.every(ingId => fridgeIngredients.includes(ingId));
            }
        }

        return matchesSearch && matchesFridge;
    });

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <div className="profile-grid" style={{ margin: '0', maxWidth: '100%' }}>

                        <h1 className="page-title-underline">Descobrir Receitas</h1>

                        <div className="recipes-action-bar">
                            <div className="recipes-search-container">
                                <input
                                    type="text"
                                    placeholder="Pesquisar receitas..."
                                    className="main-search-input recipe-search-box"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ color: 'black' }}
                                />
                                <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                            </div>

                            <div className="recipes-button-group">
                                <button 
                                    className={`btn-filter-fridge ${isFridgeFilterActive ? 'active' : ''}`}
                                    onClick={handleFridgeFilterToggle}
                                    style={isFridgeFilterActive ? { backgroundColor: '#628169', color: 'white' } : {}}
                                >
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg" style={{marginRight: '8px', filter: isFridgeFilterActive ? 'brightness(0) invert(1)' : 'none'}} />
                                    Frigorífico
                                    <img src={iconeFrig} alt="Frigorifico" className="recipe-icon-svg" style={{marginLeft: '8px', filter: isFridgeFilterActive ? 'brightness(0) invert(1)' : 'none'}} />
                                </button>

                                <button className="btn-add-recipe" onClick={handleAddRecipeClick}>+</button>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {filteredReceitas.map((receita, index) => (
                                <div 
                                    key={receita.id || index} 
                                    className="recipe-card" 
                                    onClick={() => navigate('/receitas/ver-receita', { state: { id: receita.id } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="recipe-image-placeholder">
                                        <span style={{ fontSize: '40px', color: '#D1CDBC' }}>✕</span>
                                    </div>
                                    <div className="recipe-card-footer">
                                        <span className="ingredient-name">{receita.nome}</span>
                                    </div>
                                </div>
                            ))}
                            {filteredReceitas.length === 0 && (
                                <p style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '20px' }}>
                                    Nenhuma receita encontrada com estes critérios.
                                </p>
                            )}
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

export default ExplorarReceitas;