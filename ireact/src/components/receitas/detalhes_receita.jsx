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
    const [utilizadores, setUtilizadores] = useState([]);

    // Auth
    const userId = localStorage.getItem('utilizadorId');

    // UI state
    const [novoComentario, setNovoComentario] = useState('');
    const [novaClassificacao, setNovaClassificacao] = useState(5);
    const [guardado, setGuardado] = useState(false);
    const [isLoadError, setIsLoadError] = useState(false);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const INGREDIENTES_URL = import.meta.env.VITE_API_BASE_URL + '/ingredientes/';
    const RECEITA_URL = import.meta.env.VITE_API_BASE_URL + '/receitas/';
    const COMENTARIOS_URL = import.meta.env.VITE_API_BASE_URL + '/comentarios/';
    const UTILIZADORES_URL = import.meta.env.VITE_API_BASE_URL + '/utilizadores/';

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

    const showPopup = (title, message) => {
        setPopupConfig({
            isOpen: true,
            title,
            message,
            singleButton: true,
            confirmText: 'OK',
            onConfirm: closePopup,
            onCancel: closePopup
        });
    };

    const getIngredientes = () => {
        axios.get(INGREDIENTES_URL)
            .then(res => setDbIngredientes(res.data))
            .catch(err => console.error(err));
    };

    const getUtilizadores = () => {
        axios.get(UTILIZADORES_URL)
            .then(res => setUtilizadores(res.data || []))
            .catch(err => console.error(err));
    };

    const getUserName = (uid) => {
        const u = utilizadores.find(u => u.id === uid);
        return u ? u.username : `Utilizador #${uid}`;
    };

    const getReceita = () => {
        if (!recipeId) return;
        axios.get(RECEITA_URL + recipeId)
            .then(res => {
                setReceita(res.data);
                if (userId && res.data.guardadores && res.data.guardadores.includes(parseInt(userId))) {
                    setGuardado(true);
                }
            })
            .catch(err => {
                console.error('Erro ao carregar receita:', err);
                setIsLoadError(true);
            });
    };

    const getComentarios = () => {
        if (!recipeId) return;
        axios.get(COMENTARIOS_URL)
            .then(res => {
                const recipeComments = (res.data || []).filter(c => c.receita === parseInt(recipeId));
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
        getUtilizadores();
        getReceita();
        getComentarios();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recipeId]);

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
        // Usar PATCH para enviar apenas os campos necessários e evitar erros de validação com campos de leitura
        axios.patch(RECEITA_URL + recipeId, { guardadores: newGuardadores }, { withCredentials: true })
            .then(res => {
                setReceita(res.data);
                setGuardado(!isAlreadySaved);
                setPopupConfig({
                    isOpen: true,
                    title: isAlreadySaved ? 'Receita Removida' : 'Receita Guardada',
                    message: isAlreadySaved ? 'Receita removida dos teus guardados.' : 'Receita guardada com sucesso!',
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
            })
            .catch(err => {
                console.error(err);
                setPopupConfig({
                    isOpen: true,
                    title: 'Erro',
                    message: 'Ocorreu um erro ao guardar a receita. Tenta novamente.',
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
            });
    };

    const handleDelete = () => {
        setPopupConfig({
            isOpen: true,
            title: 'Confirmar Eliminação',
            message: 'Tens a certeza que pretendes apagar esta receita? Esta ação é irreversível.',
            singleButton: false,
            confirmText: 'Apagar',
            cancelText: 'Cancelar',
            onConfirm: () => {
                axios.delete(RECEITA_URL + recipeId)
                    .then(() => {
                        setPopupConfig({
                            isOpen: true,
                            title: 'Receita Apagada',
                            message: 'A tua receita foi removida com sucesso.',
                            singleButton: true,
                            confirmText: 'OK',
                            onConfirm: () => navigate('/receitas'),
                            onCancel: () => navigate('/receitas')
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        setPopupConfig({
                            isOpen: true,
                            title: 'Erro ao Apagar',
                            message: 'Não foi possível apagar a receita. Tenta novamente.',
                            singleButton: true,
                            confirmText: 'OK',
                            onConfirm: closePopup,
                            onCancel: closePopup
                        });
                    });
            },
            onCancel: closePopup
        });
    };

    // Avaliações
    const handleAvaliar = () => {
        if (!userId) {
            showLoginPopup('avaliar esta receita');
            return;
        }

        axios.post(import.meta.env.VITE_API_BASE_URL + '/avaliar/', {
            utilizador: parseInt(userId),
            receita: parseInt(recipeId),
            nota: novaClassificacao
        })
        .then(res => {
            setReceita(res.data);

            setPopupConfig({
                isOpen: true,
                title: 'Avaliação Registada!',
                message: 'Obrigado pela tua classificação.',
                singleButton: true,
                confirmText: 'OK',
                onConfirm: closePopup,
                onCancel: closePopup
            });
        })
        .catch(err => {
            console.error("Erro ao avaliar:", err);
        });
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
            .catch(err => {
                console.error(err);
                let message = 'Por favor, tenha atenção à sua linguagem. Não são permitidos palavrões, links ou anúncios no comentário.';
                if (err.response && err.response.data) {
                    const data = err.response.data;
                    if (typeof data === 'object') {
                        const firstFieldErrors = Object.values(data)[0];
                        if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                            message = firstFieldErrors[0];
                        } else if (typeof data.msg === 'string') {
                            message = data.msg;
                        } else {
                            message = JSON.stringify(data);
                        }
                    } else if (typeof data === 'string') {
                        message = data;
                    }
                }
                showPopup('Atenção à Linguagem', message);
            });
    };


    if (isLoadError) return (
        <div className="loading-container">
            <p style={{ color: '#8b4b4b', marginBottom: '20px' }}>❌ Não foi possível carregar a receita.</p>
            <button className="btn-cancel" onClick={() => navigate('/receitas')}>Voltar às Receitas</button>
        </div>
    );

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
                            ⭐ {(receita.classificacao !== undefined && receita.classificacao !== null && Number(receita.classificacao) > 0) ? Number(receita.classificacao).toFixed(1) : "0.0"} / 5
                        </div>
                    </div>

                    <div className="recipe-view-container">

                        {/* PARTE SUPERIOR */}
                        <div className="recipe-top-row">
                            <div className="recipe-main-image flex-center">
                                {receita.foto_url ? (
                                    <img
                                        src={`${import.meta.env.VITE_MEDIA_BASE_URL}${receita.foto_url}`}
                                        alt={receita.nome}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
                                    />
                                ) : (
                                    <span className="recipe-main-icon">🍲</span>
                                )}
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
                                    <button className="btn-cancel" onClick={() => navigate(-1)}>Voltar</button>

                                    {Number(receita.criador) === Number(userId) ? (
                                        <button
                                            className="btn-cancel"
                                            onClick={handleDelete}
                                            style={{ backgroundColor: '#8b4b4b', color: 'white' }}
                                        >
                                            Remover Receita
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-create-submit"
                                            onClick={handleGuardar}
                                            style={guardado ? { backgroundColor: '#8a9b8e' } : {}}
                                        >
                                            {guardado ? 'Guardado' : 'Guardar'}
                                        </button>
                                    )}
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
                                                    {getUserName(comentario.utilizador)}
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