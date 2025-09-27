import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@getmocha/users-service/react';

interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  success_color: string;
  error_color: string;
  warning_color: string;
  info_color: string;
  background_color: string;
  card_background: string;
  text_primary: string;
  text_secondary: string;
  border_color: string;
  logo_url: string;
  clinic_name: string;
}

interface ThemeContextType {
  theme: ThemeConfig | null;
  loading: boolean;
  updateTheme: (newTheme: Partial<ThemeConfig>) => Promise<void>;
  refreshTheme: () => Promise<void>;
}

const defaultTheme: ThemeConfig = {
  primary_color: '#3B82F6',
  secondary_color: '#10B981',
  success_color: '#059669',
  error_color: '#DC2626',
  warning_color: '#D97706',
  info_color: '#0891B2',
  background_color: '#F9FAFB',
  card_background: '#FFFFFF',
  text_primary: '#111827',
  text_secondary: '#6B7280',
  border_color: '#E5E7EB',
  logo_url: '',
  clinic_name: 'Suavizar'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const applyThemeToDOM = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', themeConfig.primary_color);
    root.style.setProperty('--color-secondary', themeConfig.secondary_color);
    root.style.setProperty('--color-success', themeConfig.success_color);
    root.style.setProperty('--color-error', themeConfig.error_color);
    root.style.setProperty('--color-warning', themeConfig.warning_color);
    root.style.setProperty('--color-info', themeConfig.info_color);
    root.style.setProperty('--color-background', themeConfig.background_color);
    root.style.setProperty('--color-card-background', themeConfig.card_background);
    root.style.setProperty('--color-text-primary', themeConfig.text_primary);
    root.style.setProperty('--color-text-secondary', themeConfig.text_secondary);
    root.style.setProperty('--color-border', themeConfig.border_color);

    // Create gradient variations
    const primaryRgb = hexToRgb(themeConfig.primary_color);
    const secondaryRgb = hexToRgb(themeConfig.secondary_color);
    
    if (primaryRgb && secondaryRgb) {
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${themeConfig.primary_color} 0%, ${themeConfig.secondary_color} 100%)`);
      root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const fetchTheme = async () => {
    // 1. Primeiro, tentar carregar do localStorage para aplicação imediata
    const storedTheme = localStorage.getItem('mocha_custom_theme');
    if (storedTheme) {
      try {
        const parsedTheme = { ...defaultTheme, ...JSON.parse(storedTheme) };
        setTheme(parsedTheme);
        applyThemeToDOM(parsedTheme);
      } catch (error) {
        console.error('Error parsing stored theme:', error);
        localStorage.removeItem('mocha_custom_theme');
      }
    } else {
      // Se não houver tema salvo, aplicar o padrão
      setTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
    }

    // 2. Se não houver usuário logado, usar apenas o tema do storage ou padrão
    if (!user) {
      setLoading(false);
      return;
    }

    // 3. Buscar o tema mais recente da API para garantir sincronização
    try {
      const response = await fetch('/api/tenant/theme', {
        credentials: 'include'
      });

      if (response.ok) {
        const themeData = await response.json();
        const fullTheme = { ...defaultTheme, ...themeData };
        
        // Só aplicar se for diferente do que já está carregado para evitar flicker desnecessário
        const currentThemeString = storedTheme;
        const newThemeString = JSON.stringify(fullTheme);
        
        if (currentThemeString !== newThemeString) {
          setTheme(fullTheme);
          applyThemeToDOM(fullTheme);
        }
        
        // Sempre salvar o tema mais recente no localStorage
        localStorage.setItem('mocha_custom_theme', newThemeString);
      } else {
        // Se falhou ao buscar da API e não havia tema salvo, usar padrão
        if (!storedTheme) {
          setTheme(defaultTheme);
          applyThemeToDOM(defaultTheme);
        }
      }
    } catch (error) {
      console.error('Error fetching theme:', error);
      // Se houve erro na rede e não havia tema salvo, usar padrão
      if (!storedTheme) {
        setTheme(defaultTheme);
        applyThemeToDOM(defaultTheme);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateTheme = async (newTheme: Partial<ThemeConfig>) => {
    if (!theme) return;

    const updatedTheme = { ...theme, ...newTheme };
    setTheme(updatedTheme);
    applyThemeToDOM(updatedTheme);

    // Salvar imediatamente no localStorage para persistência
    localStorage.setItem('mocha_custom_theme', JSON.stringify(updatedTheme));

    try {
      await fetch('/api/tenant/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newTheme)
      });
    } catch (error) {
      console.error('Error updating theme:', error);
    }
  };

  const refreshTheme = async () => {
    setLoading(true);
    await fetchTheme();
  };

  useEffect(() => {
    fetchTheme();
  }, [user?.id]); // Only depend on user ID to avoid unnecessary re-fetches

  const contextValue: ThemeContextType = {
    theme,
    loading,
    updateTheme,
    refreshTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
