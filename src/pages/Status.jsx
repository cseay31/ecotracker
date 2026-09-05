import React from 'react';
import AppShell from '@/components/AppShell';
import { ExternalLink, Activity } from 'lucide-react';

const STATUS_URL = 'https://stats.uptimerobot.com/Q37jD66o79';

export default function Status() {
  return (
    <AppShell title="System Status">
      <div className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
        <div className="bio-overlay rounded-2xl p-4 flex items-center gap-3">
          <span className="h-9 w-9 rounded-full grid place-items-center bg-emerald-500/20 text-emerald-300">
            <Activity className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="font-semibold text-teal-50">EcoTracker uptime</div>
            <div className="text-xs text-teal-200/70">Live status powered by UptimeRobot</div>
          </div>
          <a
            href={STATUS_URL}
            target="_blank"
            rel="noreferrer"
            className="bio-contact rounded-md px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            Open <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="bio-overlay rounded-2xl p-8 text-center space-y-5">
          <p className="text-teal-100/90 max-w-md mx-auto">
            UptimeRobot's status pages can't be embedded directly. Open the live
            status dashboard to view uptime history and incidents for EcoTracker.
          </p>
          <a
            href={STATUS_URL}
            target="_blank"
            rel="noreferrer"
            className="bio-contact rounded-md px-6 py-3 text-sm font-semibold inline-flex items-center gap-2"
          >
            Open UptimeRobot status <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </AppShell>
  );
}