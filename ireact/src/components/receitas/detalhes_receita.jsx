import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../css/styles.css';
import PopupModal from '../maincomponents/popupModal.jsx';
import Pagination from '../maincomponents/pagination.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { getFieldLimits, validateInput } from '../../utils/validation.js';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import Footer from '../maincomponents/Footer.jsx';


const VerReceita = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const recipeId = location.state?.id;
    const { t } = useLanguage();

    const [receita, setReceita] = useState(null);
    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [comentarios, setComentarios] = useState([]);

    const userId = localStorage.getItem('utilizadorId');
    const [isAdmin, setIsAdmin] = useState(false);

    const [novoComentario, setNovoComentario] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [novaClassificacao, setNovaClassificacao] = useState(5);
    const [guardado, setGuardado] = useState(false);
    const [isLoadError, setIsLoadError] = useState(false);
    const [limits, setLimits] = useState({});

    useEffect(() => {
        getFieldLimits().then(data => setLimits(data));
    }, []);
    
    const [currentCommentPage, setCurrentCommentPage] = useState(1);
    const commentsPerPage = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '8', 10);

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const URL_BASE = 'http://localhost:8000';
    const INGREDIENTES_URL = `${URL_BASE}/idjango/api/ingredientes/`;
    const RECEITA_URL = `${URL_BASE}/idjango/api/receitas/`;
    const COMENTARIOS_URL = `${URL_BASE}/idjango/api/comentarios/`;
    const UTILIZADORES_URL = `${URL_BASE}/idjango/api/utilizadores/`;
    const AVALIAR_URL = `${URL_BASE}/idjango/api/avaliar/`;

    const showLoginPopup = (actionMessage) => {
        setPopupConfig({
            isOpen: true,
            title: t('receitas.popups.acesso_restrito_titulo'),
            message: `${t('receitas.popups.acesso_restrito_msg_base')}${actionMessage}${t('receitas.popups.acesso_restrito_msg_fim')}`,
            singleButton: false,
            confirmText: t('comum.iniciar_sessao'),
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
            confirmText: t('comum.ok'),
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
        axios.patch(RECEITA_URL + recipeId, { guardadores: newGuardadores }, { 
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true 
        })
            .then(res => {
                setReceita(res.data);
                setGuardado(!isAlreadySaved);
            })
            .catch(err => {
                console.error(err);
                setPopupConfig({
                    isOpen: true,
                    title: t('receitas.popups.erro_titulo'),
                    message: t('receitas.popups.erro_guardar'),
                    singleButton: true,
                    confirmText: t('comum.ok'),
                    onConfirm: closePopup,
                    onCancel: closePopup
                });
            });
    };

    const handleDelete = () => {
        setPopupConfig({
            isOpen: true,
            title: t('receitas.popups.confirmar_eliminacao_titulo'),
            message: t('receitas.popups.apagar_receita_msg'),
            singleButton: false,
            confirmText: t('receitas.popups.apagar'),
            cancelText: t('comum.cancelar'),
            onConfirm: () => {
                axios.delete(RECEITA_URL + recipeId, {
                    headers: { 'X-CSRFToken': getCSRFToken() },
                    withCredentials: true
                })
                    .then(() => {
                        setPopupConfig({
                            isOpen: true,
                            title: t('receitas.popups.receita_apagada_titulo'),
                            message: t('receitas.popups.receita_apagada_msg'),
                            singleButton: true,
                            confirmText: t('comum.ok'),
                            onConfirm: () => navigate('/receitas'),
                            onCancel: () => navigate('/receitas')
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        setPopupConfig({
                            isOpen: true,
                            title: t('receitas.popups.erro_apagar_titulo'),
                            message: t('receitas.popups.erro_apagar_msg'),
                            singleButton: true,
                            confirmText: t('comum.ok'),
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

        axios.post(AVALIAR_URL, {
            utilizador: parseInt(userId),
            receita: parseInt(recipeId),
            nota: novaClassificacao
        }, {
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true
        })
        .then(res => {
            setReceita(res.data);

            setPopupConfig({
                isOpen: true,
                title: t('receitas.popups.avaliacao_registada_titulo'),
                message: t('receitas.popups.avaliacao_registada_msg'),
                singleButton: true,
                confirmText: t('comum.ok'),
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

        const maxLen = limits.comentario_max_length || 150;
        const validation = validateInput(novoComentario, maxLen);
        if (!validation.isValid) {
            showPopup(t('receitas.popups.erro_validacao_titulo'), validation.error);
            return;
        }

        const payload = {
            utilizador: parseInt(userId),
            receita: parseInt(recipeId),
            texto: novoComentario
        };

        axios.post(COMENTARIOS_URL, payload, {
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true
        })
            .then(res => {
                setComentarios([...comentarios, res.data]);
                setNovoComentario('');
            })
            .catch(err => {
                console.error(err);
                let message = t('receitas.popups.atencao_linguagem_msg');
                if (err.response && err.response.data) {
                    const data = err.response.data;
                    if (typeof data === 'object') {
                        const firstFieldErrors = Object.values(data)[0];
                        if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                            message = firstFieldErrors[0];
                        } else if (typeof data.msg === 'string') {
                            message = t(data.msg);
                        } else {
                            message = JSON.stringify(data);
                        }
                    } else if (typeof data === 'string') {
                        message = data;
                    }
                }
                showPopup(t('receitas.popups.atencao_linguagem_titulo'), message);
            });
    };

    const handleDeleteComentario = (comentarioId) => {
        setPopupConfig({
            isOpen: true,
            title: t('receitas.popups.confirmar_eliminacao_titulo'),
            message: t('receitas.popups.apagar_comentario_msg'),
            singleButton: false,
            confirmText: t('receitas.popups.apagar'),
            cancelText: t('comum.cancelar'),
            onConfirm: () => {
                axios.delete(COMENTARIOS_URL + comentarioId, {
                    headers: { 'X-CSRFToken': getCSRFToken() },
                    withCredentials: true
                })
                .then(() => {
                    setComentarios(comentarios.filter(c => c.id !== comentarioId));
                    closePopup();
                })
                .catch(err => {
                    console.error(err);
                    showPopup('Erro', 'Não foi possível apagar o comentário.');
                });
            },
            onCancel: closePopup
        });
    };

    const handleSaveEditComentario = (comentarioId) => {
        if (!editingCommentText.trim()) return;

        const maxLen = limits.comentario_max_length || 150;
        const validation = validateInput(editingCommentText, maxLen);
        if (!validation.isValid) {
            showPopup('Erro de Validação', validation.error);
            return;
        }

        axios.patch(COMENTARIOS_URL + comentarioId, { texto: editingCommentText }, {
            headers: { 'X-CSRFToken': getCSRFToken() },
            withCredentials: true
        })
        .then(res => {
            setComentarios(comentarios.map(c => c.id === comentarioId ? res.data : c));
            setEditingCommentId(null);
            setEditingCommentText('');
        })
        .catch(err => {
            console.error(err);
            showPopup('Atenção à Linguagem', 'Erro ao editar o comentário. Verifica a linguagem usada.');
        });
    };

    if (isLoadError) return (
        <div className="loading-container">
            <p className="error-message">{t('receitas.detalhes.nao_foi_possivel_carregar')}</p>
            <button className="btn-cancel" onClick={() => navigate('/receitas')}>{t('receitas.detalhes.voltar_as_receitas')}</button>
        </div>
    );

    if (!receita) return <div className="loading-container">{t('receitas.detalhes.a_carregar')}</div>;

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">

                    <div className="recipe-header-container">
                        <div>
                            <h1 className="page-title-underline">{receita.nome}</h1>
                        </div>
                        <div className="recipe-rating-text">
                            ⭐ {(receita.classificacao !== undefined && receita.classificacao !== null && Number(receita.classificacao) > 0) ? Number(receita.classificacao).toFixed(1) : "0.0"} / 5
                        </div>
                    </div>

                    <div className="recipe-view-container">

                        <div className="recipe-top-row">
                            <div className="recipe-main-image flex-center">
                                {receita.foto_url ? (
                                    <img
                                        src={`${URL_BASE}${receita.foto_url}`}
                                        alt={receita.nome}
                                        className="cover-image-rounded"
                                    />
                                ) : (
                                    <span className="recipe-main-icon">🍲</span>
                                )}
                            </div>

                            <div className="recipe-steps-nav" style={{ width: '100%', maxWidth: '100%' }}>
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
                                        title={`${t('receitas.detalhes.passo')} ${index + 1}`}
                                    >
                                        {index + 1}. {t('receitas.detalhes.passo')} {index + 1}
                                    </div>
                                ))}

                                <div className="view-actions-group mt-auto">
                                    <button className="btn-cancel" onClick={() => navigate(-1)}>{t('comum.voltar')}</button>

                                    {(Number(receita.criador) !== Number(userId) || isAdmin) && (
                                        <button
                                            className={`btn-create-submit ${guardado ? "btn-saved" : ""}`}
                                            onClick={handleGuardar}
                                        >
                                            {guardado ? t('receitas.detalhes.guardado') : t('receitas.detalhes.guardar')}
                                        </button>
                                    )}

                                    {(Number(receita.criador) === Number(userId) || isAdmin) && (
                                        <>
                                            <button
                                                className="btn-create-submit btn-action-edit"
                                                onClick={() => navigate('/receitas/criar-receita', { state: { editReceita: receita } })}
                                            >
                                                {t('receitas.detalhes.editar')}
                                            </button>
                                            <button
                                                className="btn-create-submit btn-action-delete"
                                                onClick={handleDelete}
                                            >
                                                {t('receitas.detalhes.remover')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="recipe-bottom-row recipe-bottom-row-flex">

                            <div className="recipe-descriptions-column recipe-col-2">
                                {receita.instrucao.map((passo, index) => {
                                    const text = typeof passo === 'string' ? passo : (passo.descricao || JSON.stringify(passo));
                                    const hasPrefix = typeof text === 'string' ? text.match(/^(Passo \d+:\s*|Step \d+:\s*|Paso \d+:\s*)(.*)/i) : null;
                                    const subtitle = `${t('receitas.detalhes.passo')} ${index + 1}`;
                                    const description = hasPrefix ? hasPrefix[2] : text;

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
                                <label className="section-subtitle">{t('receitas.detalhes.ingredientes')}</label>
                                <div className="content-box-light ingredients-box">
                                    <ul className="ingredients-list-ul">
                                        {receita.ingredientes.map((ingId, idx) => {
                                            const ingObj = dbIngredientes.find(i => i.id === ingId);
                                            let nome = ingObj ? ingObj.nome : `Ingrediente #${ingId}`;
                                            if (ingObj) {
                                                const key = ingObj.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                                                nome = t(`ingredientes.${key}`) !== `ingredientes.${key}` ? t(`ingredientes.${key}`) : ingObj.nome;
                                            }
                                            return <li key={idx}>{nome}</li>;
                                        })}
                                        {receita.ingredientes.length === 0 && <li>{t('receitas.detalhes.sem_ingredientes')}</li>}
                                    </ul>
                                </div>

                                <div className="rating-section">
                                    <label className="section-subtitle rating-title">{t('receitas.detalhes.avaliar_receita')}</label>
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
                                            {t('receitas.detalhes.avaliar')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="comments-section">
                            <h3 className="comments-title">
                                {t('receitas.detalhes.comentarios')} ({comentarios.length})
                            </h3>

                            <div className="comment-input-area">
                                <textarea
                                    className="comment-textarea"
                                    placeholder={t('receitas.detalhes.placeholder_comentario')}
                                    value={novoComentario}
                                    onChange={(e) => setNovoComentario(e.target.value)}
                                    maxLength={limits.comentario_max_length || 150}
                                />
                                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#888', marginTop: '4px', marginBottom: '8px' }}>
                                    {novoComentario.length} / {limits.comentario_max_length || 150}
                                </div>
                                <button
                                    className="btn-create-submit btn-publish-comment"
                                    onClick={handleAddComentario}
                                >
                                    {t('receitas.detalhes.publicar_comentario')}
                                </button>
                            </div>

                            <div className="comments-list">
                                {comentarios.length === 0 ? (
                                    <p className="comment-empty">
                                        {t('receitas.detalhes.sem_comentarios')}
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
                                                
                                                {editingCommentId === comentario.id ? (
                                                    <div className="comment-edit-area" style={{ marginTop: '10px' }}>
                                                        <textarea
                                                            className="comment-textarea"
                                                            value={editingCommentText}
                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                            maxLength={limits.comentario_max_length || 150}
                                                        />
                                                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>
                                                            {editingCommentText.length} / {limits.comentario_max_length || 150}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                            <button className="btn-cancel" onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}>{t('comum.cancelar')}</button>
                                                            <button className="btn-create-submit" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => handleSaveEditComentario(comentario.id)}>{t('receitas.detalhes.guardar')}</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="comment-text">{comentario.texto}</p>
                                                )}

                                                {(Number(comentario.utilizador) === Number(userId) || isAdmin) && editingCommentId !== comentario.id && (
                                                    <div className="comment-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                        <button className="btn-profile-pill" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => { setEditingCommentId(comentario.id); setEditingCommentText(comentario.texto); }}>{t('receitas.detalhes.editar')}</button>
                                                        <button className="btn-profile-pill secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', color: 'red', borderColor: 'red' }} onClick={() => handleDeleteComentario(comentario.id)}>{t('receitas.detalhes.remover')}</button>
                                                    </div>
                                                )}
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

export default VerReceita;