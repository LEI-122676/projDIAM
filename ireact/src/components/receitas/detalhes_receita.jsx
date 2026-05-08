import 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import { useNavigate } from 'react-router-dom';

const VerReceita = () => {
    const navigate = useNavigate();

    /* LOGICA (DJANGO):
       - Aqui você buscará os dados da receita pelo ID (ex: useParams do react-router).
       - Mapeará os passos e ingredientes vindos da sua API.
    */

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">

                    <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                        <h1 className="page-title-underline">Nome da receita</h1>
                    </div>

                    <div className="recipe-view-container">

                        {/* PARTE SUPERIOR */}
                        <div className="recipe-top-row">
                            <div className="recipe-main-image">
                                <span style={{ fontSize: '100px', color: '#D1CDBC', fontWeight: '100' }}>✕</span>
                            </div>

                            <div className="recipe-steps-nav">
                                <div className="step-nav-item">1. Passo A</div>
                                <div className="step-nav-item">2. Passo B</div>
                                <div className="step-nav-item">3. Passo C</div>
                                <div className="step-nav-item">4. Passo D</div>
                                <div className="step-nav-item">5. Passo E</div>

                                <div className="view-actions-group">
                                    <button className="btn-cancel" onClick={() => navigate('/receitas')}>Voltar</button>
                                    <button className="btn-create-submit">Guardar</button>
                                </div>
                            </div>
                        </div>

                        {/* PARTE INFERIOR */}
                        <div className="recipe-bottom-row">

                            {/* Coluna de Descrição dos Passos */}
                            <div className="recipe-descriptions-column">
                                <div className="step-detail">
                                    <label className="section-subtitle">Passo A</label>
                                    <div className="content-box-light">
                                        Descrição do Passo A
                                    </div>
                                </div>

                                <div className="step-detail">
                                    <label className="section-subtitle">Passo B</label>
                                    <div className="content-box-light">
                                        Descrição do Passo B
                                    </div>
                                </div>
                            </div>

                            {/* Coluna de Ingredientes */}
                            <div className="recipe-ingredients-column">
                                <label className="section-subtitle">Ingredientes</label>
                                <div className="content-box-light" style={{ minHeight: '200px' }}>
                                    Lista de Ingredientes...
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default VerReceita;