import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TopBanner({ text }) {
  if (!text) return null;
  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}