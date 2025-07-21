import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_MODES = {
  LIGHT: 'light',
  GRADIENT: 'gradient',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('themeMode');
    return stored === THEME_MODES.LIGHT || stored === THEME_MODES.GRADIENT ? stored : THEME_MODES.GRADIENT;
  });

  useEffect(() => {
    localStorage.setItem('themeMode', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 