import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * UI Theme Context — kawal tema visual seluruh app:
 *  - 'ps5'      : tema gelap sinematik (default semasa)
 *  - 'classic'  : tema lama cerah berwarna + corak (sebelum migrasi PS5)
 *
 * Disimpan dalam localStorage supaya instant (tiada lag fetch) & kekal antara sesi.
 * Kita juga set atribut `data-ui-theme` pada <html> supaya CSS boleh bertindak balas global.
 */
const UIThemeContext = createContext({ uiTheme: 'ps5', setUITheme: () => {}, isClassic: false });

const STORAGE_KEY = 'ceriakid_ui_theme';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'ps5';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'classic' ? 'classic' : 'ps5';
  } catch {
    return 'ps5';
  }
};

export function UIThemeProvider({ children }) {
  const [uiTheme, setUITheme] = useState(getInitialTheme);

  // Sync ke <html data-ui-theme> + localStorage setiap kali bertukar
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-ui-theme', uiTheme);
    }
    try {
      localStorage.setItem(STORAGE_KEY, uiTheme);
    } catch { /* silent */ }
  }, [uiTheme]);

  const updateTheme = useCallback((theme) => {
    setUITheme(theme === 'classic' ? 'classic' : 'ps5');
  }, []);

  return (
    <UIThemeContext.Provider value={{ uiTheme, setUITheme: updateTheme, isClassic: uiTheme === 'classic' }}>
      {children}
    </UIThemeContext.Provider>
  );
}

export const useUITheme = () => useContext(UIThemeContext);