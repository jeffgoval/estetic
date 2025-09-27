import { useEffect } from 'react';
import { useTheme, Theme, ThemeColors } from '../contexts/ThemeContext';

interface TenantTheme {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  brandName?: string;
}

export const useCustomTheme = (tenantTheme?: TenantTheme) => {
  const { theme, applyCustomColors } = useTheme();

  useEffect(() => {
    if (tenantTheme) {
      const customColors: Partial<ThemeColors> = {};
      
      if (tenantTheme.primaryColor) {
        customColors.primary = tenantTheme.primaryColor;
      }
      
      if (tenantTheme.secondaryColor) {
        customColors.secondary = tenantTheme.secondaryColor;
      }
      
      applyCustomColors(customColors);
    }
  }, [tenantTheme, applyCustomColors]);

  const generateThemeFromPrimary = (primaryColor: string): Partial<ThemeColors> => {
    // Função simples para gerar variações de cor
    // Em uma implementação real, você poderia usar uma biblioteca como chroma-js
    return {
      primary: primaryColor,
      secondary: primaryColor.replace(/hsl\((\d+)/, 'hsl($1'), // Simplificado
    };
  };

  return {
    theme,
    generateThemeFromPrimary,
    applyTenantTheme: (tenantTheme: TenantTheme) => {
      if (tenantTheme.primaryColor) {
        const customColors = generateThemeFromPrimary(tenantTheme.primaryColor);
        applyCustomColors(customColors);
      }
    },
  };
};