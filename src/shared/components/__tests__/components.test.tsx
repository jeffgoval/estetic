import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Button,
  Text,
} from '../atoms';
import { ThemeProvider } from '../../contexts';

// Wrapper com ThemeProvider para testes
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('Componentes Atoms', () => {
  it('deve renderizar Button corretamente', () => {
    const { container } = render(
      <TestWrapper>
        <Button>Teste</Button>
      </TestWrapper>
    );
    expect(container.querySelector('button')).toBeTruthy();
    expect(container.textContent).toContain('Teste');
  });

  it('deve renderizar Text com variante correta', () => {
    const { container } = render(
      <TestWrapper>
        <Text variant="h1">Título</Text>
      </TestWrapper>
    );
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.textContent).toContain('Título');
  });
});