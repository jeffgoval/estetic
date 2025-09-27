import React from 'react';
import { NhostProvider } from '@nhost/react';
import { nhost } from '../config/nhost';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <NhostProvider nhost={nhost}>
      {children}
    </NhostProvider>
  );
};