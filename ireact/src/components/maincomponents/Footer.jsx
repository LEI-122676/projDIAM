import React from 'react';
import '../../css/styles.css';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#">Sobre Nós</a>
          <a href="#">Privacidade</a>
          <a href="#">Termos de Uso</a>
          <a href="#">Contactos</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} iFridge. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
