import React, { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Loader2 } from 'lucide-react';

const OverviewTab = lazy(() => import('@/components/admin/OverviewTab'));
const MembersTab = lazy(() => import('@/components/admin/MembersTab'));
const ModerationTab = lazy(() => import('@/components/admin/ModerationTab'));
const MessagingTab = lazy(() => import('@/components/admin/MessagingTab'));
const SettingsTab = lazy(() => import('@/components/admin/SettingsTab'));
const ReviewTab = lazy(() => import('@/components/admin/ReviewTab'));
const AIScoutTab = lazy(() => import('@/components/admin/AIScoutTab'));
const BirdnetTab = lazy(() => import('@/components/admin/BirdnetTab'));

const tabs = [
  { key: 'overview', label: '📊 Overview', comp: OverviewTab },
  { key: 'members', label: '👥 Members', comp: MembersTab },
  { key: 'moderation', label: '🛡️ Moderation', comp: ModerationTab },
  { key: 'review', label: '🔍 Review', comp: ReviewTab },
  { key: 'messaging', label: '📣 Messaging', comp: MessagingTab },
  { key: 'settings', label: '⚙️ Settings', comp: SettingsTab },
  { key: 'birdnet', label: '🔊 BirdNET', comp: BirdnetTab },
  { key: 'ai', label: '🤖 AI Scout', comp: AIScoutTab },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const Active = tabs.find((t) => t.key === tab).comp;
  return (
    <div className="bio-admin min-h-screen">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2 sticky top-0 z-30">
        <Leaf className="h-5 w-5" />
        <span className="font-bold text-lg">EcoTracker Admin</span>
        <Link to="/" className="ml-auto text-sm underline opacity-90">Exit to app</Link>
      </header>
      <div className="md:hidden border-b flex overflow-x-auto bg-card">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm whitespace-nowrap ${tab === t.key ? 'border-b-2 border-primary text-primary font-medium' : 'text-muted-foreground'}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex">
        <nav className="hidden md:block w-52 shrink-0 border-r bg-card min-h-[calc(100vh-56px)] p-2 space-y-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`w-full text-left px-3 py-2 rounded text-sm ${tab === t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{t.label}</button>
          ))}
        </nav>
        <main className="flex-1 p-4 overflow-auto">
          <Suspense fallback={<div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <Active />
          </Suspense>
        </main>
      </div>
    </div>
  );
}