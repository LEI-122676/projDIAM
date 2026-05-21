import { useState, useEffect, useRef } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import PopupModal from '../maincomponents/popupModal.jsx';
import { getCSRFToken } from '../../utils/csrf.js';
import { getFieldLimits, validateInput } from '../../utils/validation.js';


const CriarReceita = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editReceita = location.state?.editReceita;
    const fileInputRef = useRef(null);

    const [nome, setNome] = useState(editReceita ? editReceita.nome || '' : '');
    const [passos, setPassos] = useState(editReceita ? editReceita.instrucao || [''] : ['']);
    const [ingredientesList, setIngredientesList] = useState(['']);
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(
        editReceita && editReceita.foto_url 
            ? (editReceita.foto_url.startsWith('http') ? editReceita.foto_url : `http://localhost:8000${editReceita.foto_url}`) 
            : null
    );

    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [utilizadorId, setUtilizadorId] = useState(() => localStorage.getItem('utilizadorId'));
    const [limits, setLimits] = useState({});

    const [popupConfig, setPopupConfig] = useState({ isOpen: false, title: '', message: '', singleButton: true, onConfirm: () => { }, onCancel: () => { } });
    const closePopup = () => setPopupConfig(prev => ({ ...prev, isOpen: false }));

    const INGREDIENTES_URL = 'http://localhost:8000/idjango/api' + '/ingredientes/';
    const RECEITAS_URL = 'http://localhost:8000/idjango/api' + '/receitas/';

    const getIngredientes = () => {
        axios.get(INGREDIENTES_URL)
            .then(res => {
                setDbIngredientes(res.data);
                if (editReceita) {
                    const names = editReceita.ingredientes.map(ingId => {
                        const targetId = typeof ingId === 'object' && ingId !== null ? Number(ingId.id) : Number(ingId);
                        const found = res.data.find(i => Number(i.id) === targetId);
                        return found ? found.nome : '';
                    }).filter(name => name !== '');
                    setIngredientesList(names.length > 0 ? names : ['']);
                }
            })
            .catch(err => console.error("Erro ao carregar ingredientes:", err));
    };

    useEffect(() => {
        getFieldLimits().then(data => setLimits(data));
    }, []);

    useEffect(() => {
        if (!utilizadorId) {
            setPopupConfig({
                isOpen: true,
                title: 'Acesso Restrito',
                message: 'Precisas de iniciar sessão para criares uma receita.',
                singleButton: false,
                confirmText: 'Iniciar Sessão',
                onConfirm: () => navigate('/login'),
                onCancel: () => navigate('/')
            });
            return;
        }
        getIngredientes();
    }, [navigate, utilizadorId]);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleAddPasso = () => setPassos([...passos, '']);
    const handlePassoChange = (index, value) => {
        const newPassos = [...passos];
        newPassos[index] = value;
        setPassos(newPassos);
    };
    const handleRemovePasso = (index) => {
        const newPassos = [...passos];
        newPassos.splice(index, 1);
        setPassos(newPassos);
    };

    const handleAddIngrediente = () => setIngredientesList([...ingredientesList, '']);
    const handleIngredienteChange = (index, value) => {
        const newIngredientes = [...ingredientesList];
        newIngredientes[index] = value;
        setIngredientesList(newIngredientes);
    };
    const handleRemoveIngrediente = (index) => {
        const newIngredientes = [...ingredientesList];
        newIngredientes.splice(index, 1);
        setIngredientesList(newIngredientes);
    };

    const showPopup = (title, message) => {
        setPopupConfig({ isOpen: true, title, message, singleButton: true, confirmText: 'OK', onConfirm: closePopup, onCancel: closePopup });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nome.trim()) { showPopup('Campo Obrigatório', 'Por favor, dê um nome à receita.'); return; }
        if (!utilizadorId) { showPopup('Erro', 'Não foi possível identificar o utilizador. Faz login novamente.'); return; }

        const nomeValidation = validateInput(nome, limits.receita_nome_max_length || 50);
        if (!nomeValidation.isValid) {
            showPopup('Erro de Validação', `Nome da receita: ${nomeValidation.error}`);
            return;
        }

        for (let i = 0; i < passos.length; i++) {
            const stepValidation = validateInput(passos[i], limits.receita_instrucao_max_length || 500);
            if (!stepValidation.isValid) {
                showPopup('Erro de Validação', `Passo ${i + 1}: ${stepValidation.error}`);
                return;
            }
        }

        if (passos.some(p => p.trim() === '')) {
            showPopup('Campos em Branco', 'Por favor, não deixe passos em branco. Preenche ou remove o campo vazio.');
            return;
        }

        if (ingredientesList.some(ing => ing.trim() === '')) {
            showPopup('Campos em Branco', 'Por favor, não deixe ingredientes em branco. Preenche ou remove o campo vazio.');
            return;
        }

        const passosFormatados = passos.map((p, index) => {
            const prefix = `Passo ${index + 1}: `;
            if (p.startsWith(prefix)) return p;
            if (p.match(/^Passo \d+:/)) return prefix + p.replace(/^Passo \d+:\s*/, '');
            return prefix + p;
        });

        if (passosFormatados.length === 0) { showPopup('Campo Obrigatório', 'Por favor, adicione pelo menos um passo.'); return; }

        const idsIngredientes = [];
        for (let ing of ingredientesList) {
            const found = dbIngredientes.find(dbI => dbI.nome.toLowerCase() === ing.trim().toLowerCase());
            if (found) {
                idsIngredientes.push(found.id);
            } else {
                showPopup('Ingrediente Não Encontrado', `O ingrediente "${ing}" não existe na base de dados. Escolhe um ingrediente da lista.`);
                return;
            }
        }

        if (idsIngredientes.length === 0) { showPopup('Campo Obrigatório', 'Por favor, adicione pelo menos um ingrediente.'); return; }

        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('criador', utilizadorId);

        if (foto instanceof File) {
            formData.append('foto', foto);
        }

        formData.append('instrucao', JSON.stringify(passosFormatados));

        const uniqueIds = [...new Set(idsIngredientes)];
        uniqueIds.forEach(id => formData.append('ingredientes', id));

        const requestPromise = editReceita
            ? axios.patch(`${RECEITAS_URL}${editReceita.id}`, formData, {
                headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            })
            : axios.post(RECEITAS_URL, formData, {
                headers: { 'X-CSRFToken': getCSRFToken(), 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

        requestPromise
            .then(() => {
                setPopupConfig({
                    isOpen: true,
                    title: editReceita ? 'Receita Atualizada!' : 'Receita Criada!',
                    message: editReceita ? 'A tua receita foi atualizada com sucesso!' : 'A tua receita foi criada com sucesso!',
                    singleButton: true,
                    confirmText: 'OK',
                    onConfirm: () => navigate('/receitas'),
                    onCancel: () => navigate('/receitas')
                });
            })
            .catch(err => {
                console.error(err);
                let message = 'Por favor, tenha atenção à sua linguagem. Não são permitidos palavrões, links ou anúncios na sua receita.';
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


    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">{editReceita ? 'Editar Receita' : 'Criar Receita'}</h1>
                    <div className="create-recipe-container">

                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>Nome* <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>({nome.length}/{limits.receita_nome_max_length || 50})</span>:</label>
                                <input
                                    type="text"
                                    className="input-beige text-black"
                                    placeholder="Dê um nome à sua receita"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    maxLength={limits.receita_nome_max_length || 50}
                                />
                            </div>

                            <div className="form-group">
                                <label>Passos*:</label>
                                {passos.map((passo, index) => (
                                    <div key={index} className="dynamic-list-item dynamic-list-item-flex" style={{ alignItems: 'flex-start' }}>
                                        <span className="item-number" style={{ marginTop: '8px' }}>{index + 1}.</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <input
                                                type="text"
                                                className="input-beige flex-input-black"
                                                placeholder="Descreva o passo da receita..."
                                                value={passo}
                                                onChange={(e) => handlePassoChange(index, e.target.value)}
                                                maxLength={limits.receita_instrucao_max_length || 500}
                                            />
                                            <span style={{ alignSelf: 'flex-end', fontSize: '0.75rem', color: '#888', marginTop: '2px', marginRight: '10px' }}>
                                                {passo.length}/{limits.receita_instrucao_max_length || 500}
                                            </span>
                                        </div>
                                        {passos.length > 1 && (
                                            <button className="btn-cancel btn-cancel-small" style={{ marginTop: '4px' }} onClick={() => handleRemovePasso(index)}>X</button>
                                        )}
                                    </div>
                                ))}
                                <button className="btn-add-dashed" onClick={handleAddPasso}>+</button>
                            </div>

                            <div className="form-group">
                                <label>Ingredientes*:</label>
                                {ingredientesList.map((ingrediente, index) => (
                                    <div key={index} className="dynamic-list-item dynamic-list-item-flex">
                                        <span className="item-number">{index + 1}.</span>
                                        <input
                                            type="text"
                                            className="input-beige flex-input-black"
                                            placeholder="Nome do ingrediente..."
                                            list="lista-ingredientes"
                                            value={ingrediente}
                                            onChange={(e) => handleIngredienteChange(index, e.target.value)}
                                        />
                                        {ingredientesList.length > 1 && (
                                            <button className="btn-cancel btn-cancel-small" onClick={() => handleRemoveIngrediente(index)}>X</button>
                                        )}
                                    </div>
                                ))}
                                <datalist id="lista-ingredientes">
                                    {dbIngredientes.map(dbI => (
                                        <option key={dbI.id} value={dbI.nome} />
                                    ))}
                                </datalist>
                                <button className="btn-add-dashed" onClick={handleAddIngrediente}>+</button>
                            </div>
                        </div>

                        <div className="recipe-image-section">
                            <div
                                className="image-upload-placeholder"
                                onClick={() => fileInputRef.current.click()}
                                title="Clica para adicionar uma foto"
                            >
                                {fotoPreview ? (
                                    <img
                                        src={fotoPreview}
                                        alt="Pré-visualização"
                                        className="image-preview-fit"
                                    />
                                ) : (
                                    <div className="image-upload-info">
                                        <div className="image-upload-icon">📷</div>
                                        <p className="image-upload-text">Clica para adicionar foto*</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden-element"
                                onChange={handleFotoChange}
                            />
                            {fotoPreview && (
                                <button
                                    className="btn-cancel btn-cancel-small btn-remove-photo"
                                    onClick={() => { setFoto(null); setFotoPreview(null); fileInputRef.current.value = ''; }}
                                >
                                    Remover foto
                                </button>
                            )}

                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)}>Cancelar</button>
                                <button className="btn-create-submit" onClick={handleSubmit}>{editReceita ? 'Guardar' : 'Criar'}</button>
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

export default CriarReceita;