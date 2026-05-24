import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './maincomponents/header.jsx';
import Sidebar from './maincomponents/sidebar.jsx';
import Footer from './maincomponents/Footer.jsx';
import Slideshow from './maincomponents/Slideshow.jsx';
import LogoSlider from './maincomponents/LogoSlider.jsx';
import CookieLeaderboard from './maincomponents/CookieLeaderboard.jsx';
import axios from 'axios';
import '../css/styles.css';
import { useLanguage } from '../linguagem/LanguageContext.jsx';
import SearchBar from './maincomponents/SearchBar.jsx';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

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
              <h1 className="home-welcome-title">{t('homepage.bem_vindo')}</h1>

              <SearchBar 
                className="search-container"
                inputClassName=""
                onSubmit={handleSearch}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('homepage.pesquisar_placeholder')}
                buttonText={t('homepage.pesquisar')}
              />
            </div>

            <Slideshow />
            
            {feedbackStats && (
              <div className="review-slider-wrapper full-width-section">
                <h2 className="review-slider-title">{t('homepage.o_que_dizem')}</h2>
                <p className="review-slider-subtitle">
                  {t('homepage.funcionalidade_melhor_avaliada')} <strong>{feedbackStats.melhor_categoria?.nome || ''}</strong> {t('homepage.com')} ⭐ {feedbackStats.melhor_categoria?.nota || 0}/5!
                </p>
                <div className="review-slider-container">
                  <div className="review-slider-track">
                    {feedbackStats.comentarios_recentes && (() => {
                        const maxWords = parseInt(import.meta.env.VITE_MAX_FEEDBACK_WORDS || "30", 10);
                        const filteredComments = feedbackStats.comentarios_recentes.filter(f => 
                            f.comentario_livre && f.comentario_livre.trim().split(/\s+/).length <= maxWords
                        );
                        return [...filteredComments, ...filteredComments].map((f, index) => (
                          <div key={`${f.id}-${index}`} className="review-slide-item">
                            <p className="review-slide-text">"{f.comentario_livre}"</p>
                            <p className="review-slide-author">- {f.utilizador_nome}</p>
                          </div>
                        ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Logo Slider placed outside home-container to allow full bleed */}
          <div className="full-width-section">
            <LogoSlider />
            <CookieLeaderboard />
          </div>
          <div className="footer-spacer"></div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Home;
