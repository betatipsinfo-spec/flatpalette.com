import React, { useState } from 'react';
import { Search, Sparkles, Settings2, Plus, LogIn, Laptop, Layers, Sliders, HelpCircle, Sun, Moon, Palette, ChevronDown, ExternalLink, ChevronRight, Disc, Wrench, Code, Layout, Type, Image, Bookmark, Grid } from 'lucide-react';
import { SiteConfig } from '../types';
import { supabase } from '../supabaseClient';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  siteConfig: SiteConfig;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  openSubmitForm: () => void;
  sessionUser: any;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  siteConfig,
  isAdmin,
  setIsAdmin,
  openSubmitForm,
  sessionUser,
  theme,
  setTheme,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [colorsDropdownOpen, setColorsDropdownOpen] = useState(false);
  const [freeToolsDropdownOpen, setFreeToolsDropdownOpen] = useState(false);

  // Nav list configuration
  const navItems = [
    { id: 'home', label: 'Explore Feed', icon: Layers },
    { id: 'explore', label: 'Color Archives', icon: Laptop },
    ...(sessionUser ? [{ id: 'generator', label: 'Harmony Generator', icon: Sliders }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-white/5 backdrop-blur-md">
      {/* Top Banner Announcement */}
      {siteConfig.activeAnnouncement && (
        <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-[#00FFD1] text-center text-xs font-bold py-1.5 px-4 text-black uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5" id="announcement-banner">
          <Sparkles className="h-3.5 w-3.5 fill-black" />
          <span>{siteConfig.activeAnnouncement}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Neon Branded Logo */}
          <div 
            onClick={() => { setActiveTab('home'); setIsAdmin(false); }}
            className="flex cursor-pointer items-center space-x-2.5 group"
            id="site-logo-container"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00FFD1] to-purple-600 p-0.5 shadow-lg group-hover:scale-105 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#020617]">
                <span className="bg-gradient-to-r from-[#00FFD1] to-purple-400 bg-clip-text text-base font-black text-transparent">FP</span>
              </div>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-[#00FFD1] to-purple-600 opacity-40 blur-sm group-hover:opacity-75 transition-all"></div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-white">
                flat<span className="text-[#00FFD1] drop-shadow-[0_0_8px_rgba(0,255,209,0.6)]">palette</span>
              </span>
              <p className="text-[8px] font-mono tracking-widest text-slate-400 -mt-1.5 uppercase">COLOR DESIGN ARCHITECTURE</p>
            </div>
          </div>

          {/* Desktop Links with Active Underlines */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !isAdmin;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => { setActiveTab(item.id); setIsAdmin(false); }}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'text-[#00FFD1]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  style={isActive ? { color: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
                >
                  <Icon className="h-3.5 w-3.5 opacity-70" />
                  <span>{item.label}</span>
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: siteConfig.primaryNeonAccent || '#00FFD1', boxShadow: '0 0 8px #00FFD1' }}
                    />
                  )}
                </button>
              );
            })}

            {/* Colors Dropdown Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setColorsDropdownOpen(true)}
              onMouseLeave={() => setColorsDropdownOpen(false)}
            >
              <button
                id="nav-colors-dropdown-trigger"
                onClick={() => setColorsDropdownOpen(!colorsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  colorsDropdownOpen 
                    ? 'text-[#00FFD1] bg-white/5' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                style={colorsDropdownOpen ? { color: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
              >
                <Palette className="h-3.5 w-3.5 opacity-70" />
                <span>Colors</span>
                <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-200 ${colorsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {colorsDropdownOpen && (
                <div 
                  className={`absolute left-0 mt-1 w-64 rounded-xl border p-2.5 shadow-xl backdrop-blur-lg transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800'
                      : 'bg-[#090d16]/95 border-white/10 shadow-black/80 text-slate-205'
                  }`}
                  id="nav-colors-dropdown-menu"
                >
                  <p className={`text-[10px] uppercase tracking-widest font-mono mb-2 px-2.5 ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Color Utilities
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab('color-picker');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 mb-1'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white mb-1'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Color Picker</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Interactive color space analyzer with real-time RGB/HSL/CMYK specs & contrast scoring.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('color-names');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Palette className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Color Names</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Exhaustive list of standardized hex values, RGB values & HTML color titles.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('color-wheel');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-t border-slate-100 pt-2.5 mt-1'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border-t border-white/5 pt-2.5 mt-1'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Disc className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Color Wheel</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Interactive color space with harmony formulas, custom shades, tints, and real-time contrast calculations.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('web-safe-colors');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-t border-slate-100 pt-2.5 mt-1'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border-t border-white/5 pt-2.5 mt-1'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Grid className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Web Safe Colors</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Complete interactive map of the 216 standard web-safe color grid with custom snapper and analyzer.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('tailwind-colors');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-t border-slate-100 pt-2.5 mt-1'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border-t border-white/5 pt-2.5 mt-1'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Sparkles className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Tailwind Colors</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Full interactive Tailwind CSS v3 & v4 chart, hex scanner, and utilities lookup mapper.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('material-colors');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-t border-slate-100 pt-2.5 mt-1'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border-t border-white/5 pt-2.5 mt-1'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Palette className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Material Design Color</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-450" />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Google's Material Design official palette chart, intensity weights, and hex mapping converter.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('flat-colors');
                      setColorsDropdownOpen(false);
                    }}
                    className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-t border-slate-100 pt-2.5 mt-1'
                        : 'hover:bg-white/5 text-slate-300 hover:text-white border-t border-white/5 pt-2.5 mt-1'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Palette className="h-4 w-4 text-orange-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold leading-none">Flat Color Design</span>
                        <ChevronRight className="h-3 w-3 opacity-45 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-orange-450" />
                      </div>
                      <p className={`text-[10px] leading-snug ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Classic retro Flat UI color palette index with interactive contrast meters.
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Free Tools Dropdown Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setFreeToolsDropdownOpen(true)}
              onMouseLeave={() => setFreeToolsDropdownOpen(false)}
            >
              <button
                id="nav-freetools-dropdown-trigger"
                onClick={() => {
                  const element = document.getElementById('design-utilities-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                  setFreeToolsDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  freeToolsDropdownOpen 
                    ? 'text-[#00FFD1] bg-white/5' 
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                style={freeToolsDropdownOpen ? { color: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
              >
                <Wrench className="h-3.5 w-3.5 opacity-70" />
                <span>Free Tools</span>
                <ChevronDown className={`h-3 w-3 opacity-70 transition-transform duration-200 ${freeToolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {freeToolsDropdownOpen && (
                <div 
                  className={`absolute left-0 mt-1 w-72 rounded-xl border p-2.5 shadow-xl backdrop-blur-lg transition-all duration-200 ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800'
                      : 'bg-[#090d16]/95 border-white/10 shadow-black/80 text-slate-205'
                  }`}
                  id="nav-freetools-dropdown-menu"
                >
                  <p className={`text-[10px] uppercase tracking-widest font-mono mb-2 px-2.5 ${
                    theme === 'light' ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Developer & Designer Tools
                  </p>
                  
                  <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
                    <a
                      href="https://templatemind.com/tools/icons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-sans'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white font-sans'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Image className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">Free Icon Gallery</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </div>
                        <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Curated library of vector stroke line icon packs.
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://templatemind.com/tools/color-palettes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-sans'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white font-sans'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Palette className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">Free Color Palette</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </div>
                        <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Inspirational curated multi-tone layout formulas.
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://templatemind.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-sans'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white font-sans'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Layout className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">Free UI Resources</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </div>
                        <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          High-quality layered templates, kits, and asset mockups.
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://templatemind.com/tools/css-fonts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-sans'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white font-sans'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Type className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">CSS Font Stacks</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </div>
                        <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Web safe font combinations with elegant fallback code.
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://faviconexpert.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-sans'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white font-sans'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Bookmark className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">Favicon Studio</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </div>
                        <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Online vector favicon generator and brand mask designer.
                        </p>
                      </div>
                    </a>

                    <a
                      href="https://freecss.net/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex items-start text-left w-full gap-3 p-2.5 rounded-lg transition-all cursor-pointer border-t ${
                        theme === 'light'
                          ? 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-100 font-sans'
                          : 'hover:bg-white/5 text-slate-300 hover:text-white border-white/5 font-sans'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-1 ${
                        theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                      }`}>
                        <Code className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                      </div>
                      <div className="space-y-0.5 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold leading-none">CSS Suit & Free Fonts</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </div>
                        <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Full premium templates, font sheets, and helper front-end guides.
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Action Row */}
          <div className="flex items-center space-x-3 flex-1 md:flex-initial justify-end">
            {/* Header Search Bar */}
            <div className="relative hidden sm:block max-w-xs w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                id="header-search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'home' && activeTab !== 'explore') {
                    setActiveTab('home');
                    setIsAdmin(false);
                  }
                }}
                placeholder="Search palettes (e.g. Neon)..."
                className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-10 pr-4 text-xs font-semibold text-slate-200 placeholder-slate-450 focus:border-[#00FFD1]/50 focus:outline-none focus:ring-2 focus:ring-[#00FFD1]/30 transition-all"
              />
            </div>

            {/* Quick Submit CTA */}
            {sessionUser && (
              <button
                id="header-submit-palette-btn"
                onClick={() => {
                  if (sessionUser) {
                    openSubmitForm();
                  } else {
                    setActiveTab('signin');
                    setIsAdmin(false);
                  }
                }}
                className="relative flex items-center justify-center gap-1.5 px-4 py-1.5 border border-white/10 hover:border-[#00FFD1]/50 text-slate-200 hover:text-white rounded-full bg-white/5 text-xs font-bold tracking-wider uppercase transition-all shadow-md group"
              >
                <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-all text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                <span>Submit</span>
              </button>
            )}

            {/* Admin Toggle button */}
            {sessionUser && (
              <button
                id="header-admin-toggle-btn"
                onClick={() => {
                  if (sessionUser) {
                    setIsAdmin(!isAdmin);
                    if (!isAdmin) {
                      setMobileMenuOpen(false);
                    }
                  } else {
                    setActiveTab('signin');
                    setIsAdmin(false);
                  }
                }}
                className={`p-2 rounded-lg border transition-all ${
                  isAdmin
                    ? 'bg-purple-950/40 border-purple-500 text-purple-400 shadow-md shadow-purple-950/30'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={sessionUser ? "Admin Panel Control" : "Authenticating Coordinates Required To Use Control Matrix"}
              >
                <Settings2 className={`h-4.5 w-4.5 ${isAdmin ? 'animate-spin-slow' : ''}`} />
              </button>
            )}

            {/* Light / Dark Mode Toggle Button */}
            <button
              id="header-theme-toggle-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-350 hover:text-[#00FFD1] hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center scale-95 hover:scale-105 active:scale-95"
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === 'light' ? (
                <Moon className="h-4.5 w-4.5 text-purple-500 fill-purple-500/15" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-[#00FFD1]" />
              )}
            </button>

            {/* User Login CTA / Logout dynamic flow */}
            {sessionUser ? (
              <button
                id="header-logout-btn"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setActiveTab('home');
                  setIsAdmin(false);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-955/40 hover:text-rose-100 transition-all cursor-pointer font-mono text-[10.5px] font-bold"
                title={`Logged in as ${sessionUser.email}. Click to Sign Out.`}
              >
                <span className="max-w-[70px] truncate">{sessionUser.email?.split('@')[0]}</span>
                <span className="text-[9px] text-red-400 bg-red-950/40 border border-red-550/20 px-1 py-0.5 rounded uppercase">Sign Out</span>
              </button>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => {
                  setActiveTab('signin');
                  setIsAdmin(false);
                }}
                className={`hidden sm:flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 shadow-md active:scale-95 cursor-pointer ${
                  activeTab === 'signin' || activeTab === 'signup'
                    ? 'bg-gradient-to-br from-[#00FFD1]/20 to-purple-950/45 border-[#00FFD1] text-[#00FFD1] shadow-[0_0_15px_rgba(0,255,209,0.45)]'
                    : 'bg-white/5 border-white/10 text-slate-200 hover:text-white hover:border-[#00FFD1]/70 hover:shadow-[0_0_12px_rgba(0,255,209,0.2)] hover:bg-[#00FFD1]/8'
                }`}
                title="Log In"
              >
                <LogIn className="h-4.5 w-4.5" />
              </button>
            )}

            {/* Mobile Hamburger menu */}
            <button
              id="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white md:hidden"
            >
              <svg className="h-6.5 w-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950 px-4 py-4 space-y-3" id="mobile-navigation-drawer">
          <div className="relative mb-3.5">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'home' && activeTab !== 'explore') {
                  setActiveTab('home');
                  setIsAdmin(false);
                }
              }}
              placeholder="Search palettes..."
              className="w-full rounded-lg border border-white/10 bg-slate-900/85 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsAdmin(false);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    activeTab === item.id && !isAdmin
                      ? 'bg-white/5 text-white border-l-2 border-[#00FFD1]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Colors link in mobile drawer */}
            <div className="flex flex-col border-t border-white/5 pt-2 mt-2 gap-1.5">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                <span>Color Utilities</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('color-picker');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Color Picker</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('color-names');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Color Names</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('color-wheel');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Disc className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Color Wheel</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('web-safe-colors');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Grid className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Web Safe Colors</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('tailwind-colors');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Tailwind Colors</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('material-colors');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-amber-450" />
                  <span>Material Design Colors</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setActiveTab('flat-colors');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-orange-450" />
                  <span>Flat Design Colors</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Free Tools link in mobile drawer */}
            <div className="flex flex-col border-t border-white/5 pt-2 mt-2 gap-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const element = document.getElementById('design-utilities-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 200);
                }}
                className={`flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider font-mono w-full text-left cursor-pointer transition-colors ${
                  theme === 'light' ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-[#00FFD1]'
                }`}
                style={{ color: theme === 'light' ? undefined : (siteConfig.primaryNeonAccent || '#00FFD1') }}
              >
                <span>Free Tools (Scroll to Utilities)</span>
                <ChevronRight className="h-3 w-3" />
              </button>
              <a
                href="https://templatemind.com/tools/icons"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Image className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Free Icon Gallery</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>

              <a
                href="https://templatemind.com/tools/color-palettes"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Free Color Palette</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>

              <a
                href="https://templatemind.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layout className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Free UI Resources</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>

              <a
                href="https://templatemind.com/tools/css-fonts"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Type className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>CSS Font Stacks</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>

              <a
                href="https://faviconexpert.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>Favicon Studio</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>

              <a
                href="https://freecss.net/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left w-full transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-slate-50/50'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                  <span>CSS Suit & Free Fonts</span>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </a>
            </div>

            {sessionUser ? (
              <button
                id="mobile-nav-logout"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setActiveTab('home');
                  setIsAdmin(false);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-955/20 hover:text-rose-100 transition-all w-full text-left cursor-pointer"
              >
                <LogIn className="h-4 w-4 rotate-180 text-rose-450" />
                <span>Log Out ({sessionUser.email?.split('@')[0]})</span>
              </button>
            ) : (
              <button
                id="mobile-nav-signin"
                onClick={() => {
                  setActiveTab('signin');
                  setIsAdmin(false);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  (activeTab === 'signin' || activeTab === 'signup') && !isAdmin
                    ? 'bg-white/5 text-white border-l-2 border-[#00FFD1]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <LogIn className="h-4 w-4 text-slate-400" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

            {/* Mobile light/dark theme switcher */}
            <button
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 w-full text-left cursor-pointer"
              id="mobile-nav-theme-toggle"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-purple-400" />
                  <span>Switch to Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-[#00FFD1]" />
                  <span>Switch to Light Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
