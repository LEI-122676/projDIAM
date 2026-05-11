import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/PopupModal.jsx';

const Frigorifico = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');
    
    const [fridgeId, setFridgeId] = useState(null);
    const [ingredientesFrigorificoIds, setIngredientesFrigorificoIds] = useState([]);
    
    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [ingredienteSelecionado, setIngredienteSelecionado] = useState('');
    
    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (!userId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para aceder ao teu frigorífico.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }

        // 1. Carregar todos os ingredientes disponíveis no sistema
        axios.get('http://localhost:8000/idjango/api/ingredientes/')
            .then(res => setDbIngredientes(res.data))
            .catch(err => console.error("Erro ao carregar ingredientes da base de dados", err));

        // 2. Carregar o frigorífico atual do utilizador
        axios.get(`http://localhost:8000/idjango/api/utilizadores/${userId}/frigorifico`)
            .then(res => {
                setFridgeId(res.data.id);
                setIngredientesFrigorificoIds(res.data.ingredientes || []);
            })
            .catch(err => {
                console.error("Erro ao carregar frigorífico do utilizador", err);
            });
    }, [userId, navigate]);

    // Função para atualizar na BD
    const atualizarFrigorifico = (novaListaIds) => {
        if (!fridgeId) {
            alert("Ainda não tens um frigorífico configurado no servidor.");
            return;
        }
        
        axios.put(`http://localhost:8000/idjango/api/frigorificos/${fridgeId}`, {
            ingredientes: novaListaIds
        })
        .then(res => {
            setIngredientesFrigorificoIds(novaListaIds);
        })
        .catch(err => {
            console.error("Erro ao atualizar frigorífico:", err);
            alert("Falha ao sincronizar o teu frigorífico. Tenta novamente.");
        });
    };

    const adicionarIngrediente = (e) => {
        e.preventDefault();
        if (!ingredienteSelecionado) return;

        const id = parseInt(ingredienteSelecionado);
        if (ingredientesFrigorificoIds.includes(id)) {
            alert("Este ingrediente já está no teu frigorífico!");
            return;
        }

        const novaLista = [...ingredientesFrigorificoIds, id];
        atualizarFrigorifico(novaLista);
        setIngredienteSelecionado(''); // Reset
    };

    const removerIngrediente = (idParaRemover) => {
        const novaLista = ingredientesFrigorificoIds.filter(id => id !== idParaRemover);
        atualizarFrigorifico(novaLista);
    };

    const irParaReceitas = () => {
        // Envia estado autoFridge para a página de Explorar Receitas forçar a abertura
        navigate('/receitas', { state: { autoFridge: true } });
    };

    // Ingredientes que AINDA NÃO estão no frigorífico
    const ingredientesDisponiveis = dbIngredientes.filter(ing => !ingredientesFrigorificoIds.includes(ing.id));

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-frigorifico">
                    <div className="fridge-container">
                        
                        <div className="fridge-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h1 className="page-title-underline" style={{ margin: 0 }}>O Meu Frigorífico</h1>
                            <button className="btn-create-submit" onClick={irParaReceitas} style={{ borderRadius: '20px' }}>
                                Mostrar Receitas
                            </button>
                        </div>

                        <section className="fridge-input-card" style={{ backgroundColor: '#F8F6F0', padding: '25px', borderRadius: '15px', border: '1px solid #D1CDBC', marginBottom: '40px' }}>
                            <form onSubmit={adicionarIngrediente} className="fridge-form" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ color: '#4A3A31', marginBottom: '10px', display: 'block', fontWeight: 'bold' }}>Adicionar Ingrediente:</label>
                                    <select 
                                        className="input-beige" 
                                        value={ingredienteSelecionado} 
                                        onChange={(e) => setIngredienteSelecionado(e.target.value)}
                                        style={{ height: '50px', cursor: 'pointer' }}
                                    >
                                        <option value="">-- Selecione um ingrediente --</option>
                                        {ingredientesDisponiveis.map(ing => (
                                            <option key={ing.id} value={ing.id}>{ing.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn-add-recipe" style={{ width: 'auto', padding: '0 30px', height: '50px', fontSize: '16px' }}>
                                    Adicionar
                                </button>
                            </form>
                        </section>

                        <h3 style={{ color: '#628169', marginBottom: '20px', borderBottom: '2px solid #D1CDBC', paddingBottom: '10px' }}>
                            Conteúdo Atual ({ingredientesFrigorificoIds.length})
                        </h3>

                        <section className="ingredients-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                            {ingredientesFrigorificoIds.length === 0 ? (
                                <p style={{ fontStyle: 'italic', color: '#888' }}>O teu frigorífico está vazio! Adiciona os teus ingredientes acima.</p>
                            ) : (
                                ingredientesFrigorificoIds.map((id) => {
                                    const obj = dbIngredientes.find(i => i.id === id);
                                    const nome = obj ? obj.nome : `Ingrediente #${id}`;
                                    
                                    return (
                                        <div key={id} className="ingredient-tag" style={{ 
                                            display: 'flex', alignItems: 'center', backgroundColor: '#e2ddcc', 
                                            padding: '10px 20px', borderRadius: '25px', color: '#4A3A31', fontWeight: '600' 
                                        }}>
                                            <button 
                                                className="remove-btn" 
                                                onClick={() => removerIngrediente(id)}
                                                style={{ 
                                                    background: 'transparent', border: 'none', color: '#8b4b4b', 
                                                    cursor: 'pointer', fontWeight: 'bold', fontSize: '18px', marginRight: '10px',
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                            >
                                                ✕
                                            </button>
                                            <span>{nome}</span>
                                        </div>
                                    );
                                })
                            )}
                        </section>

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

export default Frigorifico;