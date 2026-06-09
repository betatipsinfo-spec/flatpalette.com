import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Copy, Check, Palette, Sparkles, Filter, ChevronRight, Hash, Eye, 
  RefreshCw, BarChart2, X, Sliders, Disc, HelpCircle, Compass, Zap, Layers, AlertCircle, Info, ShieldAlert, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import DesignUtilities from './DesignUtilities';
import FAQSection from './FAQSection';

interface MaterialColorsProps {
  theme: 'light' | 'dark';
  siteConfig: SiteConfig;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSendToGenerator?: (hexColor: string) => void;
}

interface MaterialColorDetail {
  family: string;
  shade: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
}

// Complete Google Material Design Color Palette Database Specification
const MATERIAL_FAMILIES_DATA: Record<string, Record<string, string>> = {
  'Red': {
    '50': '#FFEBEE', '100': '#FFCDD2', '200': '#EF9A9A', '300': '#E57373', '400': '#EF5350',
    '500': '#F44336', '600': '#E53935', '700': '#D32F2F', '800': '#C62828', '900': '#B71C1C',
    'A100': '#FF8A80', 'A200': '#FF5252', 'A400': '#FF1744', 'A700': '#D50000'
  },
  'Pink': {
    '50': '#FCE4EC', '100': '#F8BBD0', '200': '#F48FB1', '300': '#F06292', '400': '#EC407A',
    '500': '#E91E63', '600': '#D81B60', '700': '#C2185B', '800': '#AD1457', '900': '#880E4F',
    'A100': '#FF80AB', 'A200': '#FF4081', 'A400': '#F50057', 'A700': '#C51162'
  },
  'Purple': {
    '50': '#F3E5F5', '100': '#E1BEE7', '200': '#CE93D8', '300': '#BA68C8', '400': '#AB47BC',
    '500': '#9C27B0', '600': '#8E24AA', '700': '#7B1FA2', '800': '#6A1B9A', '900': '#4A148C',
    'A100': '#EA80FC', 'A200': '#E040FB', 'A400': '#D500F9', 'A700': '#AA00FF'
  },
  'Deep Purple': {
    '50': '#EDE7F6', '100': '#D1C4E9', '200': '#B39DDB', '300': '#9575CD', '400': '#7E57C2',
    '500': '#673AB7', '600': '#5E35B1', '700': '#512DA8', '800': '#4527A0', '900': '#311B92',
    'A100': '#B388FF', 'A200': '#7C4DFF', 'A400': '#651FFF', 'A700': '#6200EA'
  },
  'Indigo': {
    '50': '#E8EAF6', '100': '#C5CAE9', '200': '#9FA8DA', '300': '#7986CB', '400': '#5C6BC0',
    '500': '#3F51B5', '600': '#3949AB', '700': '#303F9F', '800': '#283593', '900': '#1A237E',
    'A100': '#8C9EFF', 'A200': '#536DFE', 'A400': '#3D5AFE', 'A700': '#304FFE'
  },
  'Blue': {
    '50': '#E3F2FD', '100': '#BBDEFB', '200': '#90CAF9', '300': '#64B5F6', '400': '#42A5F5',
    '500': '#2196F3', '600': '#1E88E5', '700': '#1976D2', '800': '#1565C0', '900': '#0D47A1',
    'A100': '#82B1FF', 'A200': '#448AFF', 'A400': '#2979FF', 'A700': '#2962FF'
  },
  'Light Blue': {
    '50': '#E1F5FE', '100': '#B3E5FC', '200': '#81D4FA', '300': '#4FC3F7', '400': '#29B6F6',
    '500': '#03A9F4', '600': '#0288D1', '700': '#0277BD', '800': '#01579B', '900': '#01579B',
    'A100': '#80D8FF', 'A200': '#40C4FF', 'A400': '#00B0FF', 'A700': '#0091EA'
  },
  'Cyan': {
    '50': '#E0F7FA', '100': '#B2EBF2', '200': '#80DEEA', '300': '#4DD0E1', '400': '#26C6DA',
    '500': '#00BCD4', '600': '#00ACC1', '700': '#0097A7', '800': '#00838F', '900': '#006064',
    'A100': '#84FFFF', 'A200': '#18FFFF', 'A400': '#00E5FF', 'A700': '#00B8D4'
  },
  'Teal': {
    '50': '#E0F2F1', '100': '#B2DFDB', '200': '#80CBC4', '300': '#4DB6AC', '400': '#26A69A',
    '500': '#009688', '600': '#00897B', '700': '#00796B', '800': '#00695C', '900': '#004D40',
    'A100': '#A7FFEB', 'A200': '#64FFDA', 'A400': '#1DE9B6', 'A700': '#00BFA5'
  },
  'Green': {
    '50': '#E8F5E9', '100': '#C8E6C9', '200': '#A5D6A7', '300': '#81C784', '400': '#66BB6A',
    '500': '#4CAF50', '600': '#43A047', '700': '#2E7D32', '800': '#1B5E20', '900': '#0D5302',
    'A100': '#B9F6CA', 'A200': '#69F0AE', 'A400': '#00E676', 'A700': '#00C853'
  },
  'Light Green': {
    '50': '#F1F8E9', '100': '#DCEDC8', '200': '#C5E1A5', '300': '#AED581', '400': '#9CCC65',
    '500': '#8BC34A', '600': '#7CB342', '700': '#689F38', '800': '#558B2F', '900': '#33691E',
    'A100': '#CCFF90', 'A200': '#B2FF59', 'A400': '#76FF03', 'A700': '#64DD17'
  },
  'Lime': {
    '50': '#F9FBE7', '100': '#F0F4C3', '200': '#E6EE9C', '300': '#DCE775', '400': '#D4E157',
    '500': '#CDDC39', '600': '#C0CA33', '700': '#AFB42B', '800': '#9E9D24', '900': '#827717',
    'A100': '#F4FF81', 'A200': '#EEFF41', 'A400': '#C6FF00', 'A700': '#AEEA00'
  },
  'Yellow': {
    '50': '#FFFDE7', '100': '#FFF9C4', '200': '#FFF59D', '300': '#FFF176', '400': '#FFEE58',
    '500': '#FFEB3B', '600': '#FDD835', '700': '#FBC02D', '800': '#F9A825', '900': '#F57F17',
    'A100': '#FFFF8D', 'A200': '#FFFF00', 'A400': '#FFEA00', 'A700': '#FFD600'
  },
  'Amber': {
    '50': '#FFF8E1', '100': '#FFECB3', '200': '#FFE082', '300': '#FFD54F', '400': '#FFCA28',
    '500': '#FFC107', '600': '#FFB300', '700': '#FFA000', '800': '#FF8F00', '900': '#FF6F00',
    'A100': '#FFE57F', 'A200': '#FFD740', 'A400': '#FFC400', 'A700': '#FFAB00'
  },
  'Orange': {
    '50': '#FFF3E0', '100': '#FFE0B2', '200': '#FFCC80', '300': '#FFB74D', '400': '#FFA726',
    '500': '#FF9800', '600': '#FB8C00', '700': '#F57C00', '800': '#EF6C00', '900': '#E65100',
    'A100': '#FFD180', 'A200': '#FFAB40', 'A400': '#FF9100', 'A700': '#FF6D00'
  },
  'Deep Orange': {
    '50': '#FBE9E7', '100': '#FFCCBC', '200': '#FFAB91', '300': '#FF8A65', '400': '#FF7043',
    '500': '#FF5722', '600': '#F4511E', '700': '#E64A19', '800': '#D84315', '900': '#BF360C',
    'A100': '#FF9E80', 'A200': '#FF6E40', 'A400': '#FF3D00', 'A700': '#DD2C00'
  },
  'Brown': {
    '50': '#EFEBE9', '100': '#D7CCC8', '200': '#BCAAA4', '300': '#A1887F', '400': '#8D6E63',
    '500': '#795548', '600': '#6D4C41', '700': '#5D4037', '800': '#4E342E', '900': '#3E2723'
  },
  'Grey': {
    '50': '#FAFAFA', '100': '#F5F5F5', '200': '#EEEEEE', '300': '#E0E0E0', '400': '#BDBDBD',
    '500': '#9E9E9E', '600': '#757575', '700': '#616161', '800': '#424242', '900': '#212121'
  },
  'Blue Grey': {
    '50': '#ECEFF1', '100': '#CFD8DC', '200': '#B0BEC5', '300': '#90A4AE', '400': '#78909C',
    '500': '#607D8B', '600': '#546E7A', '700': '#455A64', '800': '#37474F', '900': '#263238'
  }
};

export default function MaterialColors({ theme, siteConfig, showToast }: MaterialColorsProps) {
  const accentColor = siteConfig.primaryNeonAccent || '#00FFD1';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Inspector popup modal states
  const [isInspectorPopupOpen, setIsInspectorPopupOpen] = useState(false);
  
  // Custom interactive lookup states
  const [customInputColor, setCustomInputColor] = useState('#ff5722');
  const [nearestMaterialResult, setNearestMaterialResult] = useState<MaterialColorDetail | null>(null);

  // Initialize with Deep Orange 500 as active fallback preview
  const [activePreview, setActivePreview] = useState<MaterialColorDetail>({
    family: 'Deep Orange',
    shade: '500',
    hex: '#ff5722',
    r: 255,
    g: 87,
    b: 34,
    h: 14,
    s: 100,
    l: 57
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

  // Compile the entire flat catalog of all Material colors
  const fullMaterialDatabaseList = useMemo(() => {
    const list: MaterialColorDetail[] = [];
    Object.entries(MATERIAL_FAMILIES_DATA).forEach(([familyName, shadesMap]) => {
      Object.entries(shadesMap).forEach(([shadeStr, hexVal]) => {
        const rgb = hexToRgb(hexVal);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        list.push({
          family: familyName,
          shade: shadeStr,
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

  // Calculate standard Euclidean distance matching
  const findNearestMaterialColor = (targetHex: string): MaterialColorDetail => {
    const rgbInput = hexToRgb(targetHex);
    let bestMatch = fullMaterialDatabaseList[0];
    let minDiff = Infinity;

    fullMaterialDatabaseList.forEach((color) => {
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
        const matching = findNearestMaterialColor(query);
        setNearestMaterialResult(matching);
      }
    } catch {
      // quiet safe bypass
    }
  }, [customInputColor, fullMaterialDatabaseList]);

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

  const wcagScoresWithWhite = useMemo(() => {
    const ratio = activeContrastWithWhite;
    return {
      aaLarge: ratio >= 3.0,
      aaNormal: ratio >= 4.5,
      aaaLarge: ratio >= 4.5,
      aaaNormal: ratio >= 7.0,
    };
  }, [activeContrastWithWhite]);

  // Segment groups
  const groups = ['All', 'Primary Hues', 'Pastels & Accents', 'Neutrals & Grays'];

  const filterFamiliesByGroup = (group: string) => {
    const primaryHues = ['Red', 'Pink', 'Purple', 'Deep Purple', 'Indigo', 'Blue', 'Light Blue', 'Cyan', 'Teal', 'Green'];
    const accPastels = ['Light Green', 'Lime', 'Yellow', 'Amber', 'Orange', 'Deep Orange'];
    const neutrals = ['Brown', 'Grey', 'Blue Grey'];

    if (group === 'Primary Hues') return primaryHues;
    if (group === 'Pastels & Accents') return accPastels;
    if (group === 'Neutrals & Grays') return neutrals;
    return Object.keys(MATERIAL_FAMILIES_DATA);
  };

  const activeFamilies = useMemo(() => {
    return filterFamiliesByGroup(selectedGroup);
  }, [selectedGroup]);

  // Search filter matching
  const filteredFamiliesWithSearchData = useMemo(() => {
    const matches: Record<string, Record<string, string>> = {};
    activeFamilies.forEach((family) => {
      const shadesMap = MATERIAL_FAMILIES_DATA[family];
      const validShades: Record<string, string> = {};

      Object.entries(shadesMap).forEach(([shadeStr, hexVal]) => {
        const isQueryMatching = searchQuery.trim() === '' || 
          family.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shadeStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          hexVal.toLowerCase().includes(searchQuery.toLowerCase());

        if (isQueryMatching) {
          validShades[shadeStr] = hexVal;
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in" id="material-colors-view-root">
      
      {/* 1. Header Area styling */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#00FFD1] uppercase" style={{ color: accentColor }}>
            MATERIAL SPECIFICATION REGISTRY
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none">
            Material Design <span className="text-[#00FFD1]" style={{ color: accentColor }}>Colors</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl font-medium">
            Symmetrical map index of official Google Material Design color swatches. Programmatically explore each intensity group (50 to 900, plus custom A100–A700 accents) with live Euclidean coordinate matching, RGB, CMYK, HSL specs, and WCAG contrast ratio validators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-right font-mono text-[10px] text-slate-400">
            <span>REGISTRY SPEC:</span>
            <span className="text-amber-400 font-extrabold ml-1 uppercase">MATERIAL 2/3 ACCURACY</span>
          </div>
        </div>
      </div>

      {/* 2. Custom Hex Snapper Input */}
      <div className="w-full" id="material-snapper-block">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-wider bg-amber-900/40 border border-amber-500/20 text-amber-300 px-3 py-1 rounded-xl">
              ADVANCED COLOR METRIC COMPLIANCE
            </span>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-4 w-4 text-amber-400" />
              <span>Convert Custom Hex to nearest Material design shade</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed text-slate-400 font-normal">
              Type or paste any target hex code to find the absolute closest spatial Euclidean coordinate matching Google's standardized Material Design palette matrix.
            </p>

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={customInputColor}
                  onChange={(e) => setCustomInputColor(e.target.value)}
                  maxLength={7}
                  placeholder="#FF5722 or pink"
                  className="w-full bg-[#020617]/80 rounded-xl border border-white/15 py-2.5 pl-10 pr-4 text-xs font-mono font-bold text-white uppercase tracking-wider outline-none focus:border-amber-500/50"
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

          {nearestMaterialResult && (
            <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono border-b border-white/5 pb-2">
                <span className="text-slate-400">NEAREST MATERIAL EQUIVALENCE REPORT:</span>
                <span className="text-[#00FFD1] font-black tracking-widest" style={{ color: accentColor }}>CORRECT FIT</span>
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

                {/* Material matched swatch */}
                <div className="flex items-center gap-3 bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                  <div 
                    className="h-12 w-12 rounded-xl border border-white/15 cursor-pointer hover:scale-105 transition-all shrink-0" 
                    style={{ backgroundColor: nearestMaterialResult.hex }}
                    onClick={() => {
                      setActivePreview(nearestMaterialResult);
                      setIsInspectorPopupOpen(true);
                    }}
                  />
                  <div className="font-mono flex-1">
                    <span className="text-[10px] text-amber-400 block font-black leading-none mb-1">NEAREST SWATCH FIT</span>
                    <div className="flex items-center justify-between gap-2">
                      <button 
                        onClick={() => {
                          setActivePreview(nearestMaterialResult);
                          setIsInspectorPopupOpen(true);
                        }}
                        className="text-xs font-extrabold text-white block hover:text-[#00FFD1] text-left uppercase"
                      >
                        {nearestMaterialResult.family} ({nearestMaterialResult.shade})
                      </button>
                      <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {nearestMaterialResult.hex.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="pt-2 border-t border-white/5 mt-2 flex flex-wrap gap-2 justify-end">
                <button
                  onClick={() => {
                    setActivePreview(nearestMaterialResult);
                    setIsInspectorPopupOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-bold text-[10px] uppercase font-mono tracking-wider transition-all"
                >
                  Inspect Color Details
                </button>
                <button
                  onClick={() => {
                    const cleanFamily = nearestMaterialResult.family.toLowerCase().replace(/\s+/g, '-');
                    handleCopy(`color-${cleanFamily}-${nearestMaterialResult.shade}`, 'Class identifier');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase font-mono tracking-wider transition-all flex items-center gap-1.5"
                >
                  <Code className="h-3 w-3" />
                  <span>Copy ID: {nearestMaterialResult.family.toLowerCase().replace(/\s+/g, '-')}-{nearestMaterialResult.shade}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Chart Filters & Symmetrical Grid Grid map */}
      <div className="space-y-6" id="material-main-grid-area">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex flex-wrap gap-1.5" id="material-category-filters">
            {groups.map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all border cursor-pointer ${
                  selectedGroup === grp
                    ? 'bg-amber-500/10 text-white border-amber-500/30'
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
                aria-label="Filter Material colors"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deep orange, A700, #ff5722..."
                className="bg-slate-950 rounded-xl border border-white/10 py-1.5 pl-8.5 pr-4 text-xs font-mono text-slate-200 outline-none focus:border-[#00FFD1]/50 w-56"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Families container map */}
        <div className="space-y-6 bg-slate-950/20 p-4 sm:p-6 rounded-3xl border border-white/5 shrink-0" id="material-palette-families-grid">
          {Object.entries(filteredFamiliesWithSearchData).map(([family, shadesMap]) => (
            <div key={family} className="space-y-3 pb-4 border-b border-white/5 last:border-b-0 last:pb-0" id={`material-family-${family.toLowerCase().replace(/\s+/g, '-')}`}>
              
              {/* Family header */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-white tracking-widest font-mono flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: shadesMap['500'] || shadesMap['50'] || '#fff' }} />
                  <span>{family} Colors</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500">HEX CHANNELS</span>
              </div>

              {/* Row Grid flow */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-2">
                {Object.entries(shadesMap).map(([shadeStr, hexVal]) => {
                  const rgb = hexToRgb(hexVal);
                  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                  const isLightText = hsl.l > 55;

                  const colorObj: MaterialColorDetail = {
                    family,
                    shade: shadeStr,
                    hex: hexVal,
                    r: rgb.r,
                    g: rgb.g,
                    b: rgb.b,
                    h: hsl.h,
                    s: hsl.s,
                    l: hsl.l
                  };

                  const isActive = activePreview.family === family && activePreview.shade === shadeStr;

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
                      {/* Swatch visual container */}
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

                      {/* Info lines */}
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
            <div className="text-center py-20 bg-white/2 border border-dashed border-white/5 rounded-3xl" id="material-chart-empty-state">
              <Palette className="h-10 w-15 text-slate-600 mx-auto mb-3 animate-pulse" />
              <span className="text-sm font-bold text-slate-400 block">No Google Material swatches matching query.</span>
              <p className="text-xs text-slate-500 mt-1">Try searching coordinate classes like Red, A700 or hex values like #ffeb3b</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Display mock context pattern rendering */}
      <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 space-y-6" id="material-pattern-preview-sandbox">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase" style={{ color: accentColor }}>
            MOCKUP MATRIX PLAYGROUND
          </span>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-400" />
            <span>Interactive Styling Sandbox Combiner</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            Mix and match Material Design shades to instantly preview ambient color contrasts. High contrast ratios protect reading experiences on high-resolution screens.
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
                    const rgb = hexToRgb('#3f51b5');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'Indigo', shade: '500', hex: '#3f51b5', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'Indigo' && activePreview.shade === '500' ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#3f51b5] border border-white/10" />
                  <span>indigo-500</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#009688');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'Teal', shade: '500', hex: '#009688', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'Teal' && activePreview.shade === '500' ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#009688] border border-white/10" />
                  <span>teal-500</span>
                </button>

                <button
                  onClick={() => {
                    const rgb = hexToRgb('#e91e63');
                    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                    setActivePreview({ family: 'Pink', shade: '500', hex: '#e91e63', r: rgb.r, g: rgb.g, b: rgb.b, h: hsl.h, s: hsl.s, l: hsl.l });
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-mono leading-none flex items-center justify-between ${
                    activePreview.family === 'Pink' && activePreview.shade === '500' ? 'border-[#00FFD1] bg-white/5' : 'border-white/5 bg-slate-950/40 text-slate-300'
                  }`}
                >
                  <span className="h-3.5 w-3.5 rounded bg-[#e91e63] border border-white/10" />
                  <span>pink-500</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2.5">
              <span className="text-[10px] font-mono text-slate-400 block border-b border-white/5 pb-1">METER CONTRAST SCOREBOARD</span>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">WHITE CANVAS (#FFF):</span>
                <span className={`font-extrabold ${activeContrastWithWhite >= 4.5 ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {activeContrastWithWhite.toFixed(2)}:1
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">CHARCOAL CANVAS (#020617):</span>
                <span className={`font-extrabold ${activeContrastWithBlack >= 4.5 ? 'text-emerald-400' : 'text-pink-400'}`}>
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
                  material {activePreview.family} ({activePreview.shade})
                </span>
                <h4 className={`text-2.5xl font-black tracking-tight leading-tight ${
                  activePreview.l > 55 ? 'text-slate-950' : 'text-white'
                }`}>
                  Elegant visual pairing with Google spec guides
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
                  }`}>Material Spec Swatches</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm" id="material-popup-portal">
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
              id="material-popup-container"
            >
              {/* Top Title bar */}
              <div className="border-b border-white/5 px-5 py-4 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Sliders className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                  <span>MATERIAL COLOR INSPECTOR</span>
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
                    {activePreview.family} Color ({activePreview.shade})
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
                      &lt;color name="{activePreview.family.toLowerCase().replace(/\s+/g, '_')}_{activePreview.shade}"&gt;{activePreview.hex.toUpperCase()}&lt;/color&gt;
                    </code>
                    <button 
                      onClick={() => handleCopy(`<color name="${activePreview.family.toLowerCase().replace(/\s+/g, '_')}_${activePreview.shade}">${activePreview.hex.toUpperCase()}</color>`, 'Android material XML item')}
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
