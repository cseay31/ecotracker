import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ContactAdminDialog({ open, onOpenChange }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.AdminInquiry.create({
        user_id: user?.id || '',
        user_message: message.trim(),
        status: 'pending',
      });
      toast.success('Your message has been sent to the admin team.');
      setMessage('');
      onOpenChange(false);
    } catch (e) {
      toast.error('Could not send message: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Admin</DialogTitle>
          <DialogDescription>Send a question or report to the EcoTracker admin team. You'll receive a reply by email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="msg">Your message</Label>
          <Textarea id="msg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or question..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || !message.trim()}>{loading ? 'Sending...' : 'Send'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}