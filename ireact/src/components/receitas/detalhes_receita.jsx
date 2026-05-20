import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/PopupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';

const VerReceita = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const recipeId = location.state?.id;

    const [receita, setReceita] = useState(null);
    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [comentarios, setComentarios] = useState([]);

    const userId = localStorage.getItem('utilizadorId');
    const [isAdmin, setIsAdmin] = useState(false);

    const [novoComentario, setNovoComentario] = useState('');
    const [novaClassificacao, setNovaClassificacao] = useState(5);
    const [guardado, setGuardado] = useState(false);
    const [isLoadError, setIsLoadError] = useState(false);
    
    const [currentCommentPage, setCurrentCommentPage] = useState(1);
    const commentsPerPage = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '8', 10);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const INGREDIENTES_URL = 'http://localhost:8000/idjango/api' + '/ingredientes/';
    const RECEITA_URL = 'http://localhost:8000/idjango/api' + '/receitas/';
    const COMENTARIOS_URL = 'http://localhost:8000/idjango/api' + '/comentarios/';
    const UTILIZADORES_URL = 'http://localhost:8000/idjango/api' + '/utilizadores/';

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
        getReceita();
        getComentarios();

        if (userId) {
            axios.get(`${UTILIZADORES_URL}${userId}`, { withCredentials: true })
                .then(res => {
                    if (res.data.role === 'Admin') {
                        setIsAdmin(true);
                    }
                })
                .catch(err => console.error("Erro ao obter a role do utilizador:", err));
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, recipeId, userId]);

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

    const handleAvaliar = () => {
        if (!userId) {
            showLoginPopup('avaliar esta receita');
            return;
        }

        axios.post('http://localhost:8000/idjango/api' + '/avaliar/', {
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
            <p className="error-message">❌ Não foi possível carregar a receita.</p>
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

                        <div className="recipe-top-row">
                            <div className="recipe-main-image flex-center">
                                {receita.foto_url ? (
                                    <img
                                        src={`http://localhost:8000${receita.foto_url}`}
                                        alt={receita.nome}
                                        className="cover-image-rounded"
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

                                    {(Number(receita.criador) !== Number(userId) || isAdmin) && (
                                        <button
                                            className={`btn-create-submit ${guardado ? "btn-saved" : ""}`}
                                            onClick={handleGuardar}
                                        >
                                            {guardado ? 'Guardado' : 'Guardar'}
                                        </button>
                                    )}

                                    {(Number(receita.criador) === Number(userId) || isAdmin) && (
                                        <>
                                            <button
                                                className="btn-create-submit btn-action-edit"
                                                onClick={() => navigate('/receitas/criar-receita', { state: { editReceita: receita } })}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className="btn-create-submit btn-action-delete"
                                                onClick={handleDelete}
                                            >
                                                Remover
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="recipe-bottom-row recipe-bottom-row-flex">

                            <div className="recipe-descriptions-column recipe-col-2">
                                {receita.instrucao.map((passo, index) => {
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
                                    (() => {
                                        const indexOfLastComment = currentCommentPage * commentsPerPage;
                                        const indexOfFirstComment = indexOfLastComment - commentsPerPage;
                                        const currentComments = comentarios.slice(indexOfFirstComment, indexOfLastComment);

                                        return currentComments.map(comentario => (
                                            <div key={comentario.id} className="comment-card">
                                                <div className="comment-header">
                                                    <strong className="comment-author">
                                                        <span className="comment-avatar">👤</span>
                                                        {comentario.utilizador_nome}
                                                    </strong>
                                                    <span className="comment-date">{new Date(comentario.data).toLocaleDateString()}</span>
                                                </div>
                                                <p className="comment-text">{comentario.texto}</p>
                                            </div>
                                        ));
                                    })()
                                )}
                            </div>

                            <Pagination
                                currentPage={currentCommentPage}
                                totalItems={comentarios.length}
                                itemsPerPage={commentsPerPage}
                                onPageChange={setCurrentCommentPage}
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

export default VerReceita;