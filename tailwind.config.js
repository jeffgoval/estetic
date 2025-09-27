/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/react-app/**/*.{js,ts,jsx,tsx}",
    "./src/shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nova paleta terrosa e acolhedora
        primary: {
          DEFAULT: 'hsl(30 25% 59%)',  // Tom terroso principal
          hover: 'hsl(30 23% 53%)',    // Hover mais escuro
          foreground: 'hsl(0 0% 98%)', // Texto sobre primário
          50: 'hsl(30 40% 95%)',
          100: 'hsl(30 35% 90%)',
          200: 'hsl(30 30% 80%)',
          300: 'hsl(30 28% 70%)',
          400: 'hsl(30 26% 65%)',
          500: 'hsl(30 25% 59%)',       // Principal
          600: 'hsl(30 23% 53%)',       // Hover
          700: 'hsl(30 20% 45%)',
          800: 'hsl(30 18% 35%)',
          900: 'hsl(30 15% 25%)',
        },
        secondary: 'hsl(30 20% 85%)',    // Tom neutro claro
        accent: 'hsl(30 25% 90%)',       // Destaque sutil
        muted: 'hsl(30 15% 90%)',        // Elementos desabilitados
        
        // Estados
        success: 'hsl(142 71% 45%)',     // Verde para sucesso
        error: 'hsl(0 84% 60%)',         // Vermelho para erros
        warning: 'hsl(38 92% 50%)',      // Amarelo para avisos
        
        // Cores complementares mantidas mas ajustadas
        'warm-beige': 'hsl(30 30% 95%)',
        'soft-beige': 'hsl(30 25% 92%)',
        charcoal: 'hsl(0 0% 17%)',
        'off-white': 'hsl(30 15% 98%)',
        
        // Tons neutros terrosos
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
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
