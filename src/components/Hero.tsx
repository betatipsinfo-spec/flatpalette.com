import React from 'react';
import { Search, Sparkles, Flame, Percent, RefreshCw, Zap } from 'lucide-react';
import { SiteConfig } from '../types';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  siteConfig: SiteConfig;
}

export default function Hero({ searchQuery, setSearchQuery, siteConfig }: HeroProps) {
  const trendingTags = ['Cyberpunk', 'Neon', 'Pastel', 'Retro', 'Minimal', 'Nature', 'Vintage', 'Modern'];

  return (
    <section className="relative overflow-hidden bg-transparent py-14 sm:py-20" id="hero-section">
      {/* Dynamic cyberpunk grid background overlay for styling */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        
        {/* Subtle Feature Badge */}
        <div 
          className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-[#00FFD1]/20 bg-[#00FFD1]/5 px-3 py-1 text-xs font-bold text-[#00FFD1] uppercase tracking-wider mb-6 cursor-pointer hover:border-[#00FFD1]/50 transition-all"
          style={{ 
            color: siteConfig.primaryNeonAccent || '#00FFD1',
            borderColor: `${siteConfig.primaryNeonAccent || '#00FFD1'}33`,
            backgroundColor: `${siteConfig.primaryNeonAccent || '#00FFD1'}11`
          }}
          onClick={() => setSearchQuery('Cyberpunk')}
          id="hero-tagline-badge"
        >
          <Zap className="h-3.5 w-3.5 animate-bounce" />
          <span>SUPERCHARGED VELOCITY FEED</span>
        </div>

        {/* High-conversion Title Pairings with Neon Glare */}
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl">
          Color Architecture <br />
          <span 
            className="bg-gradient-to-r from-pink-500 via-purple-400 to-[#00FFD1] bg-clip-text text-transparent filter saturate-150 animate-pulse drop-shadow-[0_0_12px_rgba(0,255,209,0.5)]"
          >
            at Supercharged Speeds
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-lg text-slate-350 font-medium leading-relaxed">
          {siteConfig.siteDescription || "Instantly discover, generate, lock, and inject elite responsive color system palettes directly into your React configs, CSS styles, and packaging mockups."}
        </p>

        {/* Center Stage: Hero Predictive Search Center */}
        <div className="mx-auto mt-10 max-w-xl" id="hero-search-center">
          <div className="relative rounded-full shadow-lg border border-white/10 bg-white/5 p-1.5 backdrop-blur-md focus-within:border-[#00FFD1]/60 focus-within:ring-2 focus-within:ring-[#00FFD1]/25 transition-all flex items-center">
            
            <div className="flex items-center pl-4 pr-1 text-slate-400">
              <Search className="h-5 w-5 text-[#00FFD1]" />
            </div>

            <input
              type="text"
              id="hero-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search palettes (e.g. 'Midnight', 'Retro', '#f10b7f')..."
              className="w-full bg-transparent border-none py-2 text-sm text-white placeholder-slate-450 outline-none focus:outline-none focus:ring-0"
            />

            {searchQuery && (
              <button
                id="hero-search-clear-btn"
                onClick={() => setSearchQuery('')}
                className="p-1 px-4 text-xs font-bold bg-white/10 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition-colors"
                title="Clear Search"
              >
                Clear
              </button>
            )}
          </div>

          {/* Prompt Suggest Tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2" id="hero-tag-pills-row">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mr-1.5 font-bold">TRENDING:</span>
            {trendingTags.map((tag) => {
              const isSelected = searchQuery.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  id={`tag-pill-${tag}`}
                  onClick={() => setSearchQuery(isSelected ? '' : tag)}
                  className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#00FFD1] border border-white/10'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-14 border-t border-white/10 pt-8 grid grid-cols-3 gap-4" id="hero-stats-strip">
          <div>
            <span className="block text-2xl font-black text-white sm:text-3.5xl">25,800+</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">INDEXED PARAMS</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-[#00FFD1] sm:text-3.5xl drop-shadow-[0_0_8px_rgba(0,255,209,0.4)]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>2.4M+</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">SPEED DOWNLOADS</span>
          </div>
          <div>
            <span className="block text-2xl font-black text-pink-500 sm:text-3.5xl">100% CC0</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">OPEN ARCHITECTURE</span>
          </div>
        </div>

      </div>
    </section>
  );
}
