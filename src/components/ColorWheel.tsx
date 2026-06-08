import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Copy, Check, Palette, Sparkles, Filter, ChevronRight, Hash, Eye, RefreshCw, BarChart2, X, Sliders, Disc, HelpCircle, Compass, Zap, Layers, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import { DATA_NAMED_COLORS } from '../data/colorNames';

interface ColorWheelProps {
  theme: 'light' | 'dark';
  siteConfig: SiteConfig;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  onSendToGenerator: (hexColor: string) => void;
}

// Coordinate conversions
interface Point {
  x: number;
  y: number;
}

// Color Converter Utilities
function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

// Convert Hex/RGB to HSL for text rendering
function getContrastColor(hex: string): 'light' | 'dark' {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.48 ? 'dark' : 'light';
}

function getWCAGScore(bgHex: string, fgHex: string): { ratio: number; normalText: string; largeText: string } {
  const getLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(bgHex) + 0.05;
  const l2 = getLuminance(fgHex) + 0.05;
  const ratio = l1 > l2 ? l1 / l2 : l2 / l1;

  let normalText = 'Fail';
  let largeText = 'Fail';

  if (ratio >= 7) {
    normalText = 'AAA (Pass)';
    largeText = 'AAA (Pass)';
  } else if (ratio >= 4.5) {
    normalText = 'AA (Pass)';
    largeText = 'AAA (Pass)';
  } else if (ratio >= 3) {
    normalText = 'Fail';
    largeText = 'AA (Pass)';
  }

  return { ratio: parseFloat(ratio.toFixed(2)), normalText, largeText };
}

export default function ColorWheel({ theme, siteConfig, showToast, onSendToGenerator }: ColorWheelProps) {
  // Active Color State (Red Hue 0, 100% Sat, 50% Lightness as Default Base)
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [hexInput, setHexInput] = useState('#FF0000');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Synchronize HEX code from input
  const activeHex = useMemo(() => {
    return hslToHex(hsl.h, hsl.s, hsl.l);
  }, [hsl]);

  const activeRgb = useMemo(() => {
    const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);
    return `${r}, ${g}, ${b}`;
  }, [hsl]);

  // Keep hex input field in sync with interactive changes unless user is currently editing it
  useEffect(() => {
    setHexInput(activeHex);
  }, [activeHex]);

  // Look for designer color names that closely match active color
  const matchedColorName = useMemo(() => {
    let closestName = "Custom Color";
    let minDistance = 999999;
    const activeRgbObj = hslToRgb(hsl.h, hsl.s, hsl.l);

    DATA_NAMED_COLORS.forEach((named) => {
      const parts = named.rgb.split(',').map((x) => parseInt(x.trim()));
      const d = Math.pow(activeRgbObj.r - parts[0], 2) + Math.pow(activeRgbObj.g - parts[1], 2) + Math.pow(activeRgbObj.b - parts[2], 2);
      if (d < minDistance) {
        minDistance = d;
        closestName = named.name;
      }
    });

    return closestName;
  }, [hsl]);

  // Handle manual Hhex code entry
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);

    const clean = val.replace("#", "").trim();
    if (clean.length === 3 || clean.length === 6) {
      const validHex = clean.length === 3
        ? `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`
        : `#${clean}`;
      
      const parsedHsl = hexToHsl(validHex);
      if (!isNaN(parsedHsl.h) && !isNaN(parsedHsl.s) && !isNaN(parsedHsl.l)) {
        setHsl(parsedHsl);
      }
    }
  };

  // Drag interaction math
  const handleWheelInteraction = (clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;

    // Radius constraints
    const maxR = rect.width / 2;
    const distance = Math.sqrt(x*x + y*y);

    // Dynamic calculations
    let deg = (Math.atan2(y, x) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    const h = Math.round(deg);
    const s = Math.min(100, Math.round((Math.min(distance, maxR) / maxR) * 100));

    setHsl(prev => ({ ...prev, h, s }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleWheelInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleWheelInteraction(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handleWheelInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.cancelable) {
      e.preventDefault();
    }
    if (e.touches.length > 0) {
      handleWheelInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const selectColorDirect = (hexCode: string) => {
    const updated = hexToHsl(hexCode);
    setHsl(updated);
    showToast(`Base color updated to ${hexCode}`, 'info');
  };

  const handleCopy = (hexCode: string, label: string) => {
    navigator.clipboard.writeText(hexCode);
    setCopiedColor(hexCode);
    showToast(`${label} copied: ${hexCode}`, 'success');
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Precise base conversions for wheel selector handles
  const pointerPosition = useMemo(() => {
    const radiusRatio = hsl.s / 100;
    const angleRad = (hsl.h * Math.PI) / 180;
    
    // In our 200px (or whatever sized container), let center be 50%
    const rPct = radiusRatio * 50; // Max radius is 50% of parent width
    const x = 50 + rPct * Math.cos(angleRad);
    const y = 50 + rPct * Math.sin(angleRad);

    return { x: `${x}%`, y: `${y}%` };
  }, [hsl]);

  // Color harmony formulations (W3C Standard algorithms)
  const harmonySchemes = useMemo(() => {
    const makeColorInfo = (h: number, s: number, l: number) => {
      const hex = hslToHex(h, s, l);
      return { h, s, l, hex };
    };

    // 1. Complementary (Opposite side)
    const comp = makeColorInfo((hsl.h + 180) % 360, hsl.s, hsl.l);

    // 2. Analogous (Neighboring steps)
    const ana1 = makeColorInfo((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
    const ana2 = makeColorInfo((hsl.h + 30) % 360, hsl.s, hsl.l);

    // 3. Triadic (3 steps evenly spaced)
    const tri1 = makeColorInfo((hsl.h + 120) % 360, hsl.s, hsl.l);
    const tri2 = makeColorInfo((hsl.h + 240) % 360, hsl.s, hsl.l);

    // 4. Split Complementary (Adjacent to complementary)
    const split1 = makeColorInfo((hsl.h + 150) % 360, hsl.s, hsl.l);
    const split2 = makeColorInfo((hsl.h + 210) % 360, hsl.s, hsl.l);

    // 5. Tetradic / Rectangle (4 steps)
    const tet1 = makeColorInfo((hsl.h + 90) % 360, hsl.s, hsl.l);
    const tet2 = makeColorInfo((hsl.h + 180) % 360, hsl.s, hsl.l);
    const tet3 = makeColorInfo((hsl.h + 270) % 360, hsl.s, hsl.l);

    // 6. Monochromatic Array
    const mono = [
      makeColorInfo(hsl.h, Math.max(15, hsl.s - 45), Math.min(85, hsl.l + 25)),
      makeColorInfo(hsl.h, Math.max(25, hsl.s - 25), Math.min(75, hsl.l + 12)),
      makeColorInfo(hsl.h, hsl.s, hsl.l),
      makeColorInfo(hsl.h, Math.min(100, hsl.s + 10), Math.max(25, hsl.l - 12)),
      makeColorInfo(hsl.h, Math.min(100, hsl.s + 20), Math.max(15, hsl.l - 25))
    ];

    return {
      complementary: [makeColorInfo(hsl.h, hsl.s, hsl.l), comp],
      analogous: [ana1, makeColorInfo(hsl.h, hsl.s, hsl.l), ana2],
      triadic: [makeColorInfo(hsl.h, hsl.s, hsl.l), tri1, tri2],
      splitComplementary: [makeColorInfo(hsl.h, hsl.s, hsl.l), split1, split2],
      tetradic: [makeColorInfo(hsl.h, hsl.s, hsl.l), tet1, tet2, tet3],
      monochromatic: mono
    };
  }, [hsl]);

  // Shades / Tints / Tones Arrays (10-step conversions)
  const modifiersScale = useMemo(() => {
    const shades: string[] = [];
    const tints: string[] = [];
    const tones: string[] = [];

    // Base inputs
    const { h, s, l } = hsl;

    for (let i = 0; i < 10; i++) {
      // Shades: interpolate Lightness from base to 0 (black)
      const factor = i / 9;
      const shadeL = Math.max(0, Math.round(l * (1 - factor)));
      shades.push(hslToHex(h, s, shadeL));

      // Tints: interpolate Lightness from base to 100 (white)
      const tintL = Math.min(100, Math.round(l + (100 - l) * factor));
      tints.push(hslToHex(h, s, tintL));

      // Tones: interpolate Saturation from base to 0 (gray tinting)
      const toneS = Math.max(0, Math.round(s * (1 - factor)));
      tones.push(hslToHex(h, toneS, l));
    }

    return { shades, tints, tones };
  }, [hsl]);

  // Dynamic WCAG checks
  const wcagWhiteText = getWCAGScore(activeHex, '#FFFFFF');
  const wcagBlackText = getWCAGScore(activeHex, '#000000');

  // Trigger random coords on demand
  const triggerRandomizer = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 41) + 60; // 60% to 100% saturation
    const l = Math.floor(Math.random() * 31) + 35; // 35% to 65% lightness
    setHsl({ h, s, l });
    showToast("Cosmic celestial point randomized!", "info");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10"
      id="color-wheel-root"
    >
      {/* 1. Header Information Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" id="color-wheel-intro">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-[#00FFD1] text-[10px] font-mono font-black uppercase tracking-widest leading-none">
            <Compass className="h-4 w-4 animate-spin-slow" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
            <span>Harmonic Space Synthesizer</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
            Interactive Color Wheel
          </h2>
          <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Explore harmonic frequencies and classic geometry templates. Pick hues, preview color formulas, scale coordinates, and run WCAG contrast checks automatically.
          </p>
        </div>

        {/* Dynamic Workspace Quick Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerRandomizer}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
              theme === 'light'
                ? 'text-slate-700 bg-white border-slate-200 hover:border-slate-350 shadow-sm'
                : 'text-slate-300 bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Random Base</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Header Bar Workspace Redesign (Requested "Input to Header") */}
      <div 
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          theme === 'light'
            ? 'bg-gradient-to-r from-slate-50 to-white border-slate-200 text-slate-800'
            : 'bg-gradient-to-r from-[#020617]/90 to-[#090d16] border-white/5 text-white'
        }`}
        id="color-wheel-workspace-banner"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Main Selected Preview Block */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl shadow-lg border border-black/10 shrink-0 transition-all duration-300 relative group flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: activeHex }}
              onClick={() => handleCopy(activeHex, 'Active Hex')}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <Copy className="h-4 w-4 text-white drop-shadow" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <span className={`text-[9px] font-black uppercase tracking-widest font-mono ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                Matched Color Name
              </span>
              <h3 className={`text-lg font-black truncate leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {matchedColorName}
              </h3>
              <p className={`text-[11px] font-mono leading-none ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                HSL({hsl.h}°, {hsl.s}%, {hsl.l}%)
              </p>
            </div>
          </div>

          {/* Core Hex Input & HTML Color Picker Block (Header integration requested) */}
          <div className="md:col-span-5 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <Hash className="h-4 w-4 text-slate-450" />
              </div>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                maxLength={7}
                placeholder="#FF0000"
                className={`w-full pl-9 pr-12 py-3 bg-transparent rounded-xl text-sm font-mono font-bold border outline-none transition-all ${
                  theme === 'light'
                    ? 'border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400'
                    : 'border-white/5 text-white focus:bg-[#020617] focus:border-[#00FFD1]/30'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {/* HTML native picker button styled elegantly */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-black/10 cursor-pointer shadow-inner">
                  <input
                    type="color"
                    value={activeHex}
                    onChange={(e) => {
                      const updated = hexToHsl(e.target.value);
                      setHsl(updated);
                    }}
                    className="absolute inset-0 w-10 h-10 -translate-x-2 -translate-y-2 cursor-pointer p-0 border-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopy(activeHex, 'Active Hex')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-330'
              }`}
              title="Copy Hex Code"
            >
              {copiedColor === activeHex ? (
                <Check className="h-4 w-4 text-emerald-400 animate-bounce" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Quick Real-Time Channel Readouts */}
          <div className="md:col-span-3 flex justify-between md:justify-around text-xs font-mono font-bold">
            <div className="text-center">
              <span className={`block text-[8px] uppercase tracking-wider ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>RGB Value</span>
              <span className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>{activeRgb}</span>
            </div>
            <div className="text-center border-l border-white/5 pl-4 md:pl-0">
              <span className={`block text-[8px] uppercase tracking-wider ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Hex Code</span>
              <span className="text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>{activeHex}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Main Split Workspace: Left Interactive Wheel, Right Contrast Preview & Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE WHEEL PANEL (45% size equivalent) */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            className={`p-6 sm:p-8 rounded-2xl border flex flex-col items-center justify-center space-y-6 ${
              theme === 'light'
                ? 'bg-white border-slate-200'
                : 'bg-[#020617]/40 border-white/5'
            }`}
          >
            {/* Real Wheel Controller Body */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 select-none" id="color-wheel-circle-container">
              {/* Polar gradients overlaid: Conic represents Hue range, Radial represents saturation */}
              <div
                ref={wheelRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="w-full h-full rounded-full cursor-crosshair relative border-4 border-slate-900/10 shadow-xl overflow-hidden"
                style={{
                  background: `
                    radial-gradient(circle, #ffffff 0%, transparent 100%),
                    conic-gradient(from 90deg, 
                      #ff0000 0deg, 
                      #ffff00 60deg, 
                      #00ff00 120deg, 
                      #00ffff 180deg, 
                      #0000ff 240deg, 
                      #ff00ff 300deg, 
                      #ff0000 360deg
                    )
                  `,
                }}
              >
                {/* Visual Circle Overlays: rings displaying target distances */}
                <div className="absolute inset-[25%] rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-[50%] rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-[75%] rounded-full border border-white/10 pointer-events-none" />

                {/* Tactical Indicator Crosshair/Pointer */}
                <div
                  className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white bg-slate-950 shadow-lg shadow-black/50 pointer-events-none flex items-center justify-center"
                  style={{
                    left: pointerPosition.x,
                    top: pointerPosition.y,
                    boxShadow: '0 0 8px rgba(0,0,0,0.5), inset 0 0 2px rgba(255,255,255,0.8)'
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeHex }} />
                </div>
              </div>
            </div>

            {/* Lightness Slider Companion Control */}
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-xs font-bold font-mono">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Lightness Slider:</span>
                <span className="text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>{hsl.l}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-500">Dark</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => setHsl(prev => ({ ...prev, l: parseInt(e.target.value) }))}
                  style={{
                    background: `linear-gradient(to right, #000000 0%, ${hslToHex(hsl.h, hsl.s, 50)} 50%, #ffffff 100%)`
                  }}
                  className="flex-1 h-3.5 rounded-lg appearance-none cursor-pointer border border-white/10 outline-none"
                />
                <span className="text-[10px] font-mono text-slate-500">Lite</span>
              </div>
            </div>

            {/* Dynamic Numeric Readout Coordinates block */}
            <div className="w-full grid grid-cols-3 gap-2.5 pt-3 border-t border-white/5 text-center text-xs font-mono font-bold">
              <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'}`}>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest">HUE</span>
                <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{hsl.h}°</span>
              </div>
              <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'}`}>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest">SAT</span>
                <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{hsl.s}%</span>
              </div>
              <div className={`p-2 rounded-xl ${theme === 'light' ? 'bg-slate-50' : 'bg-white/5'}`}>
                <span className="block text-[8px] text-slate-500 uppercase tracking-widest">LIGHT</span>
                <span className={theme === 'light' ? 'text-slate-800' : 'text-white'}>{hsl.l}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROFESSIONAL CONTRAST ANALYZER & WCAG STANDARDS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Visual WCAG Compatibility Tester CARD */}
          <div 
            className={`p-5 sm:p-6 rounded-2xl border ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#020617]/40 border-white/5'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-purple-400" />
              <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                WCAG Contrast Score Advisor
              </h4>
            </div>

            {/* Custom Interactive Contrast Simulator cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* White Text on Base Color */}
              <div className="rounded-xl overflow-hidden border border-white/10 flex flex-col">
                <div 
                  className="p-5 flex-1 flex flex-col justify-center items-center text-center transition-all min-h-[90px]"
                  style={{ backgroundColor: activeHex }}
                >
                  <span className="text-white text-base font-black tracking-tight">White Text</span>
                  <p className="text-white/80 text-[10px] uppercase font-mono tracking-wider mt-1">Luminance Contrast</p>
                </div>
                <div className={`p-3 border-t text-xs font-mono grid grid-cols-2 text-center ${
                  theme === 'light' ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-[#090d16] border-white/5 text-slate-300'
                }`}>
                  <div>
                    <span className="block text-[8px] text-slate-500">Normal Size</span>
                    <span className={`font-bold ${wcagWhiteText.normalText.includes('Pass') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {wcagWhiteText.normalText}
                    </span>
                  </div>
                  <div className="border-l border-white/5">
                    <span className="block text-[8px] text-slate-500">Large Size</span>
                    <span className={`font-bold ${wcagWhiteText.largeText.includes('Pass') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {wcagWhiteText.largeText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Black Text on Base Color */}
              <div className="rounded-xl overflow-hidden border border-white/10 flex flex-col">
                <div 
                  className="p-5 flex-1 flex flex-col justify-center items-center text-center transition-all min-h-[90px]"
                  style={{ backgroundColor: activeHex }}
                >
                  <span className="text-slate-950 text-base font-black tracking-tight">Dark Text</span>
                  <p className="text-slate-950/80 text-[10px] uppercase font-mono tracking-wider mt-1">Luminance Contrast</p>
                </div>
                <div className={`p-3 border-t text-xs font-mono grid grid-cols-2 text-center ${
                  theme === 'light' ? 'bg-slate-50 border-slate-100 text-slate-700' : 'bg-[#090d16] border-white/5 text-slate-300'
                }`}>
                  <div>
                    <span className="block text-[8px] text-slate-500">Normal Size</span>
                    <span className={`font-bold ${wcagBlackText.normalText.includes('Pass') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {wcagBlackText.normalText}
                    </span>
                  </div>
                  <div className="border-l border-white/5">
                    <span className="block text-[8px] text-slate-500">Large Size</span>
                    <span className={`font-bold ${wcagBlackText.largeText.includes('Pass') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {wcagBlackText.largeText}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Contrast Readout Info Banner */}
            <div className={`mt-4 p-3 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed ${
              theme === 'light' ? 'bg-slate-50 text-slate-600' : 'bg-slate-900/40 text-slate-400'
            }`}>
              <Info className="h-4 w-4 shrink-0 text-[#00FFD1] mt-0.5" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
              <span>
                WCAG guidelines advise a ratio of at least <strong>4.5:1</strong> for normal text and <strong>3:1</strong> for large text (18pt+) to pass intermediate AA standards. For enhanced AAA accessibility compliance, a <strong>7:1</strong> threshold is required.
              </span>
            </div>
          </div>

          {/* Quick Design Simulator Block (Gives active visual value check on live component previews) */}
          <div 
            className={`p-6 rounded-2xl border transition-all ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/40 border-white/5'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
              <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Workspace Vector Mockup
              </h4>
            </div>

            {/* Simulated Live Interface Panel */}
            <div 
              className="p-5 rounded-xl flex flex-col justify-between h-36 transition-all border border-black/10 shadow-inner overflow-hidden relative"
              style={{ backgroundColor: activeHex }}
            >
              {/* Abs grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-0.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider font-mono px-2 py-0.5 rounded-full bg-black/15 shadow-sm border border-white/5 ${
                    getContrastColor(activeHex) === 'light' ? 'text-white' : 'text-black'
                  }`}>
                    UI Node 09
                  </span>
                  <h5 className={`text-base font-black tracking-tight ${
                    getContrastColor(activeHex) === 'light' ? 'text-white' : 'text-black'
                  }`}>
                    Dynamic Contrast Test
                  </h5>
                </div>
                <div className={`text-right font-mono text-[9px] font-bold ${
                  getContrastColor(activeHex) === 'light' ? 'text-white/70' : 'text-black/70'
                }`}>
                  Hex: {activeHex}
                </div>
              </div>

              <div className="flex items-end justify-between relative z-10 pt-4">
                <p className={`text-[11px] leading-snug font-medium max-w-sm ${
                  getContrastColor(activeHex) === 'light' ? 'text-white/80' : 'text-black/80'
                }`}>
                  Perfect for dashboard elements, typography vectors, and atmospheric backgrounds.
                </p>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-white" />
                  <div className="w-2 h-2 rounded-full bg-black/40" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Shades, Tints, and Tones Scale Row (Direct Color-Hex feature implementation) */}
      <div className="space-y-6" id="shades-tints-panel">
        <div className="space-y-1">
          <h4 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Tints, Shades & Tones Arrays
          </h4>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Classic mathematical adjustments. Click on any block to set it as the new active color or copy coordinates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Shades Section (Adding black) */}
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#020617]/40 border-white/5'}`}>
            <span className={`text-xs font-black uppercase tracking-wider block mb-3 font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Shades Scale <span className="text-[10px] text-slate-500 lowercase">(adding black)</span>
            </span>
            <div className="flex flex-col gap-1.5">
              {modifiersScale.shades.map((hex, i) => (
                <div
                  key={`shade-${i}`}
                  onClick={() => selectColorDirect(hex)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform text-xs font-mono font-bold group border border-transparent hover:border-white/10"
                  style={{ backgroundColor: hex }}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] bg-black/15 uppercase ${
                    getContrastColor(hex) === 'light' ? 'text-white/90' : 'text-black/95'
                  }`}>
                    {i === 0 ? 'Base' : `${Math.round(i * 11.1)}% shade`}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={getContrastColor(hex) === 'light' ? 'text-white' : 'text-black'}>{hex}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(hex, 'Shade Hex');
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 hover:bg-black/25 ${
                        getContrastColor(hex) === 'light' ? 'text-white' : 'text-black'
                      }`}
                      title="Copy hex code"
                    >
                      {copiedColor === hex ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tints Section (Adding white) */}
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#020617]/40 border-white/5'}`}>
            <span className={`text-xs font-black uppercase tracking-wider block mb-3 font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Tints Scale <span className="text-[10px] text-slate-500 lowercase">(adding white)</span>
            </span>
            <div className="flex flex-col gap-1.5">
              {modifiersScale.tints.map((hex, i) => (
                <div
                  key={`tint-${i}`}
                  onClick={() => selectColorDirect(hex)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform text-xs font-mono font-bold group border border-transparent hover:border-white/10"
                  style={{ backgroundColor: hex }}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] bg-black/15 uppercase ${
                    getContrastColor(hex) === 'light' ? 'text-white/90' : 'text-black/95'
                  }`}>
                    {i === 0 ? 'Base' : `${Math.round(i * 11.1)}% tint`}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={getContrastColor(hex) === 'light' ? 'text-white' : 'text-black'}>{hex}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(hex, 'Tint Hex');
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 hover:bg-black/25 ${
                        getContrastColor(hex) === 'light' ? 'text-white' : 'text-black'
                      }`}
                      title="Copy hex code"
                    >
                      {copiedColor === hex ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tones Section (Adding gray) */}
          <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#020617]/40 border-white/5'}`}>
            <span className={`text-xs font-black uppercase tracking-wider block mb-3 font-mono ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              Tones Scale <span className="text-[10px] text-slate-500 lowercase">(desaturating)</span>
            </span>
            <div className="flex flex-col gap-1.5">
              {modifiersScale.tones.map((hex, i) => (
                <div
                  key={`tone-${i}`}
                  onClick={() => selectColorDirect(hex)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform text-xs font-mono font-bold group border border-transparent hover:border-white/10"
                  style={{ backgroundColor: hex }}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] bg-black/15 uppercase ${
                    getContrastColor(hex) === 'light' ? 'text-white/90' : 'text-black/95'
                  }`}>
                    {i === 0 ? 'Base' : `${Math.round(i * 11.1)}% tone`}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={getContrastColor(hex) === 'light' ? 'text-white' : 'text-black'}>{hex}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(hex, 'Tone Hex');
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 hover:bg-black/25 ${
                        getContrastColor(hex) === 'light' ? 'text-white' : 'text-black'
                      }`}
                      title="Copy hex code"
                    >
                      {copiedColor === hex ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 5. Geometric Color Harmony Cards (Dynamic Redesign matching Color-Hex format) */}
      <div className="space-y-6" id="geometric-harmony-formulas">
        <div className="space-y-1">
          <h4 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Computed Color Harmonies
          </h4>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Mathematical formulas matching color-wheel intersections. Perfect to use as balanced palettes or theme configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Complementary */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/30 border-white/5'
          }`}>
            <div className="mb-4">
              <span className={`text-xs font-black uppercase tracking-wider block font-mono ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Complementary Pair (180°)
              </span>
              <p className="text-[10px] text-slate-500 leading-snug">Two direct opposite polar coordinates on the wheel layout.</p>
            </div>
            <div className="flex h-16 rounded-xl overflow-hidden border border-black/10">
              {harmonySchemes.complementary.map((c, idx) => (
                <div
                  key={`comp-${idx}`}
                  onClick={() => selectColorDirect(c.hex)}
                  className="flex-1 flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.12] relative group"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] uppercase font-mono font-bold leading-none ${
                    getContrastColor(c.hex) === 'light' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.hex}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-black/30 text-white font-mono">Use Base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analogous */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/30 border-white/5'
          }`}>
            <div className="mb-4">
              <span className={`text-xs font-black uppercase tracking-wider block font-mono ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Analogous Spectrum (±30°)
              </span>
              <p className="text-[10px] text-slate-500 leading-snug">Adjacent neighbors flanking the base color for warm/cool sets.</p>
            </div>
            <div className="flex h-16 rounded-xl overflow-hidden border border-black/10">
              {harmonySchemes.analogous.map((c, idx) => (
                <div
                  key={`ana-${idx}`}
                  onClick={() => selectColorDirect(c.hex)}
                  className="flex-1 flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.12] relative group"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] uppercase font-mono font-bold leading-none ${
                    getContrastColor(c.hex) === 'light' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.hex}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-black/30 text-white font-mono">Use Base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triadic */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/30 border-white/5'
          }`}>
            <div className="mb-4">
              <span className={`text-xs font-black uppercase tracking-wider block font-mono ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Triadic Triangle (120°)
              </span>
              <p className="text-[10px] text-slate-500 leading-snug">Three coordinates spaced evenly forming an equilateral triangle.</p>
            </div>
            <div className="flex h-16 rounded-xl overflow-hidden border border-black/10">
              {harmonySchemes.triadic.map((c, idx) => (
                <div
                  key={`tri-${idx}`}
                  onClick={() => selectColorDirect(c.hex)}
                  className="flex-1 flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.12] relative group"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] uppercase font-mono font-bold leading-none ${
                    getContrastColor(c.hex) === 'light' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.hex}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-black/30 text-white font-mono">Use Base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Split Complementary */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/30 border-white/5'
          }`}>
            <div className="mb-4">
              <span className={`text-xs font-black uppercase tracking-wider block font-mono ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Split-Complementary (150° / 210°)
              </span>
              <p className="text-[10px] text-slate-500 leading-snug">Deflects the complementary point into flanking left/right coordinates.</p>
            </div>
            <div className="flex h-16 rounded-xl overflow-hidden border border-black/10">
              {harmonySchemes.splitComplementary.map((c, idx) => (
                <div
                  key={`split-${idx}`}
                  onClick={() => selectColorDirect(c.hex)}
                  className="flex-1 flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.12] relative group"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] uppercase font-mono font-bold leading-none ${
                    getContrastColor(c.hex) === 'light' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.hex}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-black/30 text-white font-mono">Use Base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tetradic */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/30 border-white/5'
          }`}>
            <div className="mb-4">
              <span className={`text-xs font-black uppercase tracking-wider block font-mono ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Tetradic Rectangle (90°)
              </span>
              <p className="text-[10px] text-slate-500 leading-snug font-sans truncate">Four coordinates spaced evenly forming a rectangular box.</p>
            </div>
            <div className="flex h-16 rounded-xl overflow-hidden border border-black/10">
              {harmonySchemes.tetradic.map((c, idx) => (
                <div
                  key={`tet-${idx}`}
                  onClick={() => selectColorDirect(c.hex)}
                  className="flex-1 flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.12] relative group"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] uppercase font-mono font-bold leading-none ${
                    getContrastColor(c.hex) === 'light' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.hex}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-black/30 text-white font-mono">Use Base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monochromatic */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#020617]/30 border-white/5'
          }`}>
            <div className="mb-4">
              <span className={`text-xs font-black uppercase tracking-wider block font-mono ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Monochromatic Variant Range
              </span>
              <p className="text-[10px] text-slate-500 leading-snug">Five light and saturation step variants utilizing a fixed hue coordinate.</p>
            </div>
            <div className="flex h-16 rounded-xl overflow-hidden border border-black/10">
              {harmonySchemes.monochromatic.map((c, idx) => (
                <div
                  key={`mono-${idx}`}
                  onClick={() => selectColorDirect(c.hex)}
                  className="flex-1 flex flex-col justify-end p-2 cursor-pointer transition-all hover:flex-[1.12] relative group"
                  style={{ backgroundColor: c.hex }}
                >
                  <span className={`text-[10px] uppercase font-mono font-bold leading-none ${
                    getContrastColor(c.hex) === 'light' ? 'text-white' : 'text-slate-900'
                  }`}>
                    {c.hex}
                  </span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase px-1 rounded bg-black/30 text-white font-mono">Use Base</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </motion.div>
  );
}
