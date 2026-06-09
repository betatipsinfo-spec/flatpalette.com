import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Copy, Check, Palette, Sparkles, Filter, ChevronRight, Hash, Eye, 
  RefreshCw, BarChart2, X, Sliders, Disc, HelpCircle, Compass, Zap, Layers, AlertCircle, Info, ShieldAlert, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import DesignUtilities from './DesignUtilities';
import FAQSection from './FAQSection';

interface FlatColorsProps {
  theme: 'light' | 'dark';
  siteConfig: SiteConfig;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSendToGenerator?: (hexColor: string) => void;
}

interface FlatColorDetail {
  family: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  type: 'Lighter' | 'Darker';
}

// Complete Flat Design Color Palette Specification
const FLAT_DESIGN_PALETTE_DATA: Record<string, Record<string, { hex: string; type: 'Lighter' | 'Darker' }>> = {
  'Aqua & Green': {
    'Turquoise': { hex: '#1abc9c', type: 'Lighter' },
    'Green Sea': { hex: '#16a085', type: 'Darker' },
    'Emerald': { hex: '#2ecc71', type: 'Lighter' },
    'Nephritis': { hex: '#27ae60', type: 'Darker' },
    'Mint Leaf': { hex: '#00d2d3', type: 'Lighter' },
    'Gatorade Green': { hex: '#01a3a4', type: 'Darker' },
    'Light Green Sea': { hex: '#2bcbba', type: 'Lighter' },
    'Deep Forest': { hex: '#0fb9b1', type: 'Darker' }
  },
  'Blue & Purple': {
    'Peter River': { hex: '#3498db', type: 'Lighter' },
    'Belize Hole': { hex: '#2980b9', type: 'Darker' },
    'Amethyst': { hex: '#9b59b6', type: 'Lighter' },
    'Wisteria': { hex: '#8e44ad', type: 'Darker' },
    'Megaman Blue': { hex: '#4bcffa', type: 'Lighter' },
    'Spire Blue': { hex: '#2e86de', type: 'Darker' },
    'Gloomy Purple': { hex: '#a55eea', type: 'Lighter' },
    'Boyzone Indigo': { hex: '#4b7bec', type: 'Darker' }
  },
  'Yellow & Orange': {
    'Sunflower': { hex: '#f1c40f', type: 'Lighter' },
    'Orange': { hex: '#f39c12', type: 'Darker' },
    'Carrot': { hex: '#e67e22', type: 'Lighter' },
    'Pumpkin': { hex: '#d35400', type: 'Darker' },
    'Jeju Orange': { hex: '#ff9f43', type: 'Lighter' },
    'Flirt Yellow': { hex: '#feca57', type: 'Darker' },
    'Plump Peach': { hex: '#ffb8b8', type: 'Lighter' },
    'Rich Coral': { hex: '#ff7f50', type: 'Darker' }
  },
  'Red & Crimson': {
    'Alizarin': { hex: '#e74c3c', type: 'Lighter' },
    'Pomegranate': { hex: '#c0392b', type: 'Darker' },
    'Watermelon Pink': { hex: '#ff6b6b', type: 'Lighter' },
    'Bleeding Dragon Red': { hex: '#ee5253', type: 'Darker' },
    'Fusion Red': { hex: '#fc5c65', type: 'Lighter' },
    'Desire Crimson': { hex: '#eb3b5a', type: 'Darker' }
  },
  'Slate & Dark': {
    'Wet Asphalt': { hex: '#34495e', type: 'Lighter' },
    'Midnight Blue': { hex: '#2c3e50', type: 'Darker' },
    'Prestige Blue': { hex: '#2f3542', type: 'Lighter' },
    'Gris Grey': { hex: '#747d8c', type: 'Darker' },
    'Bay Wharf Dark': { hex: '#2f3640', type: 'Lighter' },
    'Electro Magnetic': { hex: '#57606f', type: 'Darker' }
  },
  'Silicon & Silver': {
    'Clouds': { hex: '#ecf0f1', type: 'Lighter' },
    'Silver': { hex: '#bdc3c7', type: 'Darker' },
    'Concrete': { hex: '#95a5a6', type: 'Lighter' },
    'Asbestos': { hex: '#7f8c8d', type: 'Darker' },
    'Lynx White': { hex: '#f5f6fa', type: 'Lighter' },
    'City Lights': { hex: '#dfe4ea', type: 'Darker' },
    'Innuendo Blue-Grey': { hex: '#a5b1c2', type: 'Lighter' },
    'Blue Sunset Grey': { hex: '#778ca3', type: 'Darker' }
  },
  'Spanish Flat': {
    'Janna Pastel': { hex: '#f7f1e3', type: 'Lighter' },
    'Baltic Grey': { hex: '#d1ccc0', type: 'Darker' },
    'C64 Purple': { hex: '#706fd3', type: 'Lighter' },
    'Liberty Navy': { hex: '#40407a', type: 'Darker' },
    'Devil Point Blue': { hex: '#2c2c54', type: 'Lighter' },
    'Lucky Point Green': { hex: '#218c74', type: 'Darker' },
    'Synthetic Pumpkin Orange': { hex: '#ff793f', type: 'Lighter' },
    'Fluro Red Devil': { hex: '#ff5252', type: 'Darker' }
  },
  'British Flat': {
    'Rise-N-Shine Yellow': { hex: '#fbc531', type: 'Lighter' },
    'Nanotech Orange': { hex: '#e84118', type: 'Darker' },
    'Lynx Ice White': { hex: '#f5f6fa', type: 'Lighter' },
    'Blueberry Mazarine': { hex: '#273c75', type: 'Darker' },
    'Pico Blue Midnight': { hex: '#192a56', type: 'Lighter' },
    'Vanadyl Marine': { hex: '#0097e6', type: 'Darker' },
    'Sea Brook Teal': { hex: '#487eb0', type: 'Lighter' },
    'Naval Commander': { hex: '#40739e', type: 'Darker' }
  },
  'Swedish Flat': {
    'High Blue': { hex: '#45aaf2', type: 'Lighter' },
    'Boyzone Indigo': { hex: '#4b7bec', type: 'Darker' },
    'Sunset Orange': { hex: '#fa8231', type: 'Lighter' },
    'Royal Orange': { hex: '#f39c12', type: 'Darker' },
    'Emerald Green': { hex: '#20bf6b', type: 'Lighter' },
    'Algae Green': { hex: '#26de81', type: 'Darker' },
    'Sky Blue Accent': { hex: '#18dcff', type: 'Lighter' },
    'Swedish Pine Green': { hex: '#05c46b', type: 'Darker' }
  },
  'Canadian Flat': {
    'Joust Blue': { hex: '#54a0ff', type: 'Lighter' },
    'Bleeder Jet Red': { hex: '#ff6b6b', type: 'Darker' },
    'Casandora Yellow': { hex: '#feca57', type: 'Lighter' },
    'Wild Watermelon': { hex: '#ff6b81', type: 'Darker' },
    'Pastel Red': { hex: '#ff7675', type: 'Lighter' },
    'Armor Grey': { hex: '#57606f', type: 'Darker' },
    'Orchid Orange': { hex: '#fea47f', type: 'Lighter' },
    'Spiro Disco Blue': { hex: '#25ccf7', type: 'Darker' }
  },
  'French Flat': {
    'Orchid Purple': { hex: '#c56cf0', type: 'Lighter' },
    'Matt Purple': { hex: '#8c7ae6', type: 'Darker' },
    'Mazarine Blue': { hex: '#273c75', type: 'Lighter' },
    'Pico Void Midnight': { hex: '#192a56', type: 'Darker' },
    'Lynx White': { hex: '#f5f6fa', type: 'Lighter' },
    'Blue Nights': { hex: '#353b48', type: 'Darker' },
    'Nasturcian Red': { hex: '#e84118', type: 'Lighter' },
    'Chain Gang Grey': { hex: '#718093', type: 'Darker' }
  },
  'German Flat': {
    'Fusion Red': { hex: '#fc5c65', type: 'Lighter' },
    'Desire Crimson': { hex: '#eb3b5a', type: 'Darker' },
    'Orange Hibiscus': { hex: '#fd9644', type: 'Lighter' },
    'Bennu Orange': { hex: '#fa8231', type: 'Darker' },
    'Flirt Yellow': { hex: '#fed330', type: 'Lighter' },
    'Reptile Green': { hex: '#20bf6b', type: 'Darker' },
    'Maximum Blue Green': { hex: '#2bcbba', type: 'Lighter' },
    'Turquoise Dark': { hex: '#0fb9b1', type: 'Darker' }
  },
  'Turkish Flat': {
    'Aunty Pink': { hex: '#ff7979', type: 'Lighter' },
    'Deep Pink': { hex: '#ff6b81', type: 'Darker' },
    'Beekeeper Yellow': { hex: '#f6e58d', type: 'Lighter' },
    'Spiced Nectarine': { hex: '#ffbe76', type: 'Darker' },
    'June Bud Green': { hex: '#badc58', type: 'Lighter' },
    'Greenland Green': { hex: '#22a6b3', type: 'Darker' },
    'Soaring Eagle': { hex: '#95afc0', type: 'Lighter' },
    'Steel Blue': { hex: '#130cb7', type: 'Darker' }
  }
};

export default function FlatColors({ theme, siteConfig, showToast }: FlatColorsProps) {
  const accentColor = siteConfig.primaryNeonAccent || '#00FFD1';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Inspector popup modal states
  const [isInspectorPopupOpen, setIsInspectorPopupOpen] = useState(false);
  
  // Custom interactive lookup states
  const [customInputColor, setCustomInputColor] = useState('#1abc9c');
  const [nearestFlatResult, setNearestFlatResult] = useState<FlatColorDetail | null>(null);

  // Initialize with Turquoise as active fallback preview
  const [activePreview, setActivePreview] = useState<FlatColorDetail>({
    family: 'Aqua & Green',
    name: 'Turquoise',
    hex: '#1abc9c',
    r: 26,
    g: 188,
    b: 156,
    h: 168,
    s: 76,
    l: 42,
    type: 'Lighter'
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

  // Compile the entire flat catalog of all Flat UI colors
  const fullFlatDatabaseList = useMemo(() => {
    const list: FlatColorDetail[] = [];
    Object.entries(FLAT_DESIGN_PALETTE_DATA).forEach(([familyName, shadesMap]) => {
      Object.entries(shadesMap).forEach(([colorName, spec]) => {
        const rgb = hexToRgb(spec.hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        list.push({
          family: familyName,
          name: colorName,
          hex: spec.hex.toLowerCase(),
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          h: hsl.h,
          s: hsl.s,
          l: hsl.l,
          type: spec.type
        });
      });
    });
    return list;
  }, []);

  // Calculate standard Euclidean distance matching
  const findNearestFlatColor = (targetHex: string): FlatColorDetail => {
    const rgbInput = hexToRgb(targetHex);
    let bestMatch = fullFlatDatabaseList[0];
    let minDiff = Infinity;

    fullFlatDatabaseList.forEach((color) => {
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

  // Snapper listener
  useEffect(() => {
    try {
      const query = customInputColor.trim();
      if ((query.startsWith('#') && query.length >= 4) || query.length >= 3) {
        const matching = findNearestFlatColor(query);
        setNearestFlatResult(matching);
      }
    } catch {
      // quiet safe bypass
    }
  }, [customInputColor, fullFlatDatabaseList]);

  // CMYK conversions
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

  // Contrast accessibility 
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

  // Segment groups
  const groups = ['All', 'Aqua & Emeralds', 'Blues & Amethysts', 'Bright Oranges', 'Slate & Neutrals', 'International Flat'];

  const filterFamiliesByGroup = (group: string) => {
    const aquaEmeralds = ['Aqua & Green'];
    const bluesAmethysts = ['Blue & Purple'];
    const brightOranges = ['Yellow & Orange', 'Red & Crimson'];
    const slateNeutrals = ['Slate & Dark', 'Silicon & Silver'];
    const internationalFlat = ['Spanish Flat', 'British Flat', 'Swedish Flat', 'Canadian Flat', 'French Flat', 'German Flat', 'Turkish Flat'];

    if (group === 'Aqua & Emeralds') return aquaEmeralds;
    if (group === 'Blues & Amethysts') return bluesAmethysts;
    if (group === 'Bright Oranges') return brightOranges;
    if (group === 'Slate & Neutrals') return slateNeutrals;
    if (group === 'International Flat') return internationalFlat;
    return Object.keys(FLAT_DESIGN_PALETTE_DATA);
  };

  const activeFamilies = useMemo(() => {
    return filterFamiliesByGroup(selectedGroup);
  }, [selectedGroup]);

  // Search filter matching
  const filteredFamiliesWithSearchData = useMemo(() => {
    const matches: Record<string, Record<string, { hex: string; type: 'Lighter' | 'Darker' }>> = {};
    activeFamilies.forEach((family) => {
      const shadesMap = FLAT_DESIGN_PALETTE_DATA[family];
      const validShades: Record<string, { hex: string; type: 'Lighter' | 'Darker' }> = {};

      Object.entries(shadesMap).forEach(([colorName, spec]) => {
        const isQueryMatching = searchQuery.trim() === '' || 
          family.toLowerCase().includes(searchQuery.toLowerCase()) ||
          colorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.hex.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spec.type.toLowerCase().includes(searchQuery.toLowerCase());

        if (isQueryMatching) {
          validShades[colorName] = spec;
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in" id="flat-colors-view-root">
      
      {/* 1. Header Area styling */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#00FFD1] uppercase" style={{ color: accentColor }}>
            FLAT DESIGN PALETTE INDEX
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none">
            Flat Design <span className="text-[#00FFD1]" style={{ color: accentColor }}>Colors</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-medium">
            Symmetrical map index of official classic Flat UI Design color swatches. Programmatically explore each dual-layered color pair (Lighter vs. Darker) with live Euclidean coordinate matching, RGB, CMYK, HSL specs, and WCAG contrast ratio validators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-right font-mono text-[10px] text-slate-400">
            <span>REGISTRY SPEC:</span>
            <span className="text-orange-400 font-extrabold ml-1 uppercase">CLASSIC 20 ACCURACY</span>
          </div>
        </div>
      </div>

      {/* 2. Custom Hex Snapper Input */}
      <div className="w-full" id="flat-snapper-block">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-wider bg-orange-900/40 border border-orange-500/20 text-orange-300 px-3 py-1 rounded-xl">
              ADVANCED FLAT COLOR LOOKUP ENGINE
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-4 w-4 text-orange-450" />
              <span>Convert Custom Hex to nearest Flat design shade</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-slate-400 font-normal">
              Type or paste any target hex code to find the absolute closest spatial Euclidean coordinate matching the official classic Flat UI color matrix.
            </p>

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={customInputColor}
                  onChange={(e) => setCustomInputColor(e.target.value)}
                  maxLength={7}
                  placeholder="#1abc9c or gray"
                  className="w-full bg-[#020617]/80 rounded-xl border border-white/15 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-white uppercase tracking-wider outline-none focus:border-orange-555/50"
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

          {nearestFlatResult && (
            <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                <span className="text-slate-400">NEAREST FLAT EQUIVALENCE REPORT:</span>
                <span className="text-[#00FFD1] font-black tracking-widest" style={{ color: accentColor }}>MATCH FOUND</span>
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

                {/* Flat matched swatch */}
                <div className="flex items-center gap-3 bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                  <div 
                    className="h-12 w-12 rounded-xl border border-white/15 cursor-pointer hover:scale-105 transition-all shrink-0" 
                    style={{ backgroundColor: nearestFlatResult.hex }}
                    onClick={() => {
                      setActivePreview(nearestFlatResult);
                      setIsInspectorPopupOpen(true);
                    }}
                  />
                  <div className="font-mono flex-1">
                    <span className="text-[10px] text-orange-400 block font-black leading-none mb-1">NEAREST SWATCH FIT</span>
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => {
                          setActivePreview(nearestFlatResult);
                          setIsInspectorPopupOpen(true);
                        }}
                        className="text-xs font-extrabold text-white block hover:text-[#00FFD1] text-left uppercase text-white/90"
                      >
                        {nearestFlatResult.name}
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {nearestFlatResult.hex.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="pt-2 border-t border-white/5 mt-2 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => {
                    setActivePreview(nearestFlatResult);
                    setIsInspectorPopupOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 font-bold text-[10px] uppercase font-mono tracking-wider transition-all"
                >
                  Inspect Color Details
                </button>
                <button
                  onClick={() => {
                    const cleanName = nearestFlatResult.name.toLowerCase().replace(/\s+/g, '-');
                    handleCopy(`flat-${cleanName}`, 'Class identifier');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase font-mono tracking-wider transition-all flex items-center gap-1.5"
                >
                  <Code className="h-3 w-3" />
                  <span>Copy ID: flat-{nearestFlatResult.name.toLowerCase().replace(/\s+/g, '-')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Chart Filters & Symmetrical Grid Grid map */}
      <div className="space-y-6" id="flat-main-grid-area">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap gap-1.5" id="flat-category-filters">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all border cursor-pointer ${
                  selectedGroup === grp
                    ? 'bg-orange-500/10 text-white border-orange-500/30'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
                style={selectedGroup === grp ? { borderColor: accentColor, color: accentColor } : {}}
              >
                {grp}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                aria-label="Filter Flat design colors"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search amethyst, alizarin, #1abc9c..."
                className="bg-slate-950 rounded-xl border border-white/10 py-1.5 pl-8.5 pr-4 text-xs font-mono text-slate-200 outline-none focus:border-[#00FFD1]/50 w-56"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Families container map */}
        <div className="space-y-6 bg-slate-950/20 p-4 sm:p-6 rounded-3xl border border-white/5 shrink-0" id="flat-palette-families-grid">
          {Object.entries(filteredFamiliesWithSearchData).map(([family, shadesMap]) => (
            <div key={family} className="space-y-3 pb-4 border-b border-white/5 last:border-b-0 last:pb-0" id={`flat-family-${family.toLowerCase().replace(/\s+/g, '-')}`}>
              
              {/* Family header */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-white tracking-widest font-mono flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1abc9c]" style={{ backgroundColor: Object.values(shadesMap)[0]?.hex || '#fff' }} />
                  <span>{family} Colors</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400">COMPLEMENTARY LAYERS</span>
              </div>

              {/* Row Grid flow */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {Object.entries(shadesMap).map(([colorName, spec]) => {
                  const rgb = hexToRgb(spec.hex);
                  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                  const isLightText = hsl.l > 55;

                  const colorObj: FlatColorDetail = {
                    family,
                    name: colorName,
                    hex: spec.hex,
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    h: hsl.h,
                    s: hsl.s,
                    l: hsl.l,
                    type: spec.type
                  };

                  const isActive = activePreview.name === colorName;

                  return (
                    <div
                      key={colorName}
                      onClick={() => {
                        setActivePreview(colorObj);
                        setIsInspectorPopupOpen(true);
                      }}
                      className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isActive
                          ? 'border-white bg-[#020617] scale-[1.01] ring-1'
                          : 'border-white/5 bg-slate-950/40 hover:border-white/10 hover:bg-[#020617]/50'
                      }`}
                      style={isActive ? { borderColor: accentColor } : {}}
                    >
                      {/* Swatch visual container */}
                      <div 
                        className="w-full h-16 rounded-xl border border-white/5 shadow-inner transition-transform group-hover:scale-[1.01] flex items-center justify-center mb-2"
                        style={{ backgroundColor: spec.hex }}
                      >
                        <span className={`text-[9px] font-mono font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${
                          isLightText ? 'text-slate-950' : 'text-white'
                        }`}>
                          View Details
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="flex items-center justify-between leading-none">
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-white block">{colorName}</span>
                          <span className="text-[8px] font-mono text-slate-450 block uppercase tracking-wide opacity-50">
                            {spec.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-350 font-mono tracking-tighter opacity-70 group-hover:text-white transition-colors">
                          {spec.hex.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(filteredFamiliesWithSearchData).length === 0 && (
            <div className="text-center py-20 bg-white/2 border border-dashed border-white/5 rounded-3xl" id="flat-chart-empty-state">
              <Palette className="h-10 w-15 text-slate-600 mx-auto mb-3 animate-pulse" />
              <span className="text-sm font-bold text-slate-400 block">No classic Flat UI swatches matching query.</span>
              <p className="text-xs text-slate-500 mt-1">Try searching coordinate classes like Emerald, Clouds, or hex values like #1abc9c</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Display mock context pattern rendering */}
      <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 space-y-6" id="flat-pattern-preview-sandbox">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase" style={{ color: accentColor }}>
            MOCKUP MATRIX PLAYGROUND
          </span>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-4 w-4 text-orange-455" />
            <span>Interactive Styling Sandbox Combiner</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Mix and match Flat Design shades to instantly preview ambient color contrasts. High contrast ratios protect reading experiences on high-resolution screens.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            
            {/* Pickers */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Accent Primary Block Selection</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    const rgb = hexToRgb('#16a085');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'Aqua & Green', name: 'Green Sea', hex: '#16a085', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l, type: 'Darker' });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.name === 'Green Sea' ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#16a085] border border-white/10" />
                  <span>green-sea</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#e67e22');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'Yellow & Orange', name: 'Carrot', hex: '#e67e22', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l, type: 'Lighter' });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.name === 'Carrot' ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#e67e22] border border-white/10" />
                  <span>carrot</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#9b59b6');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'Blue & Purple', name: 'Amethyst', hex: '#9b59b6', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l, type: 'Lighter' });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.name === 'Amethyst' ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#9b59b6] border border-white/10" />
                  <span>amethyst</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono text-slate-400 block border-b border-white/5 pb-1">METER CONTRAST SCOREBOARD</span>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">WHITE CANVAS (#FFF):</span>
                <span className={`font-extrabold ${activeContrastWithWhite >= 4.5 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {activeContrastWithWhite.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">CHARCOAL CANVAS (#020617):</span>
                <span className={`font-extrabold ${activeContrastWithBlack >= 4.5 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {activeContrastWithBlack.toFixed(2)}:1
                </span>
              </div>
            </div>

          </div>

          {/* Sandbox display cards */}
          <div className="lg:col-span-7 bg-[#090d16] border border-white/5 rounded-3xl p-6 space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">AMBIENT RENDER OUTPUT</span>
            
            <div 
              className="p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6 flex flex-col justify-between"
              style={{ backgroundColor: activePreview.hex }}
            >
              <div className="space-y-2">
                <span className={`text-[10px] font-mono tracking-widest font-extrabold uppercase px-2.5 py-1 rounded-full border border-white/15 inline-block ${
                  activePreview.l > 55 ? 'text-slate-950 bg-black/5' : 'text-white bg-white/5'
                }`}>
                  flat ui {activePreview.name} ({activePreview.type})
                </span>
                <h4 className={`text-2.5xl font-black tracking-tight leading-tight ${
                  activePreview.l > 55 ? 'text-slate-950' : 'text-white'
                }`}>
                  Elegant visual pairing with Flat Design rules
                </h4>
                <p className={`text-xs leading-relaxed max-w-xl font-medium ${
                  activePreview.l > 55 ? 'text-slate-850' : 'text-slate-300'
                }`}>
                  Interactive UI elements adjust text layout values on demand to generate highly compliant specifications across responsive desktop frameworks.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="h-9 w-9 bg-white/15 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${
                    activePreview.l > 55 ? 'text-slate-950' : 'text-white'
                  }`}>Flat Spec Swatches</span>
                  <span className={`text-[10px] font-mono block ${
                    activePreview.l > 55 ? 'text-slate-800' : 'text-slate-400'
                  }`}>HEX CODE: {activePreview.hex.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clean utilities section integration */}
      <DesignUtilities theme={theme} siteConfig={siteConfig} />

      {/* 6. FAQ component mapping */}
      <FAQSection theme={theme} siteConfig={siteConfig} />

      {/* Interactive Popup Dynamic Color Inspector Modal (Popup must be more than 400px wide, exactly max-w-[450px]) */}
      <AnimatePresence>
        {isInspectorPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm" id="flat-popup-portal">
            {/* Backdrop click closer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInspectorPopupOpen(false)}
              className="fixed inset-0 cursor-pointer"
            />

            {/* Modal Card content (exactly max-w-[450px]) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[450px] bg-[#090d16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col"
              id="flat-popup-container"
            >
              {/* Top Title bar */}
              <div className="border-b border-white/5 px-5 py-4 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                  <span>FLAT COLOR INSPECTOR</span>
                </span>
                <button
                  onClick={() => setIsInspectorPopupOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Large Color Swatch Box */}
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
                    {activePreview.name} ({activePreview.type})
                  </span>
                  <span className="text-2xl sm:text-3.5xl font-black tracking-tighter leading-none block">{activePreview.hex.toUpperCase()}</span>
                </div>
              </div>

              {/* Specification Channels */}
              <div className="p-5 grid grid-cols-2 gap-4 bg-slate-950/20">
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">RGB:</span>
                    <span className="font-extrabold text-white">
                      {activePreview.r}, {activePreview.g}, {activePreview.b}
                    </span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">HSL:</span>
                    <span className="font-extrabold text-white">
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

              {/* Utility Code Snippets */}
              <div className="px-5 pb-5 pt-1 space-y-2 bg-[#020617] border-t border-white/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black block">WORKSPACE UTILITY CODES</span>
                <div className="grid grid-cols-1 gap-2">
                  
                  {/* Hex color copy */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2.5">
                    <code className="text-xs font-mono text-white">{activePreview.hex.toUpperCase()}</code>
                    <button 
                      onClick={() => handleCopy(activePreview.hex.toUpperCase(), 'Hex Color code')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy hex code"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Android Xml Color token representation */}
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-white/5 flex items-center justify-between gap-2.5">
                    <code className="text-[10px] font-mono text-white block truncate">
                      &lt;color name="flat_{activePreview.name.toLowerCase().replace(/\s+/g, '_')}"&gt;{activePreview.hex.toUpperCase()}&lt;/color&gt;
                    </code>
                    <button 
                      onClick={() => handleCopy(`<color name="flat_${activePreview.name.toLowerCase().replace(/\s+/g, '_')}">${activePreview.hex.toUpperCase()}</color>`, 'Android material XML item')}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Copy XML"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Footer Button panel */}
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
