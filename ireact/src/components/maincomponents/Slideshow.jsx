import { useState, useEffect } from 'react';
import '../../css/styles.css';

const SLIDES = [
  {
    image: 'http://localhost:8000/idjango/media/slideshow/breakfast.jpg',
    title: 'Pequeno-Almoço Saudável',
    description: 'Comece o seu dia com refeições nutritivas e fáceis de preparar.'
  },
  {
    image: 'http://localhost:8000/idjango/media/slideshow/burger.jpg',
    title: 'Hambúrgueres Caseiros',
    description: 'Descubra o segredo de um hambúrguer gourmet suculento e saboroso.'
  },
  {
    image: 'http://localhost:8000/idjango/media/slideshow/foods.jpg',
    title: 'Receitas Criativas',
    description: 'Crie pratos fantásticos com os ingredientes que tem no frigorífico.'
  },
  {
    image: 'http://localhost:8000/idjango/media/slideshow/sushi.jpg',
    title: 'Arte do Sushi',
    description: 'Aprenda a fazer rolos de sushi perfeitos com peixe fresco e arroz temperado.'
  }
];

const Slideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? SLIDES.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="slideshow-wrapper">
      <div className="slideshow-container">
        {SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`slide-item ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content">
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-description">{slide.description}</p>
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
          {SLIDES.map((_, index) => (
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
