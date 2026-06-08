import React, { useState } from 'react';
import { 
  Plus, Check, Sparkles, Mail, Send, ShieldAlert, FileText, 
  HelpCircle, Star, Layers, CheckCircle2, SlidersHorizontal, LockKeyhole
} from 'lucide-react';
import { generateRandomHex, getContrastColor } from '../utils';
import { SiteConfig } from '../types';
import DesignUtilities from './DesignUtilities';
import FAQSection from './FAQSection';

interface LegalContactProps {
  onAddSubittedPalette: (title: string, colors: string[], tags: string[]) => void;
  onAddLead: (email: string, type: 'newsletter' | 'feature_request', message?: string) => void;
  onSubmitSuccess?: () => void;
  compactSubmissionOnly?: boolean;
  siteConfig?: SiteConfig;
}

export default function LegalContact({
  onAddSubittedPalette,
  onAddLead,
  onSubmitSuccess,
  compactSubmissionOnly = false,
  siteConfig,
}: LegalContactProps) {
  // Palette Submission states
  const [paletteTitle, setPaletteTitle] = useState('');
  const [colors, setColors] = useState<string[]>([
    '#00FFD1', '#f10b7f', '#241244', '#ffd700', '#fbfbfb'
  ]);
  const [tagInput, setTagInput] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [paletteSuccess, setPaletteSuccess] = useState(false);

  // Newsletter states
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState(false);

  // Feature request states
  const [requestEmail, setRequestEmail] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Generate random values inside color picker form for fun
  const handleRandomizeFormColors = () => {
    setColors(colors.map(() => generateRandomHex()));
  };

  const handlePaletteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paletteTitle.trim()) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddSubittedPalette(
      paletteTitle.trim(),
      colors,
      parsedTags.length > 0 ? parsedTags : ['Vibrant', 'User Submission']
    );

    // reset states
    setPaletteTitle('');
    setTagInput('');
    setSubmittedBy('');
    setPaletteSuccess(true);
    
    setTimeout(() => {
      setPaletteSuccess(false);
      if (onSubmitSuccess) onSubmitSuccess();
    }, 2800);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    onAddLead(newsletterEmail.trim(), 'newsletter');
    setNewsletterEmail('');
    setNewsSuccess(true);
    setTimeout(() => setNewsSuccess(false), 3000);
  };

  const handleFeatureRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail.trim()) return;

    onAddLead(requestEmail.trim(), 'feature_request', requestDetails.trim());
    setRequestEmail('');
    setRequestDetails('');
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 3000);
  };

  // If the component is invoked in modal context for quick submission drawer:
  if (compactSubmissionOnly) {
    return (
      <form onSubmit={handlePaletteSubmit} className="space-y-4" id="compact-submit-form">
        <div className="space-y-1">
          <label className="block text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">Palette name</label>
          <input
            type="text"
            required
            id="modal-palette-title"
            value={paletteTitle}
            onChange={(e) => setPaletteTitle(e.target.value)}
            placeholder="e.g. Kyoto Sunset Shimmer"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500/50"
          />
        </div>

        {/* 5 Colors Pickers Horizontal Segment */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">Injected Colors</label>
            <button
              type="button"
              onClick={handleRandomizeFormColors}
              className="text-[10px] text-[#00FFD1] hover:text-white font-bold transition-colors cursor-pointer"
            >
              🎲 Random Seed Colors
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2" id="form-pickers-row">
            {colors.map((hex, index) => {
              const contrast = getContrastColor(hex);
              return (
                <div key={index} className="flex flex-col items-center gap-1.5 bg-white/10 p-2 rounded-lg border border-white/10 relative group">
                  <input
                    type="color"
                    id={`form-picker-input-${index}`}
                    value={hex}
                    onChange={(e) => {
                      const updated = [...colors];
                      updated[index] = e.target.value;
                      setColors(updated);
                    }}
                    className="h-10 w-full rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-[9px] uppercase tracking-tighter text-slate-350">{hex}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold">Category Tags (Comma Separated)</label>
          <input
            type="text"
            id="modal-palette-tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Neon, Cyberpunk, Coral, Warm"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-pink-500/50"
          />
        </div>

        <button
          type="submit"
          id="modal-submit-cta"
          className="w-full text-center py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all mt-4"
        >
          Publish Palette Stream CC0
        </button>

        {paletteSuccess && (
          <div className="rounded-lg p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-bounce mt-3">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Success! Published to main live feed stream.</span>
          </div>
        )}
      </form>
    );
  }

  // Else render full design Core guidelines & feedback layouts tab
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12" id="docs-contact-page">
      
      {/* Design guidelines and core rules */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="design-guidelines-section">
        
        {/* Left block: CC0 core guidelines (Col span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileText className="h-7 w-7 text-[#00FFD1]" />
              <span>Design Core & Licensing Guidelines</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium animate-pulse">
              flatpalette operates as an open CC0 public design platform. Read our core design principles:
            </p>
          </div>

          <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed" id="guidelines-accordion">
            
            <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl space-y-2 hover:border-[#00FFD1]/30 transition-colors">
              <h4 className="font-bold text-white text-base">1. Intellectual Property & CC0 Release</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All palettes generated, locked, or submitted on flatpalette are automatically placed in the Public Domain under Creative Commons CC0. No author credit is legally required, although attributing flatpalette is appreciated by the digital architecture community.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl space-y-2 hover:border-[#00FFD1]/30 transition-colors">
              <h4 className="font-bold text-white text-base">2. Typography-First Visual Harmony</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Always paired with "Inter" for UI and "JetBrains Mono" / "Space Grotesk" display elements. Ensure that when injecting color systems, background components maintain relative luminance scores exceeding 4.5:1 against focal typography blocks.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl space-y-2 hover:border-[#00FFD1]/30 transition-colors">
              <h4 className="font-bold text-white text-base">3. Color Strip Micro-Interactions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interconnected horizontal blocks use strict width percentages with dynamic flex-groove expanding state configurations on cursor overlaps, mimicking tactile, springy, hardware physical panels.
              </p>
            </div>

          </div>
        </div>

        {/* Right block: Feature contact forms (Col span 5) */}
        <div className="lg:col-span-5 space-y-6" id="feature-request-form">
          
          <div className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="h-5 w-5 text-pink-500" />
              <h3 className="font-bold text-slate-100 text-base">Request Feature / API access</h3>
            </div>

            <form onSubmit={handleFeatureRequestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Your Email Coordinates</label>
                <input
                  type="email"
                  required
                  id="feature-email-input"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-450 outline-none focus:border-[#00FFD1]/40 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Tell us about changes or integrations</label>
                <textarea
                  rows={4}
                  required
                  id="feature-details-input"
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  placeholder="Need a custom Figma design tokens format converter or custom hex matching parameters..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-450 outline-none focus:border-[#00FFD1]/40 transition-colors"
                />
              </div>

              <button
                type="submit"
                id="feature-request-submit-btn"
                className="w-full text-center py-2.5 bg-white/10 hover:bg-white/15 text-[#00FFD1] hover:text-white border border-white/10 text-xs font-black uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer"
              >
                Send Request Signal
              </button>

              {requestSuccess && (
                <div className="rounded-lg p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-2 animate-bounce">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Request received! Welcome to the Speed Tier dashboard feedback.</span>
                </div>
              )}
            </form>
          </div>

          {/* Core licensing badge */}
          <div className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 flex items-start gap-3">
            <LockKeyhole className="h-5 w-5 text-[#00FFD1] mt-0.5 shrink-0" />
            <div className="text-[10px] text-slate-450 leading-relaxed font-medium">
              <span className="font-bold text-white block mb-0.5 text-xs">Automated Integrity Rules</span>
              All submissions conform to our automated SEO indexer, verifying that no duplicate or highly trivial hex arrangements flood the live feed grid matrix.
            </div>
          </div>

        </div>

      </section>

      {/* Free Creative Design Utilities Integration */}
      <DesignUtilities theme="dark" siteConfig={siteConfig} />

      {/* Interactive FAQ Section */}
      <FAQSection theme="dark" siteConfig={siteConfig} />

    </div>
  );
}
