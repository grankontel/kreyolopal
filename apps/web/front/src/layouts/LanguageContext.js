import React, { useState, useEffect } from 'react';

const LanguageContext = React.createContext();

const LanguageProvider = (props) => {
  const [locale, setLocale] = useState(props.lang || 'fr');

  useEffect(() => {
    if (document !== null) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <LanguageContext.Provider value={(locale, setLocale)}>
      {props.children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return React.useContext(LanguageContext);
}

export default LanguageProvider;
