import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Leaf, ScanLine, ShieldCheck, Bot, MapPinned } from 'lucide-react';

const screens = [
  {
    icon: Leaf,
    title: 'Track biodiversity together',
    body: 'Capture photos and audio of wildlife around you. Every sighting contributes to a community science map of life on Earth.',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: ScanLine,
    title: 'Dual-AI identification',
    body: 'Our location-tuned vision and bioacoustic AI identifies species in seconds, flags invasives, and rewards your contributions with points and badges.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy first',
    body: 'Exact coordinates are fuzzed to ~1 km before anything is shared. Toggle private-property mode to hide location entirely.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: Bot,
    title: 'Robot & community powered',
    body: 'Autonomous field robots and fellow naturalists feed the same live map you explore — zero footprint, maximum discovery.',
    color: 'bg-amber-100 text-amber-700',
  },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const last = i === screens.length - 1;
  const s = screens[i];
  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex justify-end w-full">
        <Button variant="ghost" onClick={() => navigate('/')}>Skip</Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto gap-6">
        <div className={`h-24 w-24 rounded-full flex items-center justify-center ${s.color}`}>
          <s.icon className="h-12 w-12" />
        </div>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{s.title}</h1>
          <p className="text-muted-foreground">{s.body}</p>
        </div>
        <div className="flex gap-2">
          {screens.map((_, idx) => (
            <span key={idx} className={`h-2 rounded-full transition-all ${idx === i ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
          ))}
        </div>
      </div>
      <div className="w-full max-w-md mx-auto flex gap-3">
        {i > 0 && <Button variant="outline" className="flex-1" onClick={() => setI(i - 1)}>Back</Button>}
        {last ? (
          <Button className="flex-1" onClick={() => navigate('/')}>Start exploring</Button>
        ) : (
          <Button className="flex-1" onClick={() => setI(i + 1)}>Next</Button>
        )}
      </div>
    </div>
  );
}