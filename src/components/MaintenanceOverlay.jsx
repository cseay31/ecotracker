import React from 'react';
import { Wrench } from 'lucide-react';

export default function MaintenanceOverlay({ settings }) {
  if (!settings || !settings.maintenance_mode) return null;
  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <Wrench className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">EcoTracker is under maintenance</h2>
        <p className="text-muted-foreground">{settings.maintenance_message || 'We\'ll be back shortly. Thanks for your patience.'}</p>
      </div>
    </div>
  );
}