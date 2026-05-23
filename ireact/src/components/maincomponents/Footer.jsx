import React from 'react';
import '../../css/styles.css';
import { useLanguage } from '../../linguagem/LanguageContext.jsx';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="main-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#">{t('footer.sobre_nos')}</a>
          <a href="#">{t('footer.privacidade')}</a>
          <a href="#">{t('footer.termos_de_uso')}</a>
          <a href="#">{t('footer.contactos')}</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} iFridge. {t('footer.direitos_reservados')}</p>
      </div>
    </footer>
  );
};

export default Footer;
