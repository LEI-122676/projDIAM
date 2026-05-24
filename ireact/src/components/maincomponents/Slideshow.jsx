import { useState, useEffect } from 'react';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';
import '../../css/styles.css';

const Slideshow = () => {
  const { t } = useLanguage();
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jsonFile = import.meta.env.VITE_SLIDESHOW_JSON_FILE;
    if (jsonFile) {
      fetch(`/${jsonFile}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch slideshow config: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setSlides(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading slideshow data:', err);
          setLoading(false);
        });
    } else {
      console.warn('VITE_SLIDESHOW_JSON_FILE environment variable is not defined.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const handlePrev = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="slideshow-wrapper">
        <div className="slideshow-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#716259', fontWeight: 'bold' }}>{t('comum.a_carregar')}</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="slideshow-wrapper">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide-item ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h2 className="slide-title">{t(slide.title)}</h2>
                <p className="slide-description">{t(slide.description)}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Setas de navegação */}
        <button className="slideshow-arrow prev" onClick={handlePrev} aria-label="Slide anterior">
          &#10094;
        </button>
        <button className="slideshow-arrow next" onClick={handleNext} aria-label="Próximo slide">
          &#10095;
        </button>

        {/* Indicadores / Pontos */}
        <div className="slideshow-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
