import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function AdminRoute({ children }) {
  const [state, setState] = useState('loading');
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    base44.auth.me()
      .then((u) => {
        if (!alive) return;
        if (u && u.role === 'admin') setState('ok');
        else setState('denied');
      })
      .catch(() => alive && setState('denied'));
    return () => { alive = false; };
  }, []);

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }
  if (state === 'denied') {
    return <Navigate to="/" replace state={{ denied: true }} />;
  }
  return children;
}