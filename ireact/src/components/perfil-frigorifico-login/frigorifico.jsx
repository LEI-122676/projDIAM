import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/PopupModal.jsx';

const Frigorifico = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem('utilizadorId');

    const [fridgeId, setFridgeId] = useState(null);
    const [ingredientesFrigorificoIds, setIngredientesFrigorificoIds] = useState([]);

    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [ingredienteSelecionado, setIngredienteSelecionado] = useState('');

    const [popupConfig, setPopupConfig] = useState({ 
        isOpen: false, 
        title: '', 
        message: '', 
        singleButton: true, 
        confirmText: 'OK',
        onConfirm: () => setPopupConfig(prev => ({ ...prev, isOpen: false })),
        onCancel: () => setPopupConfig(prev => ({ ...prev, isOpen: false }))
    });

    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const INGREDIENTES_URL = 'http://localhost:8000/idjango/api/ingredientes/';
    const UTILIZADORES_URL = 'http://localhost:8000/idjango/api/utilizadores/';
    const FRIGORIFICOS_URL = 'http://localhost:8000/idjango/api/frigorificos/';

    const getIngredientes = () => {
        axios.get(INGREDIENTES_URL)
            .then(res => setDbIngredientes(res.data))
            .catch(err => console.error("Erro ao carregar ingredientes da base de dados", err));
    };

    const getFrigorifico = () => {
        axios.get(`${UTILIZADORES_URL}${userId}/frigorifico`)
            .then(res => {
                setFridgeId(res.data.id);
                // Garantir que guardamos apenas uma lista de números (IDs)
                const ingredientes = (res.data.ingredientes || []).map(item => {
                    if (typeof item === 'object' && item !== null) return Number(item.id);
                    return Number(item);
                });
                setIngredientesFrigorificoIds(ingredientes);
            })
            .catch(err => {
                console.error("Erro ao carregar frigorífico do utilizador", err);
            });
    };

    useEffect(() => {
        if (!userId) {
            const timeoutId = setTimeout(() => {
                setPopupConfig({
                    isOpen: true,
                    title: 'Acesso Restrito',
                    message: 'Precisas de iniciar sessão para aceder ao teu frigorífico.',
                    singleButton: false,
                    confirmText: 'Iniciar Sessão',
                    onConfirm: () => navigate('/login'),
                    onCancel: () => navigate('/')
                });
            }, 0);

            return () => clearTimeout(timeoutId);
        }

        getIngredientes();
        getFrigorifico();
    }, [userId, navigate]);

    // Função para atualizar na BD
    const atualizarFrigorifico = (novaListaIds) => {
        if (!fridgeId) {
            setPopupConfig({
                isOpen: true,
                title: 'Erro de Configuração',
                message: 'Ainda não tens um frigorífico configurado no servidor.',
                singleButton: true,
                onConfirm: closePopup
            });
            return;
        }

        axios.put(`${FRIGORIFICOS_URL}${fridgeId}`, {
            ingredientes: novaListaIds
        })
            .then(() => {
                setIngredientesFrigorificoIds(novaListaIds);
            })
            .catch(err => {
                console.error("Erro ao atualizar frigorífico:", err);
                setPopupConfig({
                    isOpen: true,
                    title: 'Erro de Sincronização',
                    message: 'Falha ao sincronizar o teu frigorífico. Tenta novamente.',
                    singleButton: true,
                    onConfirm: closePopup
                });
            });
    };

    const adicionarIngrediente = (e) => {
        e.preventDefault();
        if (!ingredienteSelecionado) return;

        const id = parseInt(ingredienteSelecionado);
        if (ingredientesFrigorificoIds.includes(id)) {
            setPopupConfig({
                isOpen: true,
                title: 'Ingrediente Repetido',
                message: 'Este ingrediente já está no teu frigorífico!',
                singleButton: true,
                onConfirm: closePopup
            });
            return;
        }

        const novaLista = [...ingredientesFrigorificoIds, id];
        atualizarFrigorifico(novaLista);
        setIngredienteSelecionado(''); // Reset
    };

    const removerIngrediente = (idParaRemover) => {
        // Garantir que a comparação é feita com números e suporta objetos
        const targetId = typeof idParaRemover === 'object' && idParaRemover !== null ? Number(idParaRemover.id) : Number(idParaRemover);
        
        const novaLista = ingredientesFrigorificoIds.filter(item => {
            const currentId = typeof item === 'object' && item !== null ? Number(item.id) : Number(item);
            return currentId !== targetId;
        });
        
        atualizarFrigorifico(novaLista);
    };

    const irParaReceitas = () => {
        // Envia estado autoFridge para a página de Explorar Receitas forçar a abertura
        navigate('/receitas', { state: { autoFridge: true } });
    };

    // Ingredientes que AINDA NÃO estão no frigorífico
    const ingredientesDisponiveis = dbIngredientes.filter(ing => {
        const fridgeIds = (ingredientesFrigorificoIds || []).map(item => {
            if (typeof item === 'object' && item !== null) return Number(item.id);
            return Number(item);
        });
        return !fridgeIds.includes(Number(ing.id));
    });

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-frigorifico">
                    <div className="fridge-container">

                        <div className="fridge-header fridge-header-flex">
                            <h1 className="page-title-underline m-0">O Meu Frigorífico</h1>
                            <button className="btn-create-submit btn-rounded-20" onClick={irParaReceitas}>
                                Mostrar Receitas
                            </button>
                        </div>

                        <section className="fridge-input-card fridge-input-card-custom">
                            <form onSubmit={adicionarIngrediente} className="fridge-form fridge-form-flex">
                                <div className="form-group flex-1">
                                    <label className="fridge-label">Adicionar Ingrediente:</label>
                                    <select
                                        className="input-beige select-fridge text-black"
                                        value={ingredienteSelecionado}
                                        onChange={(e) => setIngredienteSelecionado(e.target.value)}
                                    >
                                        <option value="">-- Selecione um ingrediente --</option>
                                        {ingredientesDisponiveis.map(ing => (
                                            <option key={ing.id} value={ing.id}>{ing.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn-add-recipe btn-add-fridge">
                                    Adicionar
                                </button>
                            </form>
                        </section>

                        <h3 className="fridge-content-title">
                            Conteúdo Atual ({ingredientesFrigorificoIds.length})
                        </h3>

                        <section className="ingredients-grid ingredients-grid-flex">
                            {ingredientesFrigorificoIds.length === 0 ? (
                                <p className="fridge-empty-text">O teu frigorífico está vazio! Adiciona os teus ingredientes acima.</p>
                            ) : (
                                ingredientesFrigorificoIds.map((id) => {
                                    const obj = dbIngredientes.find(i => i.id === id);
                                    const nome = obj ? obj.nome : `Ingrediente #${id}`;

                                    return (
                                        <div key={id} className="ingredient-tag ingredient-tag-custom">
                                            <button
                                                className="remove-btn remove-btn-custom"
                                                onClick={() => removerIngrediente(id)}
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
                confirmText={popupConfig.confirmText}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
        </div>
    );
};

export default Frigorifico;