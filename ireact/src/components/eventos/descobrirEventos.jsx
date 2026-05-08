import React from 'react'; // Corrigido aqui
import Header from '../maincomponents/header.jsx';
import Sidebar from '../maincomponents/sidebar.jsx';
import iconeLupa from "../../assets/lupa.svg";
import iconeFiltro from "../../assets/filtro.svg";
import iconeCalendario from "../../assets/calendario.svg";
import { useNavigate } from 'react-router-dom';
import '../../css/styles.css';

const ExplorarEventos = () => {
    const navigate = useNavigate();
    const eventosPlaceholder = [
        "Evento A", "Evento B", "Evento C", "Evento D", "Evento E",
        "Evento F", "Evento G", "Evento H", "Evento I", "Evento J",
        "Evento K", "Evento L", "Evento M", "Evento N", "Evento O"
    ];
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/eventos?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="body-wrapper">
            <Header />
            <div className="main-wrapper">
                <Sidebar />
                <main className="content-profile">
                    {/* Alinhado à esquerda */}
                    <div className="profile-grid" style={{ margin: '0', maxWidth: '100%' }}>

                        <h1 className="page-title-underline">Descobrir Eventos</h1>

                            <div className="recipes-action-bar">
                                <div className="recipes-search-container">
                                <form onSubmit={handleSearch} className="main-search-input recipe-search-box">
                                    <input
                                        type="text"
                                        placeholder="Pesquisar eventos"
                                        className="main-search-input"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button type="submit"  onClick={handleSearch} className="btn-search-bar">
                                        <img src={iconeLupa} alt="Lupa" style={{ width: '20px', height: '20px' }} />
                                    </button>
                                    </form>
                            </div>

                            <div className="recipes-button-group">
                                <button className="btn-filter-fridge">
                                    <img src={iconeFiltro} alt="Filtro" className="recipe-icon-svg" style={{marginRight: '8px'}} />
                                    Calendario
                                    <img src={iconeCalendario} alt="Calendario" className="recipe-icon-svg" style={{marginLeft: '8px'}} />
                                </button>

                                <button onClick={() => navigate('/criarEvento')} className="btn-add-recipe">+</button>
                            </div>
                        </div>

                        <div className="recipes-grid">
                            {eventosPlaceholder.map((name, index) => (
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

export default ExplorarEventos;