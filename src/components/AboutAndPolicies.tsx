import React from 'react';
import { ShieldCheck, Info, FileText, CheckCircle2, Award, Heart, Sparkles, Layers, Sliders, Laptop, Globe } from 'lucide-react';
import { SiteConfig } from '../types';

interface AboutAndPoliciesProps {
  view: 'about' | 'privacy' | 'terms';
  siteConfig: SiteConfig;
  setActiveTab: (tab: string) => void;
}

export default function AboutAndPolicies({ view, siteConfig, setActiveTab }: AboutAndPoliciesProps) {
  const accentColor = siteConfig.primaryNeonAccent || '#00FFD1';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="about-policies-container">
      
      {/* Page Header (Dual Tone display header) */}
      <div className="border-b border-white/5 pb-6 text-center sm:text-left">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 mb-3 text-[#00FFD1]" style={{ color: accentColor }}>
          {view === 'about' && <Info className="h-6 w-6" />}
          {view === 'privacy' && <ShieldCheck className="h-6 w-6" />}
          {view === 'terms' && <FileText className="h-6 w-6" />}
        </div>
        
        <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none mb-3">
          {view === 'about' && (
            <span>About <span className="text-[#00FFD1]" style={{ color: accentColor }}>flatpalette</span></span>
          )}
          {view === 'privacy' && (
            <span>Privacy <span className="text-[#00FFD1]" style={{ color: accentColor }}>Policy</span></span>
          )}
          {view === 'terms' && (
            <span>Terms of <span className="text-[#00FFD1]" style={{ color: accentColor }}>Service</span></span>
          )}
        </h1>
        <p className="text-slate-400 text-xs sm:text-base max-w-2xl font-medium">
          {view === 'about' && "The speed tier color architecture system curated for elite screen configurations, developers, and designers."}
          {view === 'privacy' && "Clear information on how flatpalette handles localized variables, session structures, and API keys."}
          {view === 'terms' && "Standard code repository release rules, CC0 Public Domain guidelines, and generative AI parameters."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Main content area (Col span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* VIEW 1: ABOUT COMPONENT */}
          {view === 'about' && (
            <div className="space-y-8" id="about-page-view">
              {/* Mission statement */}
              <div className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md space-y-4">
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>The Mission Behind flatpalette</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  flatpalette started with a simple belief: <strong>curating color shouldn't be slow.</strong> Traditional palette interfaces are bloated, sluggish, and filled with distracting animations that get in the way of high-utility developer flows. 
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We built flatpalette as an elite design system companion. It is responsive, tactile, and engineered to assist specialists in instantly previewing hex ratios, exporting CSS variables, and registering design seeds into a CC0 public database. With state-of-the-art developer grids, integrated code models, and instant PNG rendering, it stands as the final tool you will ever need for digital canvas systems.
                </p>
              </div>

              {/* Unique Architecture features */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">System Parameters</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 hover:border-[#00FFD1]/20 transition-all">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                      <span>Zero-Latency Copier</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Copy whole palettes or separate hex elements directly in standard plain text, JSON arrays, CSS definitions, or React configurations.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 hover:border-[#00FFD1]/20 transition-all">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                      <span>Gemini-Powered Titles</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Leverage Gemini intelligence to read and analyze your custom color arrays, matching titles perfectly to design moods and hues automatically.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 hover:border-[#00FFD1]/20 transition-all">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                      <span>Tactile Harmonies</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Generate strict monochromatic, complementary, triadic, and analogous harmonies computed using color-wheel vector steps.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-white/5 bg-slate-900/40 space-y-2 hover:border-[#00FFD1]/20 transition-all">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                      <span>CC0 Open Platform</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      No licenses, no gates, no attribution rules. All published palettes are released to the CC0 Public Domain to supercharge digital creation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Developer statement */}
              <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-pink-500/5 via-[#00FFD1]/5 to-transparent space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Engineering Philosophy</h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We refuse to larp as a complex SaaS tool. flatpalette has no premium tiers, paywalls, or rate-limited features. Everything is kept stored in local coordinates and real-time database feeds, making it the perfect lightweight tab for any high-speed design workflow.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 2: PRIVACY POLICY VIEW */}
          {view === 'privacy' && (
            <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed" id="privacy-page-view">
              
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">1. Local Storage Primacy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  flatpalette processes and maintains the vast majority of user customizations, bookmarks, and seed files locally on your browser using <code>localStorage</code> coordinates. Your saved interactions do not exit your system unless you explicitly sign up, publish a palette to the public global feed, or request customized support.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">2. Public Global Submissions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If you choose to publish a custom palette to the public flatpalette feed, you authorize the database storage of your palette's metadata structure (such as the 5 hex colors, tag identifiers, date stamps, and title strings). No personal identification records or background telemetry are stored alongside this public manifest.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">3. Securing API Connections</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our integration with Gemini AI operates securely in server-side sandboxed routes (<code>/api/gemini/*</code>). Your local system coordinates are never shared with or exposed to public web trackers. The model analysis only processes raw hex parameters and style tags to provide creative, aesthetic suggestions.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">4. Analytical Logs & Cookies</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We do not use tracking cookies or aggressive cross-site advertising arrays. Minimal session states are maintained by Supabase authorization tokens strictly to persist your customized secure account.
                </p>
              </div>

              <p className="text-slate-500 text-[10px] font-mono text-center">Last Modified: May 29, 2026 • Curated for GDPR & CCPA Compliance Standards</p>
            </div>
          )}

          {/* VIEW 3: TERMS OF SERVICE VIEW */}
          {view === 'terms' && (
            <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed" id="terms-page-view">
              
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">1. Acceptance of Conditions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  By accessing flatpalette, navigating our responsive matrices, or submitting color system data records, you signify that you have fully read, understood, and agreed to be bound by these legal Terms of Service and licensing agreements.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">2. Public Domain Release (CC0 Directive)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Any color configuration published on this platform is instantly released to the public domain under the Creative Commons CC0 1.0 Universal license. You forever relinquish all copyrights or related rights to the specific arrangement of colors you upload. You guarantee that your suggested titles do not infringe upon third-party trademarks.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">3. Usage of Generative Systems</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our web interface includes AI title suggestion facilities using Gemini nodes. You agree not to manipulate or flood these API interfaces with malicious payloads or robotic scripting routines. Scraping our routes maliciously violates this architecture statement and will trigger restriction.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">4. Disclaimer of Liability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  flatpalette delivers features on an "as is" and "as available" basis without guarantees of uptime or system persistence. We are not liable for any discrepancies resulting from color rendering differences on diverse device screens or inaccuracies in our contrast ratio calculations.
                </p>
              </div>

              <p className="text-slate-500 text-[10px] font-mono text-center">Last Modified: May 29, 2026 • Public Domain System Directives</p>
            </div>
          )}

        </div>

        {/* Right Side: Quick info panel / badges (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Stats Panel */}
          <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#00FFD1] flex items-center gap-1.5" style={{ color: accentColor }}>
              <Award className="h-4 w-4" />
              <span>Platform Standard</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <span className="text-slate-400">Release Status:</span>
                <span className="text-white font-mono font-bold">CC0 Public Domain</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <span className="text-slate-400">Secure AI Processing:</span>
                <span className="text-[#00FFD1] font-mono font-bold" style={{ color: accentColor }}>Server Proxy</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-white/5">
                <span className="text-slate-400">Local Privacy:</span>
                <span className="text-slate-200 font-mono font-bold">100% Offline-First</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Iteration:</span>
                <span className="text-white font-mono font-bold">v1.8.4 Stable</span>
              </div>
            </div>
          </div>

          {/* Navigation helpers to other pages */}
          <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Navigate Coordinates</h4>
            <div className="flex flex-col gap-1.5">
              {view !== 'about' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('about')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Learn About Us</span>
                  <Info className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}
              {view !== 'privacy' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('privacy')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Privacy Policy Statement</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}
              {view !== 'terms' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('terms')}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>Terms & CC0 Agreements</span>
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                </button>
              )}

              <div className="border-t border-white/5 mt-2 pt-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="w-full text-center py-2 bg-[#00FFD1]/10 text-[#00FFD1] hover:bg-[#00FFD1]/15 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  style={{ color: accentColor }}
                >
                  Return to Color Feed
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
