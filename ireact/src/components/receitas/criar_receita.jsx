import 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import '../../css/styles.css'
import {useNavigate} from "react-router-dom";

const CriarReceita = () => {
    const navigate = useNavigate();
    /* LOGICA (DJANGO/REACT):
       - Use useState para listas: const [passos, setPassos] = useState(['']);
       - Função para adicionar campo: setPassos([...passos, '']);
       - Para os ingredientes, você pode usar um <datalist> para sugerir opções vindas do banco.
    */

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    <h1 className="page-title-underline">Criar Receita</h1>
                    <div className="create-recipe-container">
                        {/* COLUNA ESQUERDA: FORMULÁRIO */}
                        <div className="recipe-form-section">
                            {/* NOME */}
                            <div className="form-group">
                                <label>Nome*:</label>
                                <input
                                    type="text"
                                    className="input-beige"
                                    placeholder="Dê um nome à sua receita"
                                />
                            </div>

                            {/* PASSOS */}
                            <div className="form-group">
                                <label>Passos*:</label>
                                {/* Mapear os passos aqui */}
                                <div className="dynamic-list-item">
                                    <span className="item-number">1.</span>
                                    <input type="text" className="input-beige" placeholder="Primeiro passo da receita..." />
                                </div>
                                <button className="btn-add-dashed">+</button>
                            </div>

                            {/* INGREDIENTES */}
                            <div className="form-group">
                                <label>Ingredientes*:</label>
                                {/* Mapear os ingredientes aqui */}
                                <div className="dynamic-list-item">
                                    <span className="item-number">1.</span>
                                    <input
                                        type="text"
                                        className="input-beige"
                                        placeholder="Nome do ingrediente..."
                                        list="lista-ingredientes" // Aqui conecta com a escolha da lista
                                    />
                                    {/* Exemplo de como fazer a pessoa "escolher da lista" */}
                                    <datalist id="lista-ingredientes">
                                        <option value="Tomate" />
                                        <option value="Cebola" />
                                        <option value="Alho" />
                                        {/* Essas opções virão do seu banco Django */}
                                    </datalist>
                                </div>
                                <button className="btn-add-dashed">+</button>
                            </div>
                        </div>

                        {/* COLUNA DIREITA: IMAGEM E BOTÕES */}
                        <div className="recipe-image-section">
                            <div className="create-actions-group">
                                <button className="btn-cancel" onClick={() => navigate(-1)} >Cancelar</button>
                                <button className="btn-create-submit">Criar</button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default CriarReceita;