import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="bio-app">
      <div className="bio-shell max-w-3xl mx-auto px-4 py-8 text-teal-50">
        <Link to="/map" className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200 mb-5">
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
        <h1 className="bio-section-title flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-emerald-300" /> Privacy Policy
        </h1>
        <p className="text-xs text-teal-300/70 mb-6">Last updated: September 2026 · Version 1.0</p>

        <div className="space-y-5 text-sm leading-relaxed text-teal-100/90">
          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">1. Our promise: no tracking</h2>
            <p>
              EcoTracker is built on a strict <strong>no-tracing</strong> principle. We do <strong>not</strong> track you
              across pages, we use <strong>no advertising trackers</strong>, <strong>no third-party analytics cookies</strong>,
              and <strong>no behavioral profiling</strong>. We do not sell, rent, or trade your data with anyone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">2. What we collect — and don't</h2>
            <p>
              The only personal data we hold is your email address and the observations you choose to submit. We never
              collect your real-time location in the background; location is only used at the moment you submit an
              observation, and only to label that record.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">3. Location privacy</h2>
            <p>
              Your exact coordinates are <strong>never shown publicly</strong>. Every observation's location is
              fuzzed to roughly a 1&nbsp;km grid before it appears on the public map. Only you and verified site
              administrators can view the precise coordinates of your own records. You may also mark an observation
              as a private property, in which case no public coordinates are published at all.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">4. Identification processing</h2>
            <p>
              Photos and audio you submit are processed solely to identify the species. They are sent to open,
              key-free identification services (iNaturalist Computer Vision and a self-hosted BirdNET analyzer) for
              the identification step only, then stored in your EcoTracker observation record. We do not use your
              media to train models or build profiles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">5. Age confirmation — stored as a boolean only</h2>
            <p>
              To comply with child-safety rules, we ask for your date of birth. <strong>Your birthdate is processed
              locally in your browser and is never stored or sent to our servers.</strong> The only thing saved on
              your account is a single boolean (<code>true</code> / <code>false</code>) confirming you are over 13.
              Even EcoTracker cannot see your actual birthdate or age — only that boolean.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">6. Your data, your control</h2>
            <p>
              You can edit or delete any of your observations at any time. Deleting a record removes it from our
              database. You may request deletion of your account and associated data by contacting an administrator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">7. Data retention</h2>
            <p>
              We keep your observations for as long as your account is active. Once you delete a record or your
              account, the associated data is removed from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">8. Contact</h2>
            <p>
              Questions about your privacy? Use the in-app <Link to="/contact" className="underline text-emerald-300">Contact</Link> page
              and an administrator will respond.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}