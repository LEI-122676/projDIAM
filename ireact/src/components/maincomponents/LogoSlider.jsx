import { useState, useEffect } from 'react';
import '../../css/styles.css';

const LogoSlider = () => {
  const URL_BASE = 'http://localhost:8000';
  const mediaBaseUrl = `${URL_BASE}/idjango/media/infinite_logo_slider/`;
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jsonFile = import.meta.env.VITE_LOGOS_JSON_FILE;
    if (jsonFile) {
      fetch(`/${jsonFile}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch logos config: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setLogos(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error loading logos:', err);
          setLoading(false);
        });
    } else {
      console.warn('VITE_LOGOS_JSON_FILE environment variable is not defined.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="logo-slider-wrapper">
        <p style={{ color: '#716259', fontWeight: 'bold' }}>A carregar marcas...</p>
      </div>
    );
  }

  if (logos.length === 0) {
    return null;
  }

  // Duplicar a lista de logótipos para fazer o loop infinito sem interrupções
  const duplicatedLogos = [...logos, ...logos];
  

  return (
    <div className="logo-slider-wrapper">
      <h3 className="logo-slider-title">Marcas Parceiras</h3>
      <div className="logo-slider-container">
        <div className="logo-slider-track">
          {duplicatedLogos.map((logo, index) => (
            <div className="logo-slide-item" key={index}>
              <img
                src={`${mediaBaseUrl}${logo}`}
                alt={`Parceiro ${index}`}
                className="partner-logo-img"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSlider;
