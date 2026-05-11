import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (!recipeId) {
            navigate('/receitas');
            return;
        }

        // Carrega ingredientes para conseguirmos mapear os IDs para nomes
        axios.get('http://localhost:8000/idjango/api/ingredientes/')
            .then(res => setDbIngredientes(res.data))
            .catch(err => console.error(err));

        // Carrega a Receita
        axios.get(`http://localhost:8000/idjango/api/receitas/${recipeId}`)
            .then(res => {
                setReceita(res.data);
                if (userId && res.data.guardadores.includes(parseInt(userId))) {
                    setGuardado(true);
                }
            })
            .catch(err => console.error(err));

        // Carrega Comentários
        axios.get('http://localhost:8000/idjango/api/comentarios/')
            .then(res => {
                const recipeComments = res.data.filter(c => c.receita === parseInt(recipeId));
                setComentarios(recipeComments);
            })
            .catch(err => console.error(err));
            
    }, [recipeId, userId, navigate]);

    // Lógica para Guardar/Remover Receita
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
        
        axios.put(`http://localhost:8000/idjango/api/receitas/${recipeId}`, updatedReceita)
            .then(res => {
                setReceita(res.data);
                setGuardado(!isAlreadySaved);
                alert(isAlreadySaved ? "Receita removida dos guardados!" : "Receita guardada com sucesso!");
            })
            .catch(err => console.error(err));
    };

    // Lógica para Classificar
    const handleClassificar = () => {
        if (!userId) {
            showLoginPopup('avaliar esta receita');
            return;
        }
        
        // Vamos fazer uma média simples com a classificação que já lá estava
        let novaMedia = receita.classificacao;
        if (receita.classificacao === 0) {
            novaMedia = novaClassificacao;
        } else {
            novaMedia = (receita.classificacao + novaClassificacao) / 2;
        }

        const updatedReceita = { ...receita, classificacao: parseFloat(novaMedia.toFixed(1)) };
        
        axios.put(`http://localhost:8000/idjango/api/receitas/${recipeId}`, updatedReceita)
            .then(res => {
                setReceita(res.data);
                alert("Obrigado pela tua classificação!");
            })
            .catch(err => console.error(err));
    };

    // Lógica para Comentar
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

        axios.post('http://localhost:8000/idjango/api/comentarios/', payload)
            .then(res => {
                setComentarios([...comentarios, res.data]);
                setNovoComentario('');
            })
            .catch(err => console.error(err));
    };

    if (!receita) return <div style={{padding: '50px', textAlign: 'center'}}>A carregar receita...</div>;

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">

                    <div style={{ textAlign: 'left', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 className="page-title-underline">{receita.nome}</h1>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#628169' }}>
                            ⭐ {receita.classificacao.toFixed(1)} / 5
                        </div>
                    </div>

                    <div className="recipe-view-container">

                        {/* PARTE SUPERIOR */}
                        <div className="recipe-top-row">
                            <div className="recipe-main-image" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <span style={{ fontSize: '80px', color: '#D1CDBC', fontWeight: '100' }}>🍲</span>
                            </div>

                            <div className="recipe-steps-nav">
                                {receita.instrucao.map((passo, index) => (
                                    <div 
                                        key={index} 
                                        className="step-nav-item"
                                        style={{ cursor: 'pointer' }}
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

                                <div className="view-actions-group" style={{ marginTop: 'auto' }}>
                                    <button className="btn-cancel" onClick={() => navigate('/receitas')}>Voltar</button>
                                    <button 
                                        className="btn-create-submit" 
                                        onClick={handleGuardar}
                                        style={guardado ? { backgroundColor: '#8a9b8e' } : {}}
                                    >
                                        {guardado ? 'Guardado ✓' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PARTE INFERIOR */}
                        <div className="recipe-bottom-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

                            {/* Coluna de Descrição dos Passos */}
                            <div className="recipe-descriptions-column" style={{ flex: '2', minWidth: '300px' }}>
                                {receita.instrucao.map((passo, index) => {
                                    // Separa o título (Passo X:) do resto do texto
                                    const hasPrefix = passo.match(/^(Passo \d+:\s*)(.*)/);
                                    const subtitle = hasPrefix ? `Passo ${index + 1}` : `Passo ${index + 1}`;
                                    const description = hasPrefix ? hasPrefix[2] : passo;

                                    return (
                                        <div key={index} id={`passo-${index}`} className="step-detail" style={{ marginBottom: '15px' }}>
                                            <label className="section-subtitle">{subtitle}</label>
                                            <div className="content-box-light" style={{ color: 'black' }}>
                                                {description}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Coluna de Ingredientes */}
                            <div className="recipe-ingredients-column" style={{ flex: '1', minWidth: '250px' }}>
                                <label className="section-subtitle">Ingredientes</label>
                                <div className="content-box-light" style={{ minHeight: '150px', color: 'black' }}>
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {receita.ingredientes.map((ingId, idx) => {
                                            const ingObj = dbIngredientes.find(i => i.id === ingId);
                                            return <li key={idx}>{ingObj ? ingObj.nome : `Ingrediente #${ingId}`}</li>;
                                        })}
                                        {receita.ingredientes.length === 0 && <li>Sem ingredientes listados.</li>}
                                    </ul>
                                </div>

                                {/* Secção de Classificação */}
                                <div className="rating-section">
                                    <label className="section-subtitle" style={{ margin: 0, color: '#444' }}>Avaliar Receita</label>
                                    <div className="rating-stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span 
                                                key={star}
                                                className="star-icon"
                                                style={{ color: star <= novaClassificacao ? '#f1c40f' : '#ccc' }}
                                                onClick={() => setNovaClassificacao(star)}
                                            >
                                                ★
                                            </span>
                                        ))}
                                        <button 
                                            className="btn-create-submit btn-rate" 
                                            onClick={handleClassificar} 
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