import { createContext, useContext, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() =>
    localStorage.getItem('app_lang') || 'ru'
  );

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  
  const t = (key) => translations[lang]?.[key] ?? translations['ru']?.[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
