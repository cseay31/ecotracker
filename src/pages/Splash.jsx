import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ScanLine, MapPin, ShieldAlert, Mic, Camera, ArrowRight, Activity } from 'lucide-react';
import Footer from '@/components/Footer';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { motion } from 'framer-motion';
import Reveal from '@/components/motion/Reveal';

const MotionLink = motion.create(Link);
const tap = { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 } };

export default function Splash() {
  const { flags } = useFeatureFlags();
  const audioEnabled = flags.audio_enabled !== false;
  return (
    <div className="bio-app flex flex-col min-h-screen">
      <div className="bio-shell flex flex-col flex-1">
        {/* Header */}
        <header className="bio-header sticky top-3 z-30 mx-3 mt-3">
          <span className="bio-leaf"><Leaf className="h-5 w-5" /></span>
          <span className="bio-brand">EcoTracker</span>
          <Link to="/login" className="ml-auto text-sm font-semibold text-teal-100 hover:text-emerald-300 transition-colors">
            Sign in
          </Link>
          <span className="bio-dot" />
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-5">
              <motion.span animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.5 }}>
                <Activity className="h-4 w-4" />
              </motion.span> Biodiversity intelligence
            </motion.div>
            <motion.h1 variants={item} className="text-4xl sm:text-5xl font-black tracking-tight text-teal-50 leading-tight">
              Track wildlife with <span className="text-emerald-400">AI vision{audioEnabled ? ' & sound' : ''}</span>
            </motion.h1>
            <motion.p variants={item} className="mt-5 text-base sm:text-lg text-teal-200/80 leading-relaxed">Identify species from a photo{audioEnabled ? ' or recording' : ''}, map observations across the wild, and catch invasive threats early — all in one open source, community platform.


            </motion.p>
            <motion.div variants={item} className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <MotionLink
                {...tap}
                to="/map"
                className="bio-contact inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold no-underline">
                
                <MapPin className="h-5 w-5" /> Explore the map
              </MotionLink>
              <MotionLink
                {...tap}
                to="/scanner"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold border border-teal-400 text-teal-100 hover:bg-teal-500/15 transition-colors no-underline">
                
                <ScanLine className="h-5 w-5" /> Start scanning{' '}
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </MotionLink>
            </motion.div>
            <motion.p variants={item} className="mt-4 text-xs text-teal-300/60">
              The map is open to everyone. Scanning &amp; your profile need a free account.
            </motion.p>
          </motion.div>
        </section>

        {/* Feature cards */}
        <section className="px-4 pb-12 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Feature icon={Camera} title="AI photo ID" body="Snap a plant or animal and our vision model names the species with a confidence score." />
            {audioEnabled && <Feature icon={Mic} title="Bioacoustic ID" body="Record birdsong and a BirdNET-powered engine identifies the call — no key required." />}
            <Feature icon={MapPin} title="Community map" body="Browse observations worldwide on an interactive map, layered with iNaturalist data." />
            <Feature icon={ShieldAlert} title="Invasive alerts" body="Automatic checks flag introduced and watchlisted species so threats get reported fast." />
          </div>
        </section>

        <Footer />
      </div>
    </div>);

}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function Feature({ icon: Icon, title, body }) {
  return (
    <Reveal>
      <motion.div
        className="bio-overlay rounded-2xl p-5 h-full"
        whileHover={{ y: -4, boxShadow: '0 0 26px rgba(16,185,129,0.45)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-300 grid place-items-center mb-3"
          whileHover={{ rotate: 8, scale: 1.1 }}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
        <div className="font-bold text-teal-50">{title}</div>
        <p className="text-sm text-teal-200/75 mt-1 leading-relaxed">{body}</p>
      </motion.div>
    </Reveal>
  );
}