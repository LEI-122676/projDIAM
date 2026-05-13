import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/PopupModal.jsx';

const VerReceita = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const recipeId = location.state?.id;

    const [receita, setReceita] = useState(null);
    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    
    // Auth
    const userId = localStorage.getItem('userId');

    // UI state
    const [novoComentario, setNovoComentario] = useState('');
    const [novaClassificacao, setNovaClassificacao] = useState(5);
    const [guardado, setGuardado] = useState(false);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => {}, onCancel: () => {} });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const INGREDIENTES_URL = 'http://localhost:8000/idjango/api/ingredientes/';
    const RECEITA_URL = 'http://localhost:8000/idjango/api/receitas/'
    const COMENTARIOS_URL = 'http://localhost:8000/idjango/api/comentarios/'

    const showLoginPopup = (actionMessage) => {
        setPopupConfig({
            isOpen: true,
            title: 'Acesso Restrito',
            message: `Precisas de iniciar sessão para ${actionMessage}. Cria uma conta ou faz login!`,
            singleButton: false,
            confirmText: 'Iniciar Sessão',
            onConfirm: () => navigate('/login'),
            onCancel: closePopup
        });
    };

    const getIngredientes = () => {
        axios.get(INGREDIENTES_URL)
            .then(res => setDbIngredientes(res.data))
            .catch(err => console.error(err));
    };

    const getReceita = () => {
        axios.get(RECEITA_URL + recipeId)
            .then(res => {
                setReceita(res.data);
                if (userId && res.data.guardadores.includes(parseInt(userId))) {
                    setGuardado(true);
                }
            })
            .catch(err => console.error(err));
    };

    const getComentarios = () => {
        axios.get(COMENTARIOS_URL)
            .then(res => {
                const recipeComments = res.data.filter(c => c.receita === parseInt(recipeId));
                setComentarios(recipeComments);
            })
            .catch(err => console.error(err));
    };

    useEffect(() => {
        if (!recipeId) {
            navigate('/receitas');
            return;
        }

        getIngredientes();
        getReceita();
        getComentarios();
            
    }, [recipeId, userId, navigate]);

    // Guardar/Remover Receita
    const handleGuardar = () => {
        if (!userId) {
            showLoginPopup('guardar esta receita');
            return;
        }
        
        const isAlreadySaved = receita.guardadores.includes(parseInt(userId));
        let newGuardadores = [...receita.guardadores];
        
        if (isAlreadySaved) {
            newGuardadores = newGuardadores.filter(id => id !== parseInt(userId));
        } else {
            newGuardadores.push(parseInt(userId));
        }
        
        const updatedReceita = { ...receita, guardadores: newGuardadores };
        
        axios.put(RECEITA_URL + recipeId, updatedReceita)
            .then(res => {
                setReceita(res.data);
                setGuardado(!isAlreadySaved);
                alert(isAlreadySaved ? "Receita removida dos guardados!" : "Receita guardada com sucesso!");
            })
            .catch(err => console.error(err));
    };

    // Avaliações
    const handleAvaliar = () => {
        if (!userId) {
            showLoginPopup('avaliar esta receita');
            return;
        }

        let novaMedia;
        if (receita.classificacao === 0) {
            novaMedia = novaClassificacao;
        } else {
            novaMedia = (receita.classificacao + novaClassificacao) / 2;
        }

        const updatedReceita = { ...receita, classificacao: parseFloat(novaMedia.toFixed(1)) };
        
        axios.put(RECEITA_URL + recipeId, updatedReceita)
            .then(res => {
                setReceita(res.data);
                alert("Obrigado pela sua avaliação!");
            })
            .catch(err => console.error(err));
    };

    // Comentar
    const handleAddComentario = () => {
        if (!userId) {
            showLoginPopup('comentar nesta receita');
            return;
        }
        if (!novoComentario.trim()) return;

        const payload = {
            utilizador: parseInt(userId),
            receita: parseInt(recipeId),
            texto: novoComentario
        };

        axios.post(COMENTARIOS_URL, payload)
            .then(res => {
                setComentarios([...comentarios, res.data]);
                setNovoComentario('');
            })
            .catch(err => console.error(err));
    };

    if (!receita) return <div className="loading-container">A carregar receita...</div>;

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">

                    <div className="recipe-header-container">
                        <h1 className="page-title-underline">{receita.nome}</h1>
                        <div className="recipe-rating-text">
                            ⭐ {receita.classificacao.toFixed(1)} / 5
                        </div>
                    </div>

                    <div className="recipe-view-container">

                        {/* PARTE SUPERIOR */}
                        <div className="recipe-top-row">
                            <div className="recipe-main-image flex-center">
                                <span className="recipe-main-icon">🍲</span>
                            </div>

                            <div className="recipe-steps-nav">
                                {receita.instrucao.map((passo, index) => (
                                    <div 
                                        key={index} 
                                        className="step-nav-item cursor-pointer"
                                        onClick={() => {
                                            const el = document.getElementById(`passo-${index}`);
                                            if (el) {
                                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }
                                        }}
                                        title={`Ir para o Passo ${index + 1}`}
                                    >
                                        {index + 1}. Passo {index + 1}
                                    </div>
                                ))}

                                <div className="view-actions-group mt-auto">
                                    <button className="btn-cancel" onClick={() => navigate('/receitas')}>Voltar</button>
                                    <button 
                                        className="btn-create-submit" 
                                        onClick={handleGuardar}
                                        style={guardado ? { backgroundColor: '#8a9b8e' } : {}}
                                    >
                                        {guardado ? 'Guardado' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PARTE INFERIOR */}
                        <div className="recipe-bottom-row recipe-bottom-row-flex">

                            {/* Coluna de Descrição dos Passos */}
                            <div className="recipe-descriptions-column recipe-col-2">
                                {receita.instrucao.map((passo, index) => {
                                    // Separa o título (Passo X:) do resto do texto
                                    const hasPrefix = passo.match(/^(Passo \d+:\s*)(.*)/);
                                    const subtitle = hasPrefix ? `Passo ${index + 1}` : `Passo ${index + 1}`;
                                    const description = hasPrefix ? hasPrefix[2] : passo;

                                    return (
                                        <div key={index} id={`passo-${index}`} className="step-detail mb-15">
                                            <label className="section-subtitle">{subtitle}</label>
                                            <div className="content-box-light text-black">
                                                {description}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Coluna de Ingredientes */}
                            <div className="recipe-ingredients-column recipe-col-1">
                                <label className="section-subtitle">Ingredientes</label>
                                <div className="content-box-light ingredients-box">
                                    <ul className="ingredients-list-ul">
                                        {receita.ingredientes.map((ingId, idx) => {
                                            const ingObj = dbIngredientes.find(i => i.id === ingId);
                                            return <li key={idx}>{ingObj ? ingObj.nome : `Ingrediente #${ingId}`}</li>;
                                        })}
                                        {receita.ingredientes.length === 0 && <li>Sem ingredientes listados.</li>}
                                    </ul>
                                </div>

                                {/* Secção de Classificação */}
                                <div className="rating-section">
                                    <label className="section-subtitle rating-title">Avaliar Receita</label>
                                    <div className="rating-stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span 
                                                key={star}
                                                className={`star-icon ${star <= novaClassificacao ? 'star-active' : 'star-inactive'}`}
                                                onClick={() => setNovaClassificacao(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <button 
                                            className="btn-create-submit btn-rate" 
                                            onClick={handleAvaliar} 
                                        >
                                            Avaliar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* SECÇÃO DE COMENTÁRIOS */}
                        <div className="comments-section">
                            <h3 className="comments-title">
                                Comentários ({comentarios.length})
                            </h3>
                            
                            <div className="comment-input-area">
                                <textarea 
                                    className="comment-textarea"
                                    placeholder="O que achaste desta receita? Partilha a tua experiência..."
                                    value={novoComentario}
                                    onChange={(e) => setNovoComentario(e.target.value)}
                                />
                                <button 
                                    className="btn-create-submit btn-publish-comment" 
                                    onClick={handleAddComentario} 
                                >
                                    Publicar Comentário
                                </button>
                            </div>

                            <div className="comments-list">
                                {comentarios.length === 0 ? (
                                    <p className="comment-empty">
                                        Ainda não há comentários. Sê o primeiro a partilhar a tua opinião!
                                    </p>
                                ) : (
                                    comentarios.map(comentario => (
                                        <div key={comentario.id} className="comment-card">
                                            <div className="comment-header">
                                                <strong className="comment-author">
                                                    <span className="comment-avatar">👤</span>
                                                    Utilizador #{comentario.utilizador}
                                                </strong>
                                                <span className="comment-date">{new Date(comentario.data).toLocaleDateString()}</span>
                                            </div>
                                            <p className="comment-text">{comentario.texto}</p>
                                        </div>
                                    ))
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

export default VerReceita;