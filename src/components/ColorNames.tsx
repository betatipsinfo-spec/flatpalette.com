import React, { useState, useMemo, useEffect } from 'react';
import { Search, Copy, Check, Palette, Sparkles, Filter, ChevronRight, Hash, Eye, RefreshCw, BarChart2, X, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DATA_NAMED_COLORS, NamedColor } from '../data/colorNames';
import FAQSection from './FAQSection';
import DesignUtilities from './DesignUtilities';

interface ColorNamesProps {
  theme: 'light' | 'dark';
  siteConfig: any;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSendToGenerator: (hexColor: string) => void;
}

export default function ColorNames({ theme, siteConfig, showToast, onSendToGenerator }: ColorNamesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<NamedColor>(DATA_NAMED_COLORS[6]); // Defaults to Red
  const [headerHeight, setHeaderHeight] = useState(64);

  useEffect(() => {
    const handleResize = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    let observer: MutationObserver | null = null;
    const headerEl = document.querySelector('header');
    if (headerEl) {
      observer = new MutationObserver(handleResize);
      observer.observe(headerEl, { attributes: true, childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [customText, setCustomText] = useState('Create Beautiful User Interfaces');
  const [testTextColor, setTestTextColor] = useState<string>('#ffffff');
  const [testFontSize, setTestFontSize] = useState<number>(28);
  const [testFontWeight, setTestFontWeight] = useState<'normal' | 'semibold' | 'extrabold'>('extrabold');
  const [testLetterSpacing, setTestLetterSpacing] = useState<'tight' | 'normal' | 'wide'>('tight');

  // Calculate relative luminance of a hex color for accurate contrast scores
  const getRelativeLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const transform = (v: number) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
  };

  // Calculate contrast ratio
  const getContrastRatio = (color1: string, color2: string) => {
    try {
      const l1 = getRelativeLuminance(color1);
      const l2 = getRelativeLuminance(color2);
      const brightest = Math.max(l1, l2);
      const darkest = Math.min(l1, l2);
      return (brightest + 0.05) / (darkest + 0.05);
    } catch {
      return 1;
    }
  };

  const calculatedRatio = useMemo(() => {
    return getContrastRatio(activePreview.hex, testTextColor);
  }, [activePreview.hex, testTextColor]);

  const wcagScores = useMemo(() => {
    const ratio = calculatedRatio;
    return {
      aaLarge: ratio >= 3.0,
      aaNormal: ratio >= 4.5,
      aaaLarge: ratio >= 4.5,
      aaaNormal: ratio >= 7.0,
    };
  }, [calculatedRatio]);

  // Copy support handles both Clipboard API and fallback methods
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    showToast(`Copied ${label}: ${text} successfully!`, 'success');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Organize families
  const categories = ['All', 'Red', 'Pink', 'Orange', 'Yellow', 'Purple', 'Green', 'Blue', 'Brown', 'Gray', 'White'];

  // Filter and sort items dynamically
  const filteredColors = useMemo(() => {
    let list = [...DATA_NAMED_COLORS];

    if (selectedCategory !== 'All') {
      list = list.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.hex.toLowerCase().includes(q) ||
          c.rgb.includes(q)
      );
    }

    return list;
  }, [searchQuery, selectedCategory]);

  // Dynamic light/dark text contrast advisor rating
  const getContrastAnalysis = (hex: string) => {
    // Basic luminance conversion
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // ITU-R BT.709

    const isLight = luma > 128;
    return {
      isLight,
      textColor: isLight ? 'text-black' : 'text-white',
      badgeBg: isLight ? 'bg-slate-900/10 text-slate-800' : 'bg-white/10 text-slate-150',
      luma: Math.round(luma),
      recommendation: isLight 
        ? "Pair with deep gray colors or black text for legible interface designs."
        : "Excellent for headers, high-fashion display backgrounds, or white typography overlays."
    };
  };

  const previewAnalysis = useMemo(() => getContrastAnalysis(activePreview.hex), [activePreview]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10" id="color-names-root-view">
      
      {/* Animated Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FFD1]/10 text-[#00FFD1] text-[10px] font-bold tracking-wider uppercase border border-[#00FFD1]/20">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Redesigned Color Names lookup engine</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
            900+ Designer Colors Index
          </h2>
          <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Explore the comprehensive index of 900+ distinct named colors with variation modifiers, interactive previews, automated contrast advisors, and live palette building tools.
          </p>
        </div>
      </div>

      {/* Sticky Interactive Filters & Search Module */}
      <div 
        className={`sticky z-30 py-4 border-b backdrop-blur-md transition-all space-y-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${
          theme === 'light'
            ? 'bg-white/95 border-slate-200 shadow-sm text-slate-800'
            : 'bg-[#020617]/95 border-white/5 shadow-lg shadow-black/30 text-white'
        }`}
        style={{ top: `${headerHeight}px` }}
        id="color-names-sticky-header"
      >
        <div className="flex flex-col gap-4">
          
          {/* Categories Selector list: Responsive scrollable on mobile, standard wrap/list on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full" id="color-categories-selection">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
              <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Filter Rooms:
              </span>
            </div>
            
            {/* Standard wrapping responsive list of color rooms */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-[#00FFD1]/20 to-purple-500/20 text-[#00FFD1] border-[#00FFD1]/40 shadow-sm font-extrabold'
                        : theme === 'light'
                          ? 'text-slate-600 hover:text-slate-900 border-slate-200 bg-slate-50 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-white border-white/5 bg-white/5 hover:bg-white/10'
                    }`}
                    style={selectedCategory === cat ? { color: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, hex (e.g. #CD5C5C) or RGB value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-11 pr-12 py-3 bg-transparent rounded-2xl text-sm border font-medium outline-none transition-all ${
                theme === 'light'
                  ? 'bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400 placeholder:text-slate-400'
                  : 'bg-white/5 border-white/5 text-white focus:bg-[#020617] focus:border-[#00FFD1]/30 placeholder:text-slate-500'
              } focus:ring-1 focus:ring-current`}
              style={{ '--tw-ring-color': siteConfig.primaryNeonAccent || '#00FFD1' } as React.CSSProperties}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Primary Full Width Layout */}
      <div className="space-y-6" id="color-names-cards-container">
        
        {/* Full Width Filterable List */}
        <div className="space-y-6">

          {/* Quick Stats Header info */}
          <div className="flex items-center justify-between text-xs font-bold tracking-wider font-mono">
            <span className={`${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              SHOWING {filteredColors.length} OF {DATA_NAMED_COLORS.length} DESIGNER GLYPHS
            </span>
            <span className="text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>
              CLICK ON ANY COLOR FOR LIVE PLAYGROUND SIMULATIONS
            </span>
          </div>

          {/* Color Grid Grid */}
          {filteredColors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-slate-950/40">
              <p className="font-semibold text-slate-300 text-sm">No standard color models matched your filter search</p>
              <p className="text-xs text-slate-500 mt-1">Try keywords like 'Red', 'Gold', or 'Lavender'.</p>
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              id="color-names-cards-pool"
            >
              <AnimatePresence mode="popLayout">
                {filteredColors.map((col) => {
                  const isActive = activePreview.name === col.name;
                  const opt = getContrastAnalysis(col.hex);
                  return (
                    <motion.div
                      key={col.name}
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -10 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      layout="position"
                      onClick={() => {
                        setActivePreview(col);
                        setIsPreviewModalOpen(true);
                      }}
                      className={`relative p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex items-center gap-4 group ${
                        theme === 'light'
                          ? isActive 
                            ? 'border-slate-900 bg-white shadow-md' 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                          : isActive
                            ? 'border-[#00FFD1]/50 bg-white/5 shadow-lg shadow-black/30'
                            : 'bg-[#020617]/30 border-white/5 hover:border-white/15'
                      }`}
                    >
                      {/* Tiny responsive color sphere placeholder */}
                      <div 
                        className="w-12 h-12 rounded-xl shrink-0 shadow-inner flex items-center justify-center border border-black/10 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: col.hex }}
                      />

                      <div className="flex-grow min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold tracking-tight truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {col.name}
                          </h4>
                          <span className={`text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full ${opt.badgeBg}`}>
                            {col.category}
                          </span>
                        </div>
                        <p className={`text-[10px] sm:text-xs font-mono truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          HEX: {col.hex} • RGB({col.rgb})
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(col.hex, 'Hex Code');
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Copy Hex Code"
                        >
                          {copiedColor === col.hex ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>

      {/* Live Preview & Contrast Advisor Pop-up Modal */}
      {isPreviewModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          id="color-names-live-preview-modal"
        >
          {/* Backdrop glass blur */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" 
            onClick={() => setIsPreviewModalOpen(false)}
          />

          {/* Modal Container */}
          <div 
            className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300 flex flex-col md:grid md:grid-cols-12 gap-6 sm:gap-8 max-h-[90vh] md:max-h-[85vh] overflow-y-auto ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-[#040815] bg-gradient-to-br from-[#040815] to-[#01030a] border-[#00FFD1]/10 text-white'
            }`}
          >
            {/* Gloss Header styling */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#00FFD1] via-blue-500 to-purple-600" />

            {/* Direct Close button */}
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className={`absolute top-4 right-4 p-2 rounded-full hover:scale-105 transition-all text-slate-400 hover:text-white ${
                theme === 'light' ? 'hover:bg-slate-100 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10'
              }`}
              title="Close Panel"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Column 1: Live Interactive Typography Canvas (Col Span 7) */}
            <div className="md:col-span-7 flex flex-col space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-widest uppercase font-mono text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>
                  Live Canvas Advisor
                </span>
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Contrast Playground
                </h3>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Test readability on top of standard <span className="font-semibold">{activePreview.name}</span> instantly.
                </p>
              </div>

              {/* Huge Live Display area with requested background color */}
              <div 
                className="w-full grow min-h-[220px] rounded-2xl p-6 flex flex-col justify-between border border-black/10 transition-all shadow-inner relative overflow-hidden"
                style={{ backgroundColor: activePreview.hex }}
              >
                {/* Visual gloss overlay inside playground */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {/* Info tags inside live preview background */}
                <div className="flex items-center justify-between relative z-10 w-full">
                  <span className="text-[9px] font-bold font-mono tracking-widest uppercase bg-black/40 px-2.5 py-1 rounded-full text-white backdrop-blur-sm">
                    {activePreview.name} ({activePreview.hex})
                  </span>
                  <span className="text-[9px] font-bold font-mono tracking-widest uppercase bg-black/40 px-2.5 py-1 rounded-full text-white backdrop-blur-sm">
                    Ratio: {calculatedRatio.toFixed(2)}:1
                  </span>
                </div>

                {/* Dynamically Styled Custom Text container */}
                <div 
                  className={`relative z-10 transition-all duration-150 break-words ${
                    testFontWeight === 'extrabold' ? 'font-black' : testFontWeight === 'semibold' ? 'font-semibold' : 'font-normal'
                  } ${
                    testLetterSpacing === 'tight' ? 'tracking-tight' : testLetterSpacing === 'wide' ? 'tracking-widest' : 'tracking-normal'
                  }`}
                  style={{ 
                    color: testTextColor, 
                    fontSize: `${testFontSize}px`,
                    lineHeight: '1.2'
                  }}
                >
                  {customText || 'Enter custom layout text...'}
                </div>

                {/* Subtitle helper badge */}
                <div className="text-left relative z-10 pt-4">
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-black/25 px-2 py-0.5 rounded text-white/70">
                    Live Simulator Output
                  </span>
                </div>
              </div>

              {/* Dynamic Text field editor */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold tracking-wider uppercase text-slate-400">
                  Edit Simulator Text
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter custom visual phrases..."
                  maxLength={100}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border font-medium outline-none transition-all ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400'
                      : 'bg-[#020617]/50 border-white/5 text-white focus:bg-slate-950 focus:border-[#00FFD1]/30'
                  }`}
                />
              </div>
            </div>

            {/* Column 2: Parameters Controls Sidebar panels (Col Span 5) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-6 text-left">
              
              {/* Controls controls */}
              <div className="space-y-5">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="text-xs font-black tracking-widest uppercase text-slate-400 font-mono">
                    Adjustment Deck
                  </h4>
                </div>

                {/* Text color controls */}
                <div className="space-y-2 font-mono">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase block font-sans">
                    Foreground Text Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTestTextColor('#ffffff')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        testTextColor === '#ffffff'
                          ? 'bg-white text-slate-900 border-white font-black'
                          : theme === 'light'
                            ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                            : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
                      }`}
                    >
                      White
                    </button>
                    <button
                      onClick={() => setTestTextColor('#000000')}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        testTextColor === '#000000'
                          ? 'bg-slate-950 text-white border-slate-950 font-black'
                          : theme === 'light'
                            ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
                            : 'bg-white/5 text-slate-300 hover:text-white border-white/10'
                      }`}
                    >
                      Black
                    </button>
                    <div className="relative shrink-0 flex items-center">
                      <input
                        type="color"
                        value={testTextColor.startsWith('#') ? testTextColor : '#ffffff'}
                        onChange={(e) => setTestTextColor(e.target.value)}
                        className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-0 opacity-100"
                        title="Custom hex color picker"
                      />
                    </div>
                  </div>
                </div>

                {/* Size slider widget */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-400 tracking-wider uppercase">Font Size</span>
                    <span className="font-mono text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>{testFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="64"
                    value={testFontSize}
                    onChange={(e) => setTestFontSize(Number(e.target.value))}
                    className="w-full accent-[#00FFD1]"
                    style={{ accentColor: siteConfig.primaryNeonAccent || '#00FFD1' }}
                  />
                </div>

                {/* Weights & Spacings controls */}
                <div className="grid grid-cols-2 gap-3 pb-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Weight</span>
                    <div className="flex rounded-lg border border-white/5 p-0.5 bg-white/5">
                      {(['normal', 'semibold', 'extrabold'] as const).map((wt) => (
                        <button
                          key={wt}
                          onClick={() => setTestFontWeight(wt)}
                          className={`flex-1 text-[10px] py-1 rounded-md font-bold uppercase transition-all whitespace-nowrap px-1.5 cursor-pointer ${
                            testFontWeight === wt
                              ? 'bg-[#00FFD1] text-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          style={testFontWeight === wt ? { backgroundColor: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
                        >
                          {wt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Spacing</span>
                    <div className="flex rounded-lg border border-white/5 p-0.5 bg-white/5">
                      {(['tight', 'normal', 'wide'] as const).map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setTestLetterSpacing(sp)}
                          className={`flex-1 text-[10px] py-1 rounded-md font-bold uppercase transition-all cursor-pointer ${
                            testLetterSpacing === sp
                              ? 'bg-[#00FFD1] text-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                          style={testLetterSpacing === sp ? { backgroundColor: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
                        >
                          {sp}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* WCAG Compliance Checker scorecard */}
                <div className={`p-4 rounded-xl border space-y-3 ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-white/5 text-white'
                }`}>
                  <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-mono">WCAG Rating Scores</span>
                    <span className={`text-[11px] font-mono font-black ${calculatedRatio >= 4.5 ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {calculatedRatio.toFixed(1)}:1 Ratio
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold font-mono text-white">
                    <div className="flex items-center justify-between p-1 px-2 rounded bg-black/40">
                      <span className="text-slate-400 text-[9px]">AA Large</span>
                      <span className={wcagScores.aaLarge ? "text-emerald-400" : "text-rose-500"}>
                        {wcagScores.aaLarge ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-1 px-2 rounded bg-black/40">
                      <span className="text-slate-400 text-[9px]">AA Normal</span>
                      <span className={wcagScores.aaNormal ? "text-emerald-400" : "text-rose-500"}>
                        {wcagScores.aaNormal ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-1 px-2 rounded bg-black/40">
                      <span className="text-slate-400 text-[9px]">AAA Large</span>
                      <span className={wcagScores.aaaLarge ? "text-emerald-400" : "text-rose-500"}>
                        {wcagScores.aaaLarge ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-1 px-2 rounded bg-black/40">
                      <span className="text-slate-400 text-[9px]">AAA Normal</span>
                      <span className={wcagScores.aaaNormal ? "text-emerald-400" : "text-rose-500"}>
                        {wcagScores.aaaNormal ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout triggers & generators integrations actions */}
              <div className="space-y-2 pt-2 md:pt-0">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(activePreview.hex, 'Hex code')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'light' 
                        ? 'border-slate-250 hover:bg-slate-50 text-slate-700' 
                        : 'border-white/10 hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 opacity-65 text-emerald-400" />
                    <span>Copy HEX</span>
                  </button>
                  <button
                    onClick={() => handleCopy(`rgb(${activePreview.rgb})`, 'RGB code')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      theme === 'light' 
                        ? 'border-slate-250 hover:bg-slate-50 text-slate-700' 
                        : 'border-white/10 hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 opacity-65 text-emerald-400" />
                    <span>Copy RGB</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <FAQSection 
        theme={theme} 
        siteConfig={siteConfig}
        title="Color Names Index FAQ"
        subtitle="Answers regarding historical archives, contrast recommendations, and the live display analyzer mechanics."
        customItems={[
          {
            id: 'cn-archives',
            category: 'Color Archives',
            question: 'Where do these 900+ distinct color names originate from?',
            answer: 'This indexing suite compiles color names and pigments from classical art registries, digital CSS standards, natural history taxonomies, and historic paint formulation systems to provide a unified nomenclature standard.',
            icon: Palette
          },
          {
            id: 'cn-contrast',
            category: 'Accessibility',
            question: 'How is the interactive Contrast Advisor score computed?',
            answer: 'Each color card feeds into our WCAG 2.1 contrast estimator, measuring the relative light luminance ratios of background to standard text layers, outputting recommended pairs and accessibility levels.',
            icon: Hash
          },
          {
            id: 'cn-preview',
            category: 'Playground',
            question: 'Can I test custom text styles directly on top of these colors?',
            answer: 'Yes! Selecting a color card opens our fullscreen Playground Simulator. You can input custom strings, modify type weights, change tracking spacing, and dial font sizes up and down to observe legibility scores instantly.',
            icon: Eye
          },
          {
            id: 'cn-export',
            category: 'Export Solutions',
            question: 'Can these colors be converted or sent to other development tools?',
            answer: 'Certainly! Both single HEX/RGB copies and full palette integration ports are functional. You can click to duplicate separate color values or easily transition to the live system generators.',
            icon: Sparkles
          }
        ]}
      />

      <div className="mt-20 pt-10 border-t border-white/5">
        <DesignUtilities theme={theme} siteConfig={siteConfig} />
      </div>

    </div>
  );
}
