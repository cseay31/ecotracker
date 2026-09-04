import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, ScanLine, User, MapPin } from 'lucide-react';

export default function AppShell({ title, children }) {
  const loc = useLocation();
  const nav = [
    { to: '/', label: 'Map', icon: MapPin, active: loc.pathname === '/' },
    { to: '/scanner', label: 'Scan', icon: ScanLine, active: loc.pathname === '/scanner' },
    { to: '/profile', label: 'Profile', icon: User, active: loc.pathname === '/profile' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 shadow-sm">
        <Leaf className="h-5 w-5" />
        <span className="font-bold text-lg">EcoTracker</span>
        {title && <span className="ml-auto text-sm opacity-80">{title}</span>}
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
      <nav className="sticky bottom-0 z-30 bg-card border-t flex">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className={`flex-1 flex flex-col items-center py-2 text-xs ${n.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            <n.icon className="h-5 w-5 mb-0.5" />
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}