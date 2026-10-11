import type { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';

export function AppLayout({
  children,
  currentPath,
  onNavigate,
}: {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="pb-20">{children}</main>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          Campus Smart Ride — A Privacy-Preserving Student Ride Sharing System
        </div>
      </footer>
    </div>
  );
}
