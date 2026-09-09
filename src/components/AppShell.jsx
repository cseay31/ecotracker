import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, ScanLine, User, MapPin, Shield, Activity, MessageSquare, Github } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Footer from '@/components/Footer';

export default function AppShell({ title, children }) {
  const loc = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me()
      .then((u) => setIsAdmin(u?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, []);
  const nav = [
    { to: '/map', label: 'Map', icon: MapPin, active: loc.pathname === '/map' },
    { to: '/scanner', label: 'Scan', icon: ScanLine, active: loc.pathname === '/scanner' },
    { to: '/forums', label: 'Forum', icon: MessageSquare, active: loc.pathname === '/forums' },
    { to: '/open-source', label: 'Open Source', icon: Github, active: loc.pathname === '/open-source' },
    { to: '/profile', label: 'Profile', icon: User, active: loc.pathname === '/profile' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield, active: loc.pathname === '/admin' }] : []),
  ];
  return (
    <div className="bio-app flex flex-col min-h-screen">
      <div className="bio-shell flex flex-col flex-1">
        <header className="bio-header sticky top-3 z-30 mx-3 mt-3">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="bio-leaf"><Leaf className="h-5 w-5" /></span>
            <span className="bio-brand">EcoTracker</span>
          </Link>
          <Link
            to="/open-source"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
            title="EcoTracker is open source under the MIT License"
          >
            <Github className="h-3.5 w-3.5" /> MIT · Open Source
          </Link>
          {title && <span className="ml-1 text-sm text-teal-200/80 hidden sm:inline">{title}</span>}
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
        <main className="flex-1 flex flex-col">{children}<Footer /></main>
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