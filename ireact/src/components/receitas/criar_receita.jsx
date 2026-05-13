import { useState, useEffect } from 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const CriarReceita = () => {
    const navigate = useNavigate();

    const [nome, setNome] = useState('');
    const [passos, setPassos] = useState(['']);
    const [ingredientesList, setIngredientesList] = useState(['']);

    const [dbIngredientes, setDbIngredientes] = useState([]);
    const [utilizadorId, setUtilizadorId] = useState(null);

    const INGREDIENTES_URL = 'http://localhost:8000/idjango/api/ingredientes/';
    const RECEITAS_URL = 'http://localhost:8000/idjango/api/receitas/';

    useEffect(() => {
        axios.get(INGREDIENTES_URL)
            .then(res => setDbIngredientes(res.data))
            .catch(err => console.error("Erro ao carregar ingredientes:", err));

        // Verify authentication
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
            return;
        }
        setUtilizadorId(userId);
    }, []);

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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!nome) {
            alert('Por favor, dê um nome à receita.');
            return;
        }

        if (!utilizadorId) {
            alert('Não foi possível encontrar um utilizador (criador) na base de dados para associar a receita.');
            return;
        }

        const passosFormatados = passos
            .filter(p => p.trim() !== '')
            .map((p, index) => {
                const prefix = `Passo ${index + 1}: `;
                if (p.startsWith(prefix)) return p;
                if (p.match(/^Passo \d+:/)) {
                    return prefix + p.replace(/^Passo \d+:\s*/, '');
                }
                return prefix + p;
            });

        if (passosFormatados.length === 0) {
            alert('Por favor, adicione pelo menos um passo.');
            return;
        }

        const idsIngredientes = [];
        for (let ing of ingredientesList) {
            if (ing.trim() === '') continue;
            const found = dbIngredientes.find(dbI => dbI.nome.toLowerCase() === ing.trim().toLowerCase());
            if (found) {
                idsIngredientes.push(found.id);
            } else {
                alert(`O ingrediente "${ing}" não foi encontrado na base de dados. Por favor, escolha um ingrediente existente.`);
                return;
            }
        }

        if (idsIngredientes.length === 0) {
            alert('Por favor, adicione pelo menos um ingrediente.');
            return;
        }

        const payload = {
            nome: nome,
            instrucao: passosFormatados,
            criador: utilizadorId,
            ingredientes: idsIngredientes,
            guardadores: [],
            classificacao: 0.0
        };

        axios.post(RECEITAS_URL, payload)
            .then(() => {
                alert('Receita criada com sucesso!');
                navigate(-1);
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data) {
                    alert('Erro ao criar receita: ' + JSON.stringify(err.response.data));
                } else {
                    alert('Erro de conexão ao criar receita.');
                }
            });
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">Criar Receita</h1>
                    <div className="create-recipe-container">
                        <div className="recipe-form-section">
                            <div className="form-group">
                                <label>Nome*:</label>
                                <input
                                    type="text"
                                    className="input-beige text-black"
                                    placeholder="Dê um nome à sua receita"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Passos*:</label>
                                {passos.map((passo, index) => (
                                    <div key={index} className="dynamic-list-item dynamic-list-item-flex">
                                        <span className="item-number">{index + 1}.</span>
                                        <input
                                            type="text"
                                            className="input-beige flex-input-black"
                                            placeholder="Descreva o passo da receita..."
                                            value={passo}
                                            onChange={(e) => handlePassoChange(index, e.target.value)}
                                        />
                                        {passos.length > 1 && (
                                            <button className="btn-cancel btn-cancel-small" onClick={() => handleRemovePasso(index)}>X</button>
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
                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)} >Cancelar</button>
                                <button className="btn-create-submit" onClick={handleSubmit}>Criar</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default CriarReceita;