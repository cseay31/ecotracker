import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logAudit } from '@/lib/adminAudit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function AIScoutTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI Scout assistant. Ask me to summarize sign-ups, query member data, or draft an announcement. I'll propose actions — you approve before anything changes." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [executing, setExecuting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    setPendingAction(null);
    try {
      const res = await base44.functions.invoke('aiScout', { prompt: q });
      const data = res.data || {};
      setMessages((m) => [...m, { role: 'assistant', text: data.answer || '(no response)' }]);
      if (data.proposed_action && data.proposed_action.type) setPendingAction(data.proposed_action);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Error: ' + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function approveAction() {
    if (!pendingAction) return;
    setExecuting(true);
    try {
      if (pendingAction.type === 'announcement') {
        const details = pendingAction.details || '';
        await base44.entities.Announcement.create({ title: pendingAction.label || 'Announcement', body: details, priority: 'normal', is_active: true, show_as_popup: false });
        await logAudit(`AI Scout created announcement: ${pendingAction.label}`, 'Announcement');
        toast.success('Announcement created.');
      } else if (pendingAction.type === 'suspend_user') {
        toast.message('User suspension requires the Members tab for confirmation.');
      } else {
        toast.message('This action type is not auto-executable.');
      }
      setPendingAction(null);
      setMessages((m) => [...m, { role: 'assistant', text: '✅ Action executed.' }]);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-1 font-semibold"><Bot className="h-5 w-5" /> AI Scout Assistant</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3"><ShieldCheck className="h-4 w-4 text-green-600" /> Read-only — proposes actions, you approve before execution.</div>
        <div ref={scrollRef} className="h-80 overflow-y-auto space-y-3 border rounded-lg p-3 bg-muted/30">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>{m.text}</div>
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground italic">AI Scout is thinking...</div>}
        </div>

        {pendingAction && (
          <div className="mt-3 border-2 border-amber-400 rounded-lg p-3 bg-amber-50">
            <div className="text-sm font-medium">Proposed action: {pendingAction.label}</div>
            <div className="text-xs text-muted-foreground mb-2">{pendingAction.details || `Type: ${pendingAction.type}`}</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={approveAction} disabled={executing}>{executing ? 'Executing...' : 'Approve & Execute'}</Button>
              <Button size="sm" variant="outline" onClick={() => setPendingAction(null)}>Dismiss</Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Input placeholder="Ask about members, draft an announcement..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
          <Button onClick={send} disabled={loading || !input.trim()}>Send</Button>
        </div>
      </Card>
    </div>
  );
}