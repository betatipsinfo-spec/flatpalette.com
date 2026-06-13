import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Copy, Check, Palette, Sparkles, Filter, ChevronRight, Hash, Eye, 
  RefreshCw, BarChart2, X, Sliders, Disc, HelpCircle, Compass, Zap, Layers, AlertCircle, Info, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import DesignUtilities from './DesignUtilities';
import FAQSection from './FAQSection';

interface WebSafeColorsProps {
  theme: 'light' | 'dark';
  siteConfig: SiteConfig;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSendToGenerator: (hexColor: string) => void;
}

interface ColorDetail {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  isWebSafe: boolean;
}

export default function WebSafeColors({ theme, siteConfig, showToast, onSendToGenerator }: WebSafeColorsProps) {
  const accentColor = siteConfig.primaryNeonAccent || '#00FFD1';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'hex' | 'hue' | 'luminance'>('hex');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  
  // Custom interactive lookup states
  const [customInputHex, setCustomInputHex] = useState('#ffbb00');
  const [customInputSubmitted, setCustomInputSubmitted] = useState<ColorDetail | null>(null);

  // Inspector popup modal toggler
  const [isInspectorPopupOpen, setIsInspectorPopupOpen] = useState(false);

  // Initialize with #00FF99 web-safe color as active preview
  const [activePreview, setActivePreview] = useState<ColorDetail>({
    hex: '#00FF99',
    r: 0,
    g: 255,
    b: 153,
    h: 156,
    s: 100,
    l: 50,
    isWebSafe: true
  });

  const [testTextColor, setTestTextColor] = useState<string>('#020617');
  const [testFontSize, setTestFontSize] = useState<number>(24);
  const [testFontWeight, setTestFontWeight] = useState<'normal' | 'semibold' | 'extrabold'>('extrabold');

  // Generate the 216 Web Safe Color collection programmatically
  const webSafeList = useMemo(() => {
    const list: ColorDetail[] = [];
    const values = [0, 51, 102, 153, 204, 255]; // 00, 33, 66, 99, CC, FF in decimal

    for (let r = 0; r < values.length; r++) {
      for (let g = 0; g < values.length; g++) {
        for (let b = 0; b < values.length; b++) {
          const redVal = values[r];
          const greenVal = values[g];
          const blueVal = values[b];
          
          // Hex parsing
          const hexString = `#${redVal.toString(16).padStart(2, '0')}${greenVal.toString(16).padStart(2, '0')}${blueVal.toString(16).padStart(2, '0')}`.toUpperCase();

          // RGB -> HSL conversion
          const rf = redVal / 255;
          const gf = greenVal / 255;
          const bf = blueVal / 255;
          const max = Math.max(rf, gf, bf);
          const min = Math.min(rf, gf, bf);
          let h = 0, s = 0, l = (max + min) / 2;

          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
              case gf: h = (bf - rf) / d + 2; break;
              case bf: h = (rf - gf) / d + 4; break;
            }
            h /= 6;
          }

          list.push({
            hex: hexString,
            r: redVal,
            g: greenVal,
            b: blueVal,
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
            isWebSafe: true
          });
        }
      }
    }
    return list;
  }, []);

  // Nearest Web-Safe Color Converter Logic
  const calculateNearestWebSafe = (hex: string): ColorDetail => {
    let cleanHex = hex.replace('#', '').trim();
    if (cleanHex.length === 3) {
      cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
    }
    if (cleanHex.length !== 6) {
      cleanHex = '000000';
    }

    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

    // Check if original is web safe
    const allowed = [0, 51, 102, 153, 204, 255];
    const isRWebSafe = allowed.includes(r);
    const isGWebSafe = allowed.includes(g);
    const isBWebSafe = allowed.includes(b);
    const originalIsWebSafe = isRWebSafe && isGWebSafe && isBWebSafe;

    // Calculate nearest component snap values
    const snap = (v: number) => {
      let nearest = 0;
      let minDiff = 256;
      for (const val of allowed) {
        const diff = Math.abs(v - val);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = val;
        }
      }
      return nearest;
    };

    const snapR = snap(r);
    const snapG = snap(g);
    const snapB = snap(b);

    const safeHex = `#${snapR.toString(16).padStart(2, '0')}${snapG.toString(16).padStart(2, '0')}${snapB.toString(16).padStart(2, '0')}`.toUpperCase();

    // HSL of snapped color
    const rf = snapR / 255;
    const gf = snapG / 255;
    const bf = snapB / 255;
    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break;
        case gf: h = (bf - rf) / d + 2; break;
        case bf: h = (rf - gf) / d + 4; break;
      }
      h /= 6;
    }

    return {
      hex: safeHex,
      r: snapR,
      g: snapG,
      b: snapB,
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
      isWebSafe: true
    };
  };

  // Handle live custom color checks
  useEffect(() => {
    try {
      const formatted = customInputHex.trim();
      if ((formatted.startsWith('#') && formatted.length >= 4) || formatted.length >= 3) {
        const result = calculateNearestWebSafe(formatted);
        
        // Find if originally web safe
        let isSafeCheck = false;
        let clean = formatted.replace('#', '');
        if (clean.length === 3) {
          clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
        }
        if (clean.length === 6) {
          const r = parseInt(clean.substring(0, 2), 16);
          const g = parseInt(clean.substring(2, 4), 16);
          const b = parseInt(clean.substring(4, 6), 16);
          const allowed = [0, 51, 102, 153, 204, 255];
          isSafeCheck = allowed.includes(r) && allowed.includes(g) && allowed.includes(b);
        }

        setCustomInputSubmitted({
          hex: formatted.startsWith('#') ? formatted.toUpperCase() : `#${formatted}`.toUpperCase(),
          r: parseInt(clean.substring(0, 2), 16) || 0,
          g: parseInt(clean.substring(2, 4), 16) || 0,
          b: parseInt(clean.substring(4, 6), 16) || 0,
          h: result.h,
          s: result.s,
          l: result.l,
          isWebSafe: isSafeCheck
        });
      }
    } catch (e) {
      // Quiet fail on dynamic typing
    }
  }, [customInputHex]);

  // CMYK calculation conversion helper
  const getCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }

    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);

    return { c, m, y, k };
  };

  const activeCmyk = useMemo(() => {
    return getCmyk(activePreview.r, activePreview.g, activePreview.b);
  }, [activePreview]);

  // Accessibility relative luminance calculations
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

  const activeContrastRatio = useMemo(() => {
    return getContrastRatio(activePreview.hex, testTextColor);
  }, [activePreview.hex, testTextColor]);

  const wcagScores = useMemo(() => {
    const ratio = activeContrastRatio;
    return {
      aaLarge: ratio >= 3.0,
      aaNormal: ratio >= 4.5,
      aaaLarge: ratio >= 4.5,
      aaaNormal: ratio >= 7.0,
    };
  }, [activeContrastRatio]);

  // Category filtering tags classification
  const categories = ['All', 'Grays', 'Vivids', 'Pastels / Light', 'Deep / Dark', 'Reds & Warm', 'Blues & Cool'];

  const filteredAndSortedColors = useMemo(() => {
    let list = [...webSafeList];

    // Category filters
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Grays') {
        list = list.filter(c => c.r === c.g && c.g === c.b);
      } else if (selectedCategory === 'Vivids') {
        list = list.filter(c => c.s >= 75 && c.l >= 30 && c.l <= 70);
      } else if (selectedCategory === 'Pastels / Light') {
        list = list.filter(c => c.l >= 75);
      } else if (selectedCategory === 'Deep / Dark') {
        list = list.filter(c => c.l <= 25);
      } else if (selectedCategory === 'Reds & Warm') {
        // Red, Orange, Gold, Pink, Peach hue regions (Hue < 45 or Hue > 315)
        list = list.filter(c => c.h < 45 || c.h > 315);
      } else if (selectedCategory === 'Blues & Cool') {
        // Cyan, Teal, Blue, Purple hues
        list = list.filter(c => c.h >= 140 && c.h <= 290);
      }
    }

    // Search query parsing
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.hex.toLowerCase().includes(q) || 
        `${c.r},${c.g},${c.b}`.includes(q) ||
        `rgb(${c.r},${c.g},${c.b})`.toLowerCase().includes(q)
      );
    }

    // Sort handlers
    if (sortBy === 'hue') {
      list.sort((a, b) => a.h - b.h || a.l - b.l);
    } else if (sortBy === 'luminance') {
      // Sort from bright to dark
      list.sort((a, b) => b.l - a.l || a.h - b.h);
    } else {
      // Sorting alphabetically by Hex
      list.sort((a, b) => a.hex.localeCompare(b.hex));
    }

    return list;
  }, [webSafeList, selectedCategory, searchQuery, sortBy]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    showToast(`Copied ${label}: ${text} successfully!`, 'success');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const getLumaClass = (l: number) => {
    return l > 55 ? 'text-slate-950' : 'text-white';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in" id="web-safe-colors-view-root">
      
      {/* 1. Header Banner & Overarching Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#00FFD1] uppercase" style={{ color: accentColor }}>
            8-BIT LEGACY COMPATIBILITY INDEX
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none">
            216 Web <span className="text-[#00FFD1]" style={{ color: accentColor }}>Safe Colors</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-medium">
            Redesigned and optimized interactive guide of standard 8-bit web palettes. All channels strictly use hexadecimal coordinates from <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">00</code>, <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">33</code>, <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">66</code>, <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">99</code>, <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">CC</code>, or <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">FF</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-right font-mono text-[10px] text-slate-400">
            <span>DATABASE INTEGRITY: </span>
            <span className="text-emerald-400 font-extrabold uppercase">OK (216/216)</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Real-time Web Safe Snapper / Converter */}
      <div className="w-full" id="web-safe-converter-panel">
        
        {/* Analyzer Tool */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-wider bg-purple-900/30 border border-purple-500/20 text-purple-400 px-2.5 py-1 rounded-xl">
              REAL-TIME WEB-SAFE ANALYSER & SNAPPER
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-4 w-4 text-purple-400 animate-spin-slow" />
              <span>Validate & Snap Any Custom Color</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Type or paste any hex color in the box below. Our neural color compiler will immediately assess if it fits the 216 web-safe standard, and dynamically calculate the closest matching web safe coordinate.
            </p>

            {/* Input field */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={customInputHex}
                  onChange={(e) => setCustomInputHex(e.target.value)}
                  maxLength={7}
                  placeholder="#FF9933"
                  className="w-full bg-[#020617]/80 rounded-xl border border-white/15 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-white uppercase tracking-wider outline-none focus:border-purple-500/50"
                />
              </div>
              <button
                onClick={() => setCustomInputHex('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'))}
                className="px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer font-bold text-xs"
                title="Randomize custom input color"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Random</span>
              </button>
            </div>
          </div>

          {/* Verification feedback block */}
          {customInputSubmitted && (
            <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">INPUT STATUS:</span>
                {customInputSubmitted.isWebSafe ? (
                  <span className="text-emerald-400 font-black flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    <Check className="h-3 w-3" />
                    <span>ALREADY 100% WEB SAFE</span>
                  </span>
                ) : (
                  <span className="text-pink-400 font-black flex items-center gap-1 bg-pink-950/40 border border-pink-500/20 px-1.5 py-0.5 rounded-lg text-[10px]">
                    <ShieldAlert className="h-3 w-3 inline mr-1" />
                    <span>NON-WEB-SAFE (SNAPPED BELOW)</span>
                  </span>
                )}
              </div>

              {/* Flex comparison rendering */}
              <div className="grid grid-cols-2 gap-4 pt-1.5">
                {/* Original Input node */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">ORIGINAL INPUT</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-lg border border-white/15" 
                      style={{ backgroundColor: customInputSubmitted.hex }}
                    />
                    <div className="font-mono">
                      <button 
                        onClick={() => handleCopy(customInputSubmitted.hex, 'Input Hex')}
                        className="text-xs font-extrabold text-white block hover:text-[#00FFD1] text-left"
                      >
                        {customInputSubmitted.hex}
                      </button>
                      <span className="text-[9px] text-slate-500 block">
                        RGB({customInputSubmitted.r}, {customInputSubmitted.g}, {customInputSubmitted.b})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nearest Snapped node */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">CLOSEST WEB SAFE MATCH</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-lg border border-white/15 cursor-pointer hover:scale-105 transition-all" 
                      style={{ backgroundColor: calculateNearestWebSafe(customInputSubmitted.hex).hex }}
                      onClick={() => {
                        const snapped = calculateNearestWebSafe(customInputSubmitted.hex);
                        setActivePreview(snapped);
                        setIsInspectorPopupOpen(true);
                      }}
                    />
                    <div className="font-mono">
                      <button 
                        onClick={() => {
                          const snapped = calculateNearestWebSafe(customInputSubmitted.hex);
                          setActivePreview(snapped);
                          setIsInspectorPopupOpen(true);
                          handleCopy(snapped.hex, 'Snapped Web-Safe Hex');
                        }}
                        className="text-xs font-extrabold text-white block hover:text-[#00FFD1] text-left flex items-center gap-1"
                      >
                        <span>{calculateNearestWebSafe(customInputSubmitted.hex).hex}</span>
                        <Zap className="h-2.5 w-2.5 text-[#00FFD1] fill-[#00FFD1]" style={{ color: accentColor, fill: accentColor }} />
                      </button>
                      <span className="text-[9px] text-slate-500 block">
                        RBG({calculateNearestWebSafe(customInputSubmitted.hex).r}, {calculateNearestWebSafe(customInputSubmitted.hex).g}, {calculateNearestWebSafe(customInputSubmitted.hex).b})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions block */}
              <div className="border-t border-white/5 mt-2 pt-3.5 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    const snapped = calculateNearestWebSafe(customInputSubmitted.hex);
                    setActivePreview(snapped);
                    setIsInspectorPopupOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase font-mono tracking-wider transition-all"
                >
                  Inspect Color Details
                </button>

                <button
                  onClick={() => {
                    const snapped = calculateNearestWebSafe(customInputSubmitted.hex);
                    onSendToGenerator(snapped.hex);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-[10px] uppercase font-mono tracking-wider transition-all flex items-center gap-1 shrink-0"
                >
                  <span>Harmony Seed Generator</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. The 216 Color Grid Map Card Container */}
      <div className="space-y-6" id="web-safe-main-grid-layout">
        
        {/* Navigation & filters header row for the grid box */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap gap-1.5" id="web-safe-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
                style={selectedCategory === cat ? { borderColor: accentColor, color: accentColor } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                aria-label="Filter Grid"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hex/rgb..."
                className="bg-slate-950 rounded-xl border border-white/10 py-1.5 pl-8.5 pr-4 text-xs font-mono text-slate-200 outline-none focus:border-[#00FFD1]/50 w-44"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              aria-label="Sort Web Safe Color Grid"
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 text-slate-300 rounded-xl border border-white/10 px-2 py-1.5 text-xs font-mono outline-none cursor-pointer"
            >
              <option value="hex">Sort: Hex ID</option>
              <option value="hue">Sort: Hue</option>
              <option value="luminance">Sort: Luma</option>
            </select>
          </div>
        </div>

        {/* Dynamic Color Grid layout matching the filtered list */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3" id="web-safe-grid-container">
          {filteredAndSortedColors.map((color) => {
            const isActive = activePreview.hex === color.hex;
            return (
              <div
                key={color.hex}
                onClick={() => {
                  setActivePreview(color);
                  setTestTextColor(color.l > 55 ? '#020617' : '#ffffff');
                  setIsInspectorPopupOpen(true);
                }}
                className={`group relative p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between aspect-square select-none overflow-hidden hover:scale-[1.03] duration-150 ${
                  isActive
                    ? 'bg-white/15 border-white/30 ring-1 shadow-lg'
                    : 'bg-[#090d16]/30 border-white/5 hover:border-white/15'
                }`}
                style={isActive ? { borderColor: accentColor, boxShadow: `0 0 12px ${accentColor}15` } : {}}
              >
                {/* Visual block swatch */}
                <div 
                  className="w-full flex-1 rounded-xl border border-white/5 shadow-inner flex items-center justify-center transition-all"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className={`text-[9px] font-mono font-black font-outline uppercase tracking-wider block opacity-0 group-hover:opacity-100 transition-opacity ${getLumaClass(color.l)}`}>
                    Preview
                  </span>
                </div>

                {/* Subtext info */}
                <div className="pt-2 text-center text-left-row">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] font-extrabold text-white">
                      {color.hex}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(color.hex, 'Hex');
                      }}
                      className="text-slate-500 hover:text-white transition-colors"
                      title="Copy Hex"
                    >
                      <Copy className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <span className="font-mono text-[8px] text-slate-500 block truncate leading-none mt-0.5">
                    H{color.h}° L{color.l}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAndSortedColors.length === 0 && (
          <div className="text-center py-20 bg-white/2 border border-dashed border-white/5 rounded-3xl" id="web-safe-empty-state">
            <Palette className="h-10 w-10 text-slate-600 mx-auto mb-3 animate-pulse" />
            <span className="text-sm font-bold text-slate-405 block">No web-safe colors matching query.</span>
            <p className="text-xs text-slate-500 mt-1">Try searching coordinates like CC, 33, 99 or change the filter criteria.</p>
          </div>
        )}
      </div>

      {/* 4. FAQ section first */}
      <FAQSection 
        theme={theme} 
        siteConfig={siteConfig}
        title="Web Safe Colors FAQ"
        subtitle="Learn about 8-bit display restrictions, mathematical safe intervals, and modern retro usage patterns."
        customItems={[
          {
            id: 'ws-definition',
            category: 'Legacy Tech',
            question: 'What exactly are Web Safe Colors and are they still relevant today?',
            answer: 'Web Safe Colors consist of 216 distinct hues that rendered identically on 8-bit monitor screens back in the early internet era. Although current hardware supports billions of colors, this 216-color system remains a popular standard for retro aesthetic designs, pixel art, and styling consistency.',
            icon: ShieldAlert
          },
          {
            id: 'ws-math',
            category: 'Mathematics',
            question: 'Why are the coordinate hex couples limited to 00, 33, 66, 99, CC, and FF?',
            answer: 'These steps represent six mathematical percentage levels (0%, 20%, 40%, 60%, 80%, and 100%) of the RGB spectrum. Combining six levels of red, six levels of green, and six levels of blue yields 6 × 6 × 6 = 216 mathematical safe increments.',
            icon: Layers
          },
          {
            id: 'ws-contrast',
            category: 'Access Standards',
            question: 'How do the contrast ratings correlate with accessibility and WCAG?',
            answer: 'Each safe color element computes and reveals its WCAG relative luminance contrast scores when inspected. Ratios above 4.5:1 meet AA requirements for standard type weights, while AAA ratings require 7.0:1 or more.',
            icon: Info
          },
          {
            id: 'ws-usecase',
            category: 'Retro Branding',
            question: 'Can I export web safe assets straight to standard styles?',
            answer: 'Yes! Selecting a color box displays its code properties. You can copy raw strings, copy styled tailwind structures, or bridge the color straight to the system generator.',
            icon: Sparkles
          }
        ]}
      />

      {/* 5. Utilities for Web Safe Color layout below FAQ */}
      <div className="mt-20 pt-10 border-t border-white/5">
        <DesignUtilities theme={theme} siteConfig={siteConfig} />
      </div>

      {/* Interactive Popup Dynamic Color Inspector */}
      <AnimatePresence>
        {isInspectorPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" id="websafe-popup-portal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInspectorPopupOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card content (more than 400px width: exactly max-w-[450px]) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[450px] bg-[#090d16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
              id="websafe-popup-container"
            >
              {/* Top Title Bar */}
              <div className="border-b border-white/5 px-5 py-4 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                  <span>DYNAMIC COLOR INSPECTOR</span>
                </span>
                <button
                  onClick={() => setIsInspectorPopupOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Swatch Header */}
              <div 
                className="h-36 sm:h-40 flex flex-col justify-end p-5 relative transition-all duration-300"
                style={{ backgroundColor: activePreview.hex }}
              >
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <button 
                    onClick={() => handleCopy(activePreview.hex, 'HEX')}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                      activePreview.l > 55 ? 'bg-black/10 hover:bg-black/20 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    title="Copy Hex Value"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                <div className={activePreview.l > 55 ? 'text-black' : 'text-white'}>
                  <span className="font-mono text-xs font-black tracking-widest block opacity-70">WEB-SAFE SWATCH</span>
                  <span className="text-2xl sm:text-3.5xl font-black tracking-tighter leading-none block">{activePreview.hex}</span>
                </div>
              </div>

              {/* Specifications Details */}
              <div className="p-5 grid grid-cols-2 gap-4 bg-slate-950/20">
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">RGB:</span>
                    <span className="font-mono font-extrabold text-white">
                      {activePreview.r}, {activePreview.g}, {activePreview.b}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">HSL:</span>
                    <span className="font-mono font-extrabold text-white">
                      {activePreview.h}°, {activePreview.s}%, {activePreview.l}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">CMYK:</span>
                    <span className="font-extrabold text-white text-right">
                      C{activeCmyk.c} M{activeCmyk.m} Y{activeCmyk.y} K{activeCmyk.k}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0dFF99]/8 border border-white/5 rounded-2xl flex items-center justify-between text-xs text-slate-300">
                    <span className="font-mono text-slate-400">DEC:</span>
                    <span className="font-mono font-bold text-[#00FFD1]" style={{ color: accentColor }}>
                      #{activePreview.hex.substring(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Accessibility/Contrast Section */}
              <div className="p-5 border-t border-white/5 bg-[#020617] space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">WCAG CONTRAST ON CURRENT CANVAS:</span>
                  <span className="font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">
                    {activeContrastRatio.toFixed(2)} : 1
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono leading-none font-bold">
                  <div className={`p-2 rounded-xl border ${wcagScores.aaNormal ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-pink-950/20 border-pink-500/20 text-pink-400'}`}>
                    AA Normal
                  </div>
                  <div className={`p-2 rounded-xl border ${wcagScores.aaLarge ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-pink-950/20 border-pink-500/20 text-pink-400'}`}>
                    AA Large
                  </div>
                  <div className={`p-2 rounded-xl border ${wcagScores.aaaNormal ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-pink-950/20 border-pink-500/20 text-pink-400'}`}>
                    AAA Normal
                  </div>
                  <div className={`p-2 rounded-xl border ${wcagScores.aaaLarge ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-pink-950/20 border-pink-500/20 text-pink-400'}`}>
                    AAA Large
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsInspectorPopupOpen(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
