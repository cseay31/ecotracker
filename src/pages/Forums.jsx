import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Forums() {
  return (
    <AppShell title="Forums">
      <div className="px-4 pt-6 pb-10 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="bio-section-title flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-emerald-300" />
              Community Forums
            </h1>
            <p className="text-sm text-teal-200/80">
              Discuss discoveries, identification tips, and invasive-species sightings with the EcoTracker community.
            </p>
          </div>
          <Button className="bio-contact shrink-0">
            <Plus className="h-4 w-4" /> New discussion
          </Button>
        </div>

        <Card className="bio-overlay p-10 text-center">
          <div className="mx-auto mb-4 grid place-items-center h-14 w-14 rounded-full border border-emerald-400/40 bg-emerald-500/10">
            <MessageSquare className="h-7 w-7 text-emerald-300" />
          </div>
          <h2 className="text-lg font-semibold text-teal-50">No discussions yet</h2>
          <p className="text-sm text-teal-200/70 mt-1 max-w-md mx-auto">
            Be the first to start a conversation. Share a sighting, ask for an ID, or post invasive-species tips for your region.
          </p>
          <Button className="bio-contact mt-5">
            <Plus className="h-4 w-4" /> Start the first discussion
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}