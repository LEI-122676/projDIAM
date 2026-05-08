import 'react';
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeFrig from "../../assets/frigorifico.svg";
import {useNavigate} from "react-router-dom";

const ExplorarReceitas = () => {
    const navigate = useNavigate();
    const recipesPlaceholder = [
        "Receita A", "Receita B", "Receita C", "Receita D", "Receita E",
        "Receita F", "Receita G", "Receita H", "Receita I", "Receita J",
        "Receita K", "Receita L", "Receita M", "Receita N", "Receita O"
    ];

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    {/* Alinhado à esquerda */}
                    <div className="profile-grid" style={{ margin: '0', maxWidth: '100%' }}>

                        <h1 className="page-title-underline">Descobrir Receitas</h1>

                        <div className="recipes-action-bar">
                            <div className="recipes-search-container">
                                <input
                                    type="text"
                                    placeholder="Pesquisar receitas..."
                                    className="main-search-input recipe-search-box"
                                />
                                <img src={iconeLupa} alt="Lupa" className="recipe-icon-svg search-icon-pos" />
                            </div>

                            <div className="recipes-button-group">
                                <button className="btn-filter-fridge">
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg" style={{marginRight: '8px'}} />
                                    Frigorífico
                                    <img src={iconeFrig} alt="Frigorifico" className="recipe-icon-svg" style={{marginLeft: '8px'}} />
                                </button>

                                <button className="btn-add-recipe" onClick={() => navigate('/receitas/criar-receita')}>+</button>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {recipesPlaceholder.map((name, index) => (
                                <div key={index} className="recipe-card">
                                    <div className="recipe-image-placeholder">
                                        <span style={{ fontSize: '40px', color: '#D1CDBC' }}>✕</span>
                                    </div>
                                    <div className="recipe-card-footer">
                                        <span className="ingredient-name">{name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExplorarReceitas;