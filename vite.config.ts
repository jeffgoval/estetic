import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
    // Otimizações de build para performance
    rollupOptions: {
      output: {
        // Separar chunks por funcionalidade
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router'],
          'apollo-vendor': ['@apollo/client', 'graphql'],
          'ui-vendor': ['lucide-react', 'recharts'],
          
          // Feature chunks
          'auth-features': [
            './src/shared/hooks/auth',
            './src/shared/providers/AuthProvider.tsx'
          ],
          'dashboard-features': [
            './src/react-app/pages/Dashboard.tsx',
            './src/shared/features/dashboard'
          ],
          'patients-features': [
            './src/react-app/pages/Patients.tsx',
            './src/shared/features/patients'
          ],
          'appointments-features': [
            './src/react-app/pages/Schedule.tsx',
            './src/shared/features/appointments'
          ],
        },
        // Otimizar nomes de chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
      },
    },
    // Otimizações de minificação
    minify: 'esbuild',
    // Configurações de sourcemap
    sourcemap: process.env.NODE_ENV === 'development',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@apollo/client',
      'graphql',
      'lucide-react',
      'recharts',
      'zustand',
    ],
  },
});
