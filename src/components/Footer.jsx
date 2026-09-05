import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bio-nav mt-6 py-3 px-4 text-center text-xs text-teal-200/70">
      <span className="inline-flex items-center gap-1.5">
        <Leaf className="h-3.5 w-3.5" /> © {new Date().getFullYear()} EcoTracker ·
      </span>
      <Link to="/about" className="mx-1 hover:text-emerald-300">About</Link>·
      <Link to="/contact" className="mx-1 hover:text-emerald-300">Contact</Link>·
      <Link to="/status" className="mx-1 hover:text-emerald-300">Status</Link>·
      <Link to="/connect" className="ml-1 hover:text-emerald-300">Connect</Link>
    </footer>
  );
}