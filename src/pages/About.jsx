import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Activity, ArrowRight } from 'lucide-react';

export default function About() {
  return (
    <div className="bio-app min-h-screen">
      <div className="bio-shell flex flex-col min-h-screen">
        <header className="bio-header sticky top-3 z-30 mx-3 mt-3">
          <span className="bio-leaf"><Leaf className="h-5 w-5" /></span>
          <span className="bio-brand">EcoTracker</span>
          <nav className="ml-auto flex items-center gap-4 text-sm text-teal-100">
            <Link to="/about" className="font-semibold text-emerald-300">About</Link>
            <Link to="/contact" className="hover:text-emerald-300 transition-colors">Contact</Link>
            <Link to="/status" className="hover:text-emerald-300 transition-colors">Status</Link>
            <Link to="/" className="bio-contact rounded-md px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5">
              Open App <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </header>

        <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
          <article className="bio-overlay rounded-2xl p-6 sm:p-8 space-y-5">
            <h1 className="text-3xl font-extrabold tracking-tight text-teal-50">About EcoTracker</h1>
            <p className="text-teal-100/90 leading-relaxed">
              EcoTracker is a biodiversity monitoring platform that helps citizen scientists,
              researchers, conservationists, land managers, and educators document and understand
              wildlife in their communities. Using multi-modal identification, EcoTracker can
              recognize plants and animals from a single photo, or identify birds and amphibians
              from an audio recording — combining public iNaturalist computer-vision data with a
              built-in secondary model and optional self-hosted bioacoustics analysis.
            </p>
            <p className="text-teal-100/90 leading-relaxed">
              Every observation is plotted on an interactive community map, where sensitive
              location data is automatically fuzzed to protect endangered species and private
              land, while invasive-species sightings are flagged against regional watchlists so
              local authorities can respond quickly. Members earn recognition for contributing
              research-grade observations, and administrators use an enterprise-grade dashboard
              to moderate content, manage members, publish announcements, and audit every action.
            </p>
            <p className="text-teal-100/90 leading-relaxed">
              EcoTracker is built and maintained by the EcoTracker team as an open,
              privacy-conscious tool for environmental monitoring. Our mission is to make
              biodiversity data accessible, actionable, and safe — empowering everyone from
              backyard naturalists to professional ecologists to protect the ecosystems they
              care about.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/contact" className="bio-contact rounded-md px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact the team
              </Link>
              <Link to="/status" className="bio-overlay rounded-md px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                <Activity className="h-4 w-4" /> System status
              </Link>
            </div>
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