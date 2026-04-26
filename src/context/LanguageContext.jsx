import { createContext, useContext, useState } from 'react';
import tr from '../locales/tr';
import en from '../locales/en';

const translations = { tr, en };
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'tr');

  const toggle = () => {
    const next = lang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('lang', next);
    setLang(next);
  };

  const t = (path) => {
    const keys = path.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    return val ?? path;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
