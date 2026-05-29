import React, { useState } from 'react';
import { Search, Sparkles, Settings2, Plus, LogIn, Laptop, Layers, Sliders, HelpCircle, Sun, Moon } from 'lucide-react';
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
