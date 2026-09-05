import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await base44.functions.invoke('submitContactMessage', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bio-app min-h-screen">
      <div className="bio-shell flex flex-col min-h-screen">
        <header className="bio-header sticky top-3 z-30 mx-3 mt-3">
          <span className="bio-leaf"><Leaf className="h-5 w-5" /></span>
          <span className="bio-brand">EcoTracker</span>
          <nav className="ml-auto flex items-center gap-4 text-sm text-teal-100">
            <Link to="/about" className="hover:text-emerald-300 transition-colors">About</Link>
            <Link to="/contact" className="font-semibold text-emerald-300">Contact</Link>
            <Link to="/status" className="hover:text-emerald-300 transition-colors">Status</Link>
            <Link to="/" className="bio-contact rounded-md px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
              Open App <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </header>

        <main className="flex-1 px-4 py-8 max-w-xl mx-auto w-full">
          <article className="bio-overlay rounded-2xl p-6 sm:p-8 space-y-5">
            <h1 className="text-3xl font-extrabold tracking-tight text-teal-50">Contact Us</h1>
            <p className="text-teal-100/80 text-sm leading-relaxed">
              Have a question, found a bug, or want to partner with EcoTracker? Send us a message
              and our team will get back to you. If you're a member, you can also reach admins
              directly from the in-app contact option.
            </p>

            {sent ? (
              <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-5 space-y-3 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-300 mx-auto" />
                <div className="font-semibold text-teal-50">Message sent — thank you!</div>
                <p className="text-sm text-teal-100/80">We've received your message and will reply soon.</p>
                <Button variant="outline" onClick={() => setSent(false)} className="mt-1">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-teal-100">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="bio-input mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-teal-100">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="bio-input mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-teal-100">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help?"
                    className="bio-input mt-1"
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" disabled={submitting || !form.message.trim()} className="bio-contact w-full">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send message</>
                  )}
                </Button>
              </form>
            )}
          </article>
        </main>

        <footer className="bio-nav py-3 px-4 text-center text-xs text-teal-200/70">
          © {new Date().getFullYear()} EcoTracker ·
          <Link to="/about" className="mx-1 hover:text-emerald-300">About</Link>·
          <Link to="/contact" className="mx-1 hover:text-emerald-300">Contact</Link>·
          <Link to="/status" className="ml-1 hover:text-emerald-300">Status</Link>
        </footer>
      </div>
    </div>
  );
}