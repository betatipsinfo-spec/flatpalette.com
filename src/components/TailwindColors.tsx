import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Copy, Check, Palette, Sparkles, Filter, ChevronRight, Hash, Eye, 
  RefreshCw, BarChart2, X, Sliders, Disc, HelpCircle, Compass, Zap, Layers, AlertCircle, Info, ShieldAlert, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import DesignUtilities from './DesignUtilities';
import FAQSection from './FAQSection';

interface TailwindColorsProps {
  theme: 'light' | 'dark';
  siteConfig: SiteConfig;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSendToGenerator?: (hexColor: string) => void;
}

interface TailwindColorDetail {
  family: string;
  shade: number;
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
}

// Complete Tailwind CSS color palette database
const TAILWIND_FAMILIES_DATA: Record<string, Record<number, string>> = {
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
  },
  gray: {
    50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af',
    500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712'
  },
  zinc: {
    50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
    500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b'
  },
  neutral: {
    50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3',
    500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a'
  },
  stone: {
    50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1', 400: '#a8a29e',
    500: '#78716c', 600: '#57534e', 700: '#44403c', 800: '#292524', 900: '#1c1917', 950: '#0c0a09'
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
    500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a'
  },
  orange: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdbb74', 400: '#fb923c',
    500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407'
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
    500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
  },
  yellow: {
    50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15',
    500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006'
  },
  lime: {
    50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264', 400: '#a3e635',
    500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05'
  },
  green: {
    50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
    500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16'
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
    500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
  },
  teal: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf',
    500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e'
  },
  cyan: {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee',
    500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'
  },
  sky: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8',
    500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49'
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
    500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
  },
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8',
    500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
  },
  violet: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa',
    500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065'
  },
  purple: {
    50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
    500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
  },
  fuchsia: {
    50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9',
    500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e'
  },
  pink: {
    50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6',
    500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185',
    500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
  }
};

export default function TailwindColors({ theme, siteConfig, showToast }: TailwindColorsProps) {
  const accentColor = siteConfig.primaryNeonAccent || '#00FFD1';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Inspector popup modal states
  const [isInspectorPopupOpen, setIsInspectorPopupOpen] = useState(false);
  
  // Custom interactive lookup states
  const [customInputColor, setCustomInputColor] = useState('#3b82f6');
  const [nearestTailwindResult, setNearestTailwindResult] = useState<TailwindColorDetail | null>(null);

  // Initialize with blue-500 as active fallback preview
  const [activePreview, setActivePreview] = useState<TailwindColorDetail>({
    family: 'blue',
    shade: 500,
    hex: '#3b82f6',
    r: 59,
    g: 130,
    b: 246,
    h: 217,
    s: 91,
    l: 60
  });

  // Helpers to convert hex to RGB
  const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    const r = parseInt(clean.substring(0, 2), 16) || 0;
    const g = parseInt(clean.substring(2, 4), 16) || 0;
    const b = parseInt(clean.substring(4, 6), 16) || 0;
    return { r, g, b };
  };

  // Helpers to convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;
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
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Compile the entire flat catalog of all Tailwind colors
  const fullTailwindDatabaseList = useMemo(() => {
    const list: TailwindColorDetail[] = [];
    Object.entries(TAILWIND_FAMILIES_DATA).forEach(([familyName, shadesMap]) => {
      Object.entries(shadesMap).forEach(([shadeStr, hexVal]) => {
        const shadeNum = parseInt(shadeStr);
        const rgb = hexToRgb(hexVal);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        list.push({
          family: familyName,
          shade: shadeNum,
          hex: hexVal.toLowerCase(),
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          h: hsl.h,
          s: hsl.s,
          l: hsl.l
        });
      });
    });
    return list;
  }, []);

  // Calculate the nearest Tailwind CSS color swatch corresponding to a custom hex string
  const findNearestTailwindColor = (targetHex: string): TailwindColorDetail => {
    const rgbInput = hexToRgb(targetHex);
    let bestMatch = fullTailwindDatabaseList[0];
    let minDiff = Infinity;

    fullTailwindDatabaseList.forEach((color) => {
      // Euclidean distance in RGB coordinates
      const dR = color.r - rgbInput.r;
      const dG = color.g - rgbInput.g;
      const dB = color.b - rgbInput.b;
      const distance = dR*dR + dG*dG + dB*dB;
      
      if (distance < minDiff) {
        minDiff = distance;
        bestMatch = color;
      }
    });

    return bestMatch;
  };

  // Dynamic automatic snapper update
  useEffect(() => {
    try {
      const query = customInputColor.trim();
      if ((query.startsWith('#') && query.length >= 4) || query.length >= 3) {
        const matching = findNearestTailwindColor(query);
        setNearestTailwindResult(matching);
      }
    } catch {
      // safe error bypass
    }
  }, [customInputColor, fullTailwindDatabaseList]);

  // CMYK converter values
  const getCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);

    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);
    return { c, m, y, k };
  };

  const activeCmyk = useMemo(() => {
    return getCmyk(activePreview.r, activePreview.g, activePreview.b);
  }, [activePreview]);

  // Accessibility and contrast ratios
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
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    } catch {
      return 1;
    }
  };

  const activeContrastWithWhite = useMemo(() => {
    return getContrastRatio(activePreview.hex, '#ffffff');
  }, [activePreview]);

  const activeContrastWithBlack = useMemo(() => {
    return getContrastRatio(activePreview.hex, '#020617');
  }, [activePreview]);

  // Groups division mapping
  const groups = ['All', 'Neutrals', 'Warm / Reds', 'Cool / Blues', 'Yellows & Greens'];

  const filterFamiliesByGroup = (group: string) => {
    const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
    const warm_reds = ['red', 'orange', 'amber', 'pink', 'rose', 'purple', 'fuchsia'];
    const cool_blues = ['blue', 'indigo', 'violet', 'cyan', 'sky', 'teal'];
    const yellow_greens = ['yellow', 'lime', 'green', 'emerald'];

    if (group === 'Neutrals') return neutrals;
    if (group === 'Warm / Reds') return warm_reds;
    if (group === 'Cool / Blues') return cool_blues;
    if (group === 'Yellows & Greens') return yellow_greens;
    return Object.keys(TAILWIND_FAMILIES_DATA);
  };

  const activeFamilies = useMemo(() => {
    return filterFamiliesByGroup(selectedGroup);
  }, [selectedGroup]);

  // Handle live searches
  const filteredFamiliesWithSearchData = useMemo(() => {
    const matches: Record<string, Record<number, string>> = {};
    activeFamilies.forEach((family) => {
      const shadesMap = TAILWIND_FAMILIES_DATA[family];
      const validShades: Record<number, string> = {};
      
      Object.entries(shadesMap).forEach(([shadeStr, hexVal]) => {
        const isQueryMatching = searchQuery.trim() === '' || 
          family.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shadeStr.includes(searchQuery) ||
          hexVal.toLowerCase().includes(searchQuery.toLowerCase());

        if (isQueryMatching) {
          validShades[parseInt(shadeStr)] = hexVal;
        }
      });

      if (Object.keys(validShades).length > 0) {
        matches[family] = validShades;
      }
    });

    return matches;
  }, [activeFamilies, searchQuery]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    showToast(`Copied ${label}: ${text} to clipboard!`, 'success');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in" id="tailwind-colors-view-root">
      
      {/* 1. Header Banner & Dynamic Intro info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#00FFD1] uppercase" style={{ color: accentColor }}>
            TAILWIND SPECIFICATION CHART
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none">
            Tailwind CSS <span className="text-[#00FFD1]" style={{ color: accentColor }}>Colors</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-medium">
            Redesigned and fully interactive reference map of standard Tailwind CSS color palettes. Click on any block to analyze values, copy classes (<code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">bg-blue-500</code>, <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">text-emerald-400</code>), check WCAG accessibility compliance scores, or snap custom hues to Tailwind steps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-right font-mono text-[10px] text-slate-400">
            <span>REFERENCE SPEC:</span>
            <span className="text-[#00FFD1] font-extrabold ml-1 uppercase" style={{ color: accentColor }}>V3/V4 CONFIG v0.9</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Real-time Tailwind Snapper Converter */}
      <div className="w-full" id="tailwind-snapper-panel">
        
        {/* Deep Snapper Tool Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-wider bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl">
              SMART HEX-TO-TAILWIND SNAPPER & MAPPER
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>Convert Custom Hex into nearest Tailwind Swatch</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Type or paste any custom hex color value below. The engine will instantly perform a vector Euclidean color mapping to identify the nearest corresponding official Tailwind CSS class name and exact shade intensity level.
            </p>

            {/* Input fields row */}
            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={customInputColor}
                  onChange={(e) => setCustomInputColor(e.target.value)}
                  maxLength={7}
                  placeholder="#e11d48 or pink"
                  className="w-full bg-[#020617]/80 rounded-xl border border-white/15 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-white uppercase tracking-wider outline-none focus:border-indigo-500/50"
                />
              </div>
              <button
                onClick={() => setCustomInputColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'))}
                className="px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-bold text-xs font-mono"
                title="Randomize search color"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Random</span>
              </button>
            </div>
          </div>

          {/* Quick mapper results feedback pane */}
          {nearestTailwindResult && (
            <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                <span className="text-slate-400">INPUT METRIC COMPRESSION RESULT:</span>
                <span className="text-[#00FFD1] font-black tracking-widest" style={{ color: accentColor }}>SNAP ACTIVE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                {/* Input Swatch preview */}
                <div className="flex items-center gap-3">
                  <div 
                    className="h-12 w-12 rounded-xl border border-white/15 shrink-0" 
                    style={{ backgroundColor: customInputColor }}
                  />
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block leading-none mb-1">ORIGINAL VALUE</span>
                    <button 
                      onClick={() => handleCopy(customInputColor, 'Custom Hex')}
                      className="text-sm font-extrabold text-white block hover:text-[#00FFD1] uppercase font-mono"
                    >
                      {customInputColor}
                    </button>
                  </div>
                </div>

                {/* Tailwind Snapped swatch */}
                <div className="flex items-center gap-3 bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                  <div 
                    className="h-12 w-12 rounded-xl border border-white/15 cursor-pointer hover:scale-105 transition-all shrink-0" 
                    style={{ backgroundColor: nearestTailwindResult.hex }}
                    onClick={() => {
                      setActivePreview(nearestTailwindResult);
                      setIsInspectorPopupOpen(true);
                    }}
                  />
                  <div className="font-mono flex-1">
                    <span className="text-[10px] text-[#00FFD1] block font-black leading-none mb-1" style={{ color: accentColor }}>NEAREST TAILWIND FIT</span>
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => {
                          setActivePreview(nearestTailwindResult);
                          setIsInspectorPopupOpen(true);
                        }}
                        className="text-xs font-extrabold text-white block hover:text-[#00FFD1] text-left uppercase"
                      >
                        {nearestTailwindResult.family}-{nearestTailwindResult.shade}
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {nearestTailwindResult.hex}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="pt-2 border-t border-white/5 mt-2 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => {
                    setActivePreview(nearestTailwindResult);
                    setIsInspectorPopupOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-[#00FFD1]/10 text-[#00FFD1] hover:bg-[#00FFD1]/20 font-bold text-[10px] uppercase font-mono tracking-wider transition-all"
                  style={{ color: accentColor }}
                >
                  Inspect Color Details
                </button>
                <button
                  onClick={() => handleCopy(`bg-${nearestTailwindResult.family}-${nearestTailwindResult.shade}`, 'Utility Class')}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase font-mono tracking-wider transition-all flex items-center gap-1.5"
                >
                  <Code className="h-3 w-3" />
                  <span>Copy Cls: bg-{nearestTailwindResult.family}-{nearestTailwindResult.shade}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. Filter Navigation & Main Families Rows Grid */}
      <div className="space-y-6" id="tailwind-main-chart-content">
        
        {/* Navigation Category Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap gap-1.5" id="tailwind-color-groups">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all border cursor-pointer ${
                  selectedGroup === grp
                    ? 'bg-indigo-500/10 text-white border-indigo-500/30'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
                style={selectedGroup === grp ? { borderColor: accentColor, color: accentColor } : {}}
              >
                {grp}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Live filtration query bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                aria-label="Filter Tailwind Color Chart"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search red, 500, stone..."
                className="bg-slate-950 rounded-xl border border-white/10 py-1.5 pl-8.5 pr-4 text-xs font-mono text-slate-200 outline-none focus:border-[#00FFD1]/50 w-52"
              />
            </div>
          </div>
        </div>

        {/* List of Families with Step Swatches */}
        <div className="space-y-6 bg-slate-950/20 p-4 sm:p-6 rounded-3xl border border-white/5" id="tailwind-palette-families-grid">
          {Object.entries(filteredFamiliesWithSearchData).map(([family, shadesMap]) => (
            <div key={family} className="space-y-3 pb-4 border-b border-white/5 last:border-b-0 last:pb-0" id={`tailwind-family-${family}`}>
              {/* Family heading */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-white tracking-widest font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: shadesMap[500] || '#fff' }} />
                  <span>{family}</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500">HEX CHANNELS</span>
              </div>

              {/* Row Grid flow of intensities */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
                {Object.entries(shadesMap).map(([shadeStr, hexVal]) => {
                  const shadeNum = parseInt(shadeStr);
                  const rgb = hexToRgb(hexVal);
                  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                  const isLightText = hsl.l > 55;

                  const colorObj: TailwindColorDetail = {
                    family,
                    shade: shadeNum,
                    hex: hexVal,
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    h: hsl.h,
                    s: hsl.s,
                    l: hsl.l
                  };

                  const isActive = activePreview.family === family && activePreview.shade === shadeNum;

                  return (
                    <div
                      key={shadeStr}
                      onClick={() => {
                        setActivePreview(colorObj);
                        setIsInspectorPopupOpen(true);
                      }}
                      className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between aspect-[1.1] select-none ${
                        isActive
                          ? 'border-white bg-[#020617] scale-102 ring-1'
                          : 'border-white/5 bg-slate-950/40 hover:border-white/10 hover:bg-[#020617]/50'
                      }`}
                      style={isActive ? { borderColor: accentColor } : {}}
                    >
                      {/* Swatch color Box */}
                      <div 
                        className="w-full flex-1 rounded-lg border border-white/5 shadow-inner transition-transform group-hover:scale-[1.02] flex items-center justify-center"
                        style={{ backgroundColor: hexVal }}
                      >
                        <span className={`text-[8px] font-mono font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${
                          isLightText ? 'text-slate-950' : 'text-white'
                        }`}>
                          View
                        </span>
                      </div>

                      {/* Descriptions */}
                      <div className="mt-1.5 flex items-center justify-between leading-none">
                        <span className="text-[10px] font-black text-white font-mono">{shadeStr}</span>
                        <span className="text-[9px] text-slate-450 font-mono tracking-tighter opacity-70 group-hover:text-white transition-colors">
                          {hexVal.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(filteredFamiliesWithSearchData).length === 0 && (
            <div className="text-center py-20 bg-white/2 border border-dashed border-white/5 rounded-3xl" id="tailwind-empty-state">
              <Palette className="h-10 w-10 text-slate-600 mx-auto mb-3 animate-pulse" />
              <span className="text-sm font-bold text-slate-400 block">No Tailwind color swatches matching query.</span>
              <p className="text-xs text-slate-500 mt-1">Try changing color criteria or use query terms like slate, red, 700, or #2dd4bf</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Interactive Live Preview Mockup Card Playground */}
      <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 space-y-6" id="tailwind-preview-playground">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase" style={{ color: accentColor }}>
            MOCKUP INTEGRITY SANDBOX
          </span>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <span>Interactive Styling Sandbox Combiner</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Mix and match Tailwind hues to test background / text pairs directly on standard layout patterns. Check WCAG AAA and AA readability ratios real-time in the output container.
          </p>
        </div>

        {/* Selected parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            {/* Interactive Picker selectors */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Background Swatch Class</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const rgb = hexToRgb('#1e1b4b');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'indigo', shade: 950, hex: '#1e1b4b', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'indigo' && activePreview.shade === 950 ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#1e1b4b] border border-white/10" />
                  <span>indigo-950</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#022c22');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'emerald', shade: 950, hex: '#022c22', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'emerald' && activePreview.shade === 950 ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#022c22] border border-white/10" />
                  <span>emerald-950</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#450a0a');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'red', shade: 950, hex: '#450a0a', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'red' && activePreview.shade === 950 ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#450a0a] border border-white/10" />
                  <span>red-950</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Accent Highlight Swatch</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const rgb = hexToRgb('#38bdf8');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'sky', shade: 400, hex: '#38bdf8', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'sky' && activePreview.shade === 400 ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#38bdf8] border border-white/10" />
                  <span>sky-400</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#a3e635');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'lime', shade: 400, hex: '#a3e635', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'lime' && activePreview.shade === 400 ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#a3e635] border border-white/10" />
                  <span>lime-400</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#f472b6');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'pink', shade: 400, hex: '#f472b6', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'pink' && activePreview.shade === 400 ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#f472b6] border border-white/10" />
                  <span>pink-400</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono text-slate-400 block border-b border-white/5 pb-1">CONTRAST CHECKER RATIOS</span>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">WCAG ON WHITE (#FFF):</span>
                <span className={`font-extrabold ${activeContrastWithWhite >= 4.5 ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {activeContrastWithWhite.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">WCAG ON DARK (#020617):</span>
                <span className={`font-extrabold ${activeContrastWithBlack >= 4.5 ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {activeContrastWithBlack.toFixed(2)}:1
                </span>
              </div>
            </div>
          </div>

          {/* Sandbox mock rendered block */}
          <div className="lg:col-span-7 bg-[#090d16] border border-white/5 rounded-3xl p-6 space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">INTERACTIVE LIVE RENDERING PREVIEW</span>
            
            {/* Display box */}
            <div 
              className="p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6 flex flex-col justify-between"
              style={{ backgroundColor: activePreview.hex }}
            >
              <div className="space-y-2">
                <span className={`text-[10px] font-mono tracking-widest font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/15 inline-block ${
                  activePreview.l > 55 ? 'text-slate-950 bg-black/5' : 'text-white bg-white/5'
                }`}>
                  {activePreview.family}-{activePreview.shade} Active
                </span>
                <h4 className={`text-2.5xl font-black tracking-tight leading-tight ${
                  activePreview.l > 55 ? 'text-slate-950' : 'text-white'
                }`}>
                  Aesthetic typography pairing preview with Tailwind tokens
                </h4>
                <p className={`text-xs leading-relaxed max-w-xl font-medium ${
                  activePreview.l > 55 ? 'text-slate-800' : 'text-slate-300'
                }`}>
                  This is a live responsive element rendering. Custom text color shifts dynamically coordinates to maximize accessibility metrics in high resolution workspace settings.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${
                    activePreview.l > 55 ? 'text-slate-950' : 'text-white'
                  }`}>System Vector Core</span>
                  <span className={`text-[10px] font-mono block ${
                    activePreview.l > 55 ? 'text-slate-800' : 'text-slate-400'
                  }`}>HEX: {activePreview.hex.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Custom FAQ section first */}
      <FAQSection 
        theme={theme} 
        siteConfig={siteConfig}
        title="Tailwind CSS Colors FAQ"
        subtitle="Learn about visual weights, class configuration utilities, and responsive accessibility scales."
        customItems={[
          {
            id: 'tw-system',
            category: 'Tailwind Engine',
            question: 'What is the Tailwind CSS color hierarchy and how is it structured?',
            answer: 'Tailwind colors are compiled across distinct hue families (e.g. Slate, Sky, Violet, Amber) graded numerically on a brightness scale from 50 (lightest) to 950 (darkest). This mathematical arrangement streamlines layout contrast.',
            icon: Code
          },
          {
            id: 'tw-shades',
            category: 'Visual Weights',
            question: 'What do the numeric scales from 50 to 950 represent?',
            answer: 'The numbers indicate tone density and contrast weights. Weights like 50 and 100 are ideal for light containers, intermediate shades like 500 represent pure color bases, and 900 to 950 represent heavy colors for text or backgrounds.',
            icon: Layers
          },
          {
            id: 'tw-contrast',
            category: 'Accessibility',
            question: 'How do Tailwind weights help ensure WCAG standard compliance?',
            answer: 'The scale makes it easy to maintain contrast rules. Generally, skipping 4 to 5 weight steps (e.g. pairing weight 900 text with weight 100 backdrops) guarantees a WCAG contrast ratio above 4.5:1.',
            icon: Info
          },
          {
            id: 'tw-export',
            category: 'Utility Classes',
            question: 'Can I copy these shades straight into Tailwind utility strings?',
            answer: 'Yes! Inside the inspector, you can copy the hexadecimal codes, copy active custom styles, or duplicate raw tailwind classes (e.g. text-indigo-600 or bg-emerald-100) instantly.',
            icon: Sparkles
          }
        ]}
      />

      {/* 6. Free Creative Design Utilities below FAQ */}
      <div className="mt-20 pt-10 border-t border-white/5">
        <DesignUtilities theme={theme} siteConfig={siteConfig} />
      </div>

      {/* Interactive Popup Dynamic Color Inspector Modal */}
      <AnimatePresence>
        {isInspectorPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm" id="tailwind-popup-portal">
            {/* Backdrop click closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInspectorPopupOpen(false)}
              className="fixed inset-0 cursor-pointer"
            />

            {/* Panel (exactly max-w-[450px]) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[450px] bg-[#090d16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
              id="tailwind-popup-container"
            >
              {/* Header Title bar */}
              <div className="border-b border-white/5 px-5 py-4 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                  <span>TAILWIND COLOR INSPECTOR</span>
                </span>
                <button
                  onClick={() => setIsInspectorPopupOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Large Swatch Display */}
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
                  <span className="font-mono text-xs font-black tracking-widest block opacity-75">
                    {activePreview.family}-{activePreview.shade}
                  </span>
                  <span className="text-2xl sm:text-3.5xl font-black tracking-tighter leading-none block">{activePreview.hex.toUpperCase()}</span>
                </div>
              </div>

              {/* Specifications Channels */}
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
                      #{activePreview.hex.replace('#', '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Development Copy Shortcuts (background, text, border utility classes) */}
              <div className="px-5 pb-5 pt-1 space-y-2 bg-[#020617] border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black block">TAILWIND UTILITY CODES</span>
                <div className="grid grid-cols-1 gap-2">
                  
                  {/* Background class */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2.5">
                    <code className="text-xs font-mono text-white">bg-{activePreview.family}-{activePreview.shade}</code>
                    <button 
                      onClick={() => handleCopy(`bg-${activePreview.family}-${activePreview.shade}`, 'Tailwind Background class')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Class"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Text class */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2.5">
                    <code className="text-xs font-mono text-white">text-{activePreview.family}-{activePreview.shade}</code>
                    <button 
                      onClick={() => handleCopy(`text-${activePreview.family}-${activePreview.shade}`, 'Tailwind Text class')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Class"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Border class */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2.5">
                    <code className="text-xs font-mono text-white">border-{activePreview.family}-{activePreview.shade}</code>
                    <button 
                      onClick={() => handleCopy(`border-${activePreview.family}-${activePreview.shade}`, 'Tailwind Border class')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Class"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Footer Closer */}
              <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setIsInspectorPopupOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase font-mono tracking-wider transition-all cursor-pointer border border-white/5"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
