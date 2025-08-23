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
    
    // Apply theme class to HTML element
    const html = document.documentElement;
    html.classList.remove(THEME_MODES.LIGHT, THEME_MODES.GRADIENT);
    html.classList.add(theme);
    
    // Update CSS variables based on theme
    if (theme === THEME_MODES.LIGHT) {
      html.style.setProperty('--background', '0 0% 100%');
      html.style.setProperty('--foreground', '222.2 84% 4.9%');
    } else {
      // Gradient theme
      html.style.setProperty('--background', '222.2 84% 4.9%');
      html.style.setProperty('--foreground', '210 40% 98%');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 