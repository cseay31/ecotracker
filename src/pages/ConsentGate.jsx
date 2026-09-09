import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Leaf, Loader2, ShieldCheck, FileText, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function computeAge(dateStr) {
  if (!dateStr) return null;
  const b = new Date(dateStr);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export default function ConsentGate() {
  const { checkUserAuth } = useAuth();
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [birthdate, setBirthdate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const age = computeAge(birthdate);
  const ageValid = age != null && age >= 13;
  const canSubmit = agreePrivacy && agreeTos && ageValid && !submitting;

  const handleAccept = async () => {
    setError('');
    setSubmitting(true);
    try {
      await base44.auth.updateMe({
        privacy_accepted: true,
        tos_accepted: true,
        age_confirmed_over_13: true,
        consent_version: '1.0',
      });
      await checkUserAuth();
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/map';
      window.location.href = returnTo;
    } catch (e) {
      setError(e?.message || 'Could not save your consent. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="bio-app min-h-screen grid place-items-center px-4 py-10">
      <div className="bio-shell w-full max-w-xl">
        <div className="bio-overlay rounded-3xl p-7 sm:p-9 border border-emerald-400/40 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="bio-leaf"><Leaf className="h-5 w-5" /></div>
            <span className="bio-brand">EcoTracker</span>
          </div>
          <h1 className="text-2xl font-extrabold text-teal-50 mt-3">One-time consent</h1>
          <p className="text-sm text-teal-200/80 mt-1">
            Before you continue, please review and accept our updated policies. We've kept them short and human-readable.
          </p>

          <div className="mt-5 space-y-3">
            <PolicyRow
              icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
              title="Privacy Policy"
              blurb="No tracking, no selling data, locations fuzzed to ~1 km before going public."
              to="/privacy"
              checked={agreePrivacy}
              onChange={setAgreePrivacy}
            />
            <PolicyRow
              icon={<FileText className="h-5 w-5 text-emerald-300" />}
              title="Terms of Service"
              blurb="Your responsibilities, acceptable use, content license, and liability terms."
              to="/terms"
              checked={agreeTos}
              onChange={setAgreeTos}
            />
          </div>

          <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4">
            <label className="block text-sm font-semibold text-teal-50" htmlFor="birthdate">
              Date of birth
            </label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="bio-input mt-2 max-w-xs"
              max={new Date().toISOString().slice(0, 10)}
            />
            {birthdate && !ageValid && (
              <p className="text-sm text-pink-300 mt-2">
                {age != null ? 'You must be 13 or older to use EcoTracker.' : 'Please enter a valid date of birth.'}
              </p>
            )}
            <span className="flex items-start gap-1 mt-3 text-xs text-teal-300/80">
              <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                This is processed <strong>locally in your browser</strong>. Your birthdate is <strong>never stored or
                sent to our servers</strong> — we only check whether you're 13+ and save a single yes/no boolean on your
                account. Not even EcoTracker can see your actual birthdate.
              </span>
            </span>
          </div>

          {error && <p className="text-sm text-pink-300 mt-4">{error}</p>}

          <Button
            onClick={handleAccept}
            disabled={!canSubmit}
            className="bio-contact w-full mt-6 h-11 text-base font-semibold"
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Accept & continue'}
          </Button>
          <p className="text-xs text-teal-300/60 text-center mt-3">
            You must accept both policies and confirm you are 13 or older to use EcoTracker.
          </p>
        </div>
      </div>
    </div>
  );
}

function PolicyRow({ icon, title, blurb, to, checked, onChange }) {
  return (
    <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/5 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5">{icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-teal-50">{title}</span>
            <Link to={to} className="text-xs text-emerald-300 hover:text-emerald-200 underline">Read</Link>
          </div>
          <p className="text-xs text-teal-200/70 mt-0.5">{blurb}</p>
          <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
            <span className="text-sm text-teal-100">I agree to the {title}</span>
          </label>
        </div>
      </div>
    </div>
  );
}