import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './maincomponents/header.jsx';
import Sidebar from './maincomponents/sidebar.jsx';
import Slideshow from './maincomponents/Slideshow.jsx';
import LogoSlider from './maincomponents/LogoSlider.jsx';
import axios from 'axios';
import '../css/styles.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/receitas?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const [feedbackStats, setFeedbackStats] = useState(null);
  
  useEffect(() => {
    const URL_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/idjango/api';
    axios.get(`${URL_BASE}/feedback/stats/`)
      .then(res => {
        if (!res.data.msg) setFeedbackStats(res.data);
      })
      .catch(err => console.error("Erro feedback", err));
  }, []);

  return (
    <div className="body-wrapper">
      <Header />

      <div className="main-wrapper">
        <Sidebar />

        <main className="content-home">
          <div className="home-container">
            <div className="home-hero-section">
              <h1 className="home-welcome-title">Bem-vindo ao seu iFridge!</h1>

              <form onSubmit={handleSearch} className="search-container">
                <input
                  type="text"
                  placeholder="Pesquisar receitas (ex: Sopa, Frango...)"
                  className="main-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn-search-home">
                  Pesquisar
                </button>
              </form>
            </div>

            <Slideshow />
            
            {feedbackStats && (
              <div className="feedback-highlights-section" style={{ width: '100%', marginTop: '50px', marginBottom: '50px' }}>
                <h2 className="section-subtitle" style={{ textAlign: 'center', fontSize: '2rem' }}>O que dizem sobre nós</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#716259' }}>
                  A nossa funcionalidade mais bem avaliada é a secção de <strong>{feedbackStats.melhor_categoria?.nome || ''}</strong> com ⭐ {feedbackStats.melhor_categoria?.nota || 0}/5!
                </p>
                <div className="horizontal-scroll-container">
                  {feedbackStats.comentarios_recentes?.map(f => (
                    <div key={f.id} className="feedback-card">
                      <p className="feedback-text">"{f.comentario_livre}"</p>
                      <p className="feedback-author">- {f.utilizador_nome}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <LogoSlider />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;