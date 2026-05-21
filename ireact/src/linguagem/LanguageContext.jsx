import React, { createContext, useState, useContext, useEffect } from 'react';
import pt from './pt.json';
import en from './en.json';
import es from './es.json';

const translations = {
  pt,
  en,
  es
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (let k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to Portuguese if key is missing in current language
        let fallbackValue = translations['pt'];
        for (let fk of keys) {
            if (fallbackValue && fallbackValue[fk]) {
                fallbackValue = fallbackValue[fk];
            } else {
                return key; // return key name if completely missing
            }
        }
        return fallbackValue;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
