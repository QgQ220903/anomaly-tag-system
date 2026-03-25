// src/components/layout/AppLayout.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  currentRole: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, currentRole }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentRole={currentRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentRole={currentRole} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};