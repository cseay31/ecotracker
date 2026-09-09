import React from 'react';
import { Github, Download, ScrollText, Heart, Code2, ExternalLink } from 'lucide-react';
import AppShell from '@/components/AppShell';

const REPO = 'https://github.com/cseay31/ecotracker';

export default function OpenSource() {
  return (
    <AppShell title="Open Source">
      <div className="max-w-3xl mx-auto w-full px-4 py-8 text-teal-50">
        <div className="bio-overlay rounded-3xl p-7 sm:p-9 border border-emerald-400/40 shadow-2xl">
          <div className="flex items-center gap-3">
            <span className="bio-leaf"><Github className="h-5 w-5" /></span>
            <h1 className="bio-section-title !mb-0">EcoTracker is now open source</h1>
          </div>
          <p className="text-sm text-teal-200/85 mt-3 leading-relaxed">
            The entire EcoTracker platform — multi-modal wildlife identification, the community map, the admin
            dashboard, and all integrations — is now freely available under the <strong>MIT License</strong>. You can
            read it, modify it, self-host it, and build on it. Conservation tooling should belong to everyone.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="bio-contact rounded-xl px-4 py-3 flex items-center gap-2 font-semibold"
            >
              <Github className="h-5 w-5" /> View on GitHub
            </a>
            <a
              href={`${REPO}/archive/refs/heads/main.zip`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl px-4 py-3 flex items-center gap-2 font-semibold border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/10 transition-colors"
            >
              <Download className="h-5 w-5" /> Download source (.zip)
            </a>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <Feature icon={<Code2 className="h-5 w-5" />} title="Fully modifiable" body="Fork it, adapt it to your region or species, and ship your own deployment." />
          <Feature icon={<Heart className="h-5 w-5" />} title="No lock-in" body="Self-host the whole stack. Your data and your community stay yours." />
          <Feature icon={<ScrollText className="h-5 w-5" />} title="MIT licensed" body="Permissive commercial and non-commercial use, no strings attached." />
        </div>

        <div className="bio-overlay rounded-3xl p-7 sm:p-9 border border-emerald-400/40 shadow-2xl mt-6">
          <h2 className="text-xl font-extrabold text-teal-50 mb-1 flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-emerald-300" /> MIT License
          </h2>
          <p className="text-xs text-teal-300/70 mb-4">A short, permissive license — do what you want, just keep the notice.</p>
          <pre className="text-xs leading-relaxed text-teal-100/90 whitespace-pre-wrap font-mono bg-emerald-950/40 rounded-xl p-4 border border-emerald-400/20">
{`MIT License

Copyright (c) 2026 EcoTracker contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
          </pre>
          <a
            href={`${REPO}/blob/main/LICENSE`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200 mt-4"
          >
            View LICENSE file on GitHub <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="bio-overlay rounded-3xl p-7 sm:p-9 border border-emerald-400/40 shadow-2xl mt-6">
          <h2 className="text-xl font-extrabold text-teal-50 mb-3">Get involved</h2>
          <ul className="text-sm text-teal-100/85 space-y-2 list-disc pl-5">
            <li>⭐ Star the repo to help others discover it.</li>
            <li>🐛 Open issues for bugs or species-identification improvements.</li>
            <li>🔀 Submit pull requests — new features, docs, and translations welcome.</li>
            <li>📡 Self-host for your own conservation group or research project.</li>
          </ul>
          <a
            href={`${REPO}/fork`}
            target="_blank"
            rel="noreferrer"
            className="bio-contact rounded-xl px-4 py-2.5 inline-flex items-center gap-2 font-semibold mt-5"
          >
            <Github className="h-4 w-4" /> Fork the repository
          </a>
        </div>
      </div>
    </AppShell>
  );
}

function Feature({ icon, title, body }) {
  return (
    <div className="bio-card !min-h-0 text-left">
      <div className="bio-leaf !w-9 !h-9 mb-2">{icon}</div>
      <div className="bio-name !text-base !my-1">{title}</div>
      <div className="bio-confidence">{body}</div>
    </div>
  );
}