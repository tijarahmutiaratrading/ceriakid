import React, { createContext, useContext, useState } from 'react';
import { t } from './i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem('kidLang') || 'bm'
  );

  const toggleLang = () => {
    const newLang = lang === 'bm' ? 'en' : 'bm';
    setLang(newLang);
    localStorage.setItem('kidLang', newLang);
  };

  const tr = (key) => t(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t: tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}