import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  mode: 'light' | 'dark';
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleMode: () => void;
  applyCustomColors: (colors: Partial<ThemeColors>) => void;
}

const defaultTheme: Theme = {
  name: 'default',
  mode: 'light',
  colors: {
    primary: 'hsl(30 25% 59%)',
    secondary: 'hsl(30 20% 85%)',
    accent: 'hsl(30 25% 90%)',
    success: 'hsl(142 71% 45%)',
    error: 'hsl(0 84% 60%)',
    warning: 'hsl(38 92% 50%)',
    neutral: {
      50: 'hsl(30 20% 98%)',
      100: 'hsl(30 18% 94%)',
      200: 'hsl(30 15% 88%)',
      300: 'hsl(30 12% 80%)',
      400: 'hsl(30 10% 65%)',
      500: 'hsl(30 8% 50%)',
      600: 'hsl(30 10% 40%)',
      700: 'hsl(30 12% 30%)',
      800: 'hsl(30 15% 20%)',
      900: 'hsl(30 18% 12%)',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = defaultTheme,
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const toggleMode = () => {
    setTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const applyCustomColors = (colors: Partial<ThemeColors>) => {
    setTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors,
      },
    }));
  };

  // Aplicar variáveis CSS quando o tema mudar
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar cores do tema
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-warning', theme.colors.warning);
    
    // Aplicar cores neutras
    Object.entries(theme.colors.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value);
    });
    
    // Aplicar classe do modo
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleMode,
    applyCustomColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};