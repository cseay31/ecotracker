import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, ScanLine, User, MapPin, Shield, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AppShell({ title, children }) {
  const loc = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me()
      .then((u) => setIsAdmin(u?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);
  const nav = [
    { to: '/', label: 'Map', icon: MapPin, active: loc.pathname === '/' },
    { to: '/scanner', label: 'Scan', icon: ScanLine, active: loc.pathname === '/scanner' },
    { to: '/profile', label: 'Profile', icon: User, active: loc.pathname === '/profile' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield, active: loc.pathname === '/admin' }] : []),
  ];
  return (
    <div className="bio-app flex flex-col min-h-screen">
      <div className="bio-shell flex flex-col flex-1">
        <header className="bio-header sticky top-3 z-30 mx-3 mt-3">
          <span className="bio-leaf"><Leaf className="h-5 w-5" /></span>
          <span className="bio-brand">EcoTracker</span>
          {title && <span className="ml-1 text-sm text-teal-200/80">{title}</span>}
          <Link
            to="/status"
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-teal-100 hover:text-emerald-300 transition-colors"
            title="System status"
          >
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Status</span>
          </Link>
          <span className="bio-dot" />
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <nav className="bio-nav sticky bottom-0 z-30 flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`bio-navitem ${n.active ? 'is-active' : ''}`}>
              <n.icon className="h-5 w-5" />
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}