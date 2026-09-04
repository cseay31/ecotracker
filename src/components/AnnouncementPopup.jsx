import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function AnnouncementPopup({ announcement, onClose }) {
  if (!announcement) return null;
  const urgent = announcement.priority === 'urgent';
  return (
    <Dialog open={!!announcement} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={urgent ? 'border-red-500' : ''}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {urgent && <span className="text-red-600">🔴</span>}
            {announcement.title}
          </DialogTitle>
          <DialogDescription>{announcement.body}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}