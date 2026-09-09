import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="bio-app">
      <div className="bio-shell max-w-3xl mx-auto px-4 py-8 text-teal-50">
        <Link to="/map" className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200 mb-5">
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
        <h1 className="bio-section-title flex items-center gap-2">
          <FileText className="h-7 w-7 text-emerald-300" /> Terms of Service
        </h1>
        <p className="text-xs text-teal-300/70 mb-6">Last updated: September 2026 · Version 1.0</p>

        <div className="space-y-5 text-sm leading-relaxed text-teal-100/90">
          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">1. Acceptance of terms</h2>
            <p>
              By creating an account or using EcoTracker, you agree to these Terms and our{' '}
              <Link to="/privacy" className="underline text-emerald-300">Privacy Policy</Link>. If you do not agree, do
              not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">2. Eligibility & age</h2>
            <p>
              You must be at least 13 years old to use EcoTracker. During onboarding you confirm your age with a single
              checkbox; no birthdate is collected (see the Privacy Policy). If we learn an account is held by someone
              under 13, it will be terminated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">3. Your account</h2>
            <p>
              You are responsible for keeping your login credentials secure and for all activity under your account.
              Notify an administrator immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">4. Your content & observations</h2>
            <p>
              You retain ownership of the observations (photos, audio, notes) you submit. By submitting, you grant
              EcoTracker a non-exclusive, royalty-free license to display them on the community map and within the
              app for conservation and educational purposes. You are responsible for the accuracy and legality of
              what you post.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">5. Acceptable use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit false, misleading, or plagiarized observations.</li>
              <li>Harass, threaten, or impersonate other users.</li>
              <li>Use the platform to plan or encourage harm to wildlife or protected habitats.</li>
              <li>Post illegal, hateful, or sexual content, or malware.</li>
              <li>Attempt to disrupt, overload, or reverse-engineer the service.</li>
              <li>Scrape or bulk-download data in violation of these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">6. Invasive-species data</h2>
            <p>
              Invasive-species information is provided for awareness and responsible management only. You agree not to
              use it to harm, illegally transport, or spread organisms in violation of local law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">7. Identification accuracy</h2>
            <p>
              Species identifications are produced by automated models and may be wrong. EcoTracker provides
              identifications "as is" with no guarantee of accuracy. Always consult a qualified expert for decisions
              that matter.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">8. Disclaimers & limitation of liability</h2>
            <p>
              The service is provided "as is" and "as available" without warranties of any kind. To the fullest extent
              permitted by law, EcoTracker and its administrators are not liable for any indirect, incidental, or
              consequential damages arising from your use of the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">9. Moderation</h2>
            <p>
              Administrators may review, flag, verify, or remove observations and may suspend accounts that violate
              these Terms. Significant actions are recorded in an internal audit log.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">10. Termination</h2>
            <p>
              You may delete your account at any time. We may suspend or terminate access if you breach these Terms or
              for any operational reason, with notice where appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">11. Changes to these Terms</h2>
            <p>
              We may update these Terms. When we do, existing users will be asked to accept the new version before
              continuing. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-teal-50 mb-1">12. Contact</h2>
            <p>
              Questions about these Terms? Use the in-app{' '}
              <Link to="/contact" className="underline text-emerald-300">Contact</Link> page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}