import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Copy, Check, Palette, Sparkles, Sliders, Info, HelpCircle, 
  Layers, RefreshCw, Smartphone, Code, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import FAQSection from './FAQSection';
import DesignUtilities from './DesignUtilities';

interface ColorPickerProps {
  theme: 'light' | 'dark';
  siteConfig: SiteConfig;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSendToGenerator?: (hexColor: string) => void;
}

// Color Utility Converters
// HSV is also known as HSB
function hsvToRgb(h: number, s: number, v: number) {
  const sFraction = s / 100;
  const vFraction = v / 100;
  const c = vFraction * sFraction;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vFraction - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h <= 360) { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHsv(r: number, g: number, b: number) {
  const rRatio = r / 255;
  const gRatio = g / 255;
  const bRatio = b / 255;
  const max = Math.max(rRatio, gRatio, bRatio);
  const min = Math.min(rRatio, gRatio, bRatio);
  const delta = max - min;
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case rRatio: h = (gRatio - bRatio) / delta + (gRatio < bRatio ? 6 : 0); break;
      case gRatio: h = (bRatio - rRatio) / delta + 2; break;
      case bRatio: h = (rRatio - gRatio) / delta + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const rRatio = r / 255, gRatio = g / 255, bRatio = b / 255;
  const max = Math.max(rRatio, gRatio, bRatio), min = Math.min(rRatio, gRatio, bRatio);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rRatio: h = (gRatio - bRatio) / d + (gRatio < bRatio ? 6 : 0); break;
      case gRatio: h = (bRatio - rRatio) / d + 2; break;
      case bRatio: h = (rRatio - gRatio) / d + 4; break;
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
  const sFrac = s / 100;
  const lFrac = l / 100;
  const c = (1 - Math.abs(2 * lFrac - 1)) * sFrac;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lFrac - c / 2;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h <= 360) { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const hexPart = (channel: number) => {
    const raw = clamp(channel).toString(16);
    return raw.length === 1 ? "0" + raw : raw;
  };
  return "#" + hexPart(r) + hexPart(g) + hexPart(b);
}

function hexToRgb(hex: string) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
  }
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return { r, g, b };
}

function rgbToCmyk(r: number, g: number, b: number) {
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
}

function cmykToRgb(c: number, m: number, y: number, k: number) {
  const cFrac = c / 100, mFrac = m / 100, yFrac = y / 100, kFrac = k / 100;
  const r = Math.round(255 * (1 - cFrac) * (1 - kFrac));
  const g = Math.round(255 * (1 - mFrac) * (1 - kFrac));
  const b = Math.round(255 * (1 - yFrac) * (1 - kFrac));
  return { r, g, b };
}

// Relative luminance for contrast testing (WCAG 2.1)
function getRelativeLuminance(r: number, g: number, b: number) {
  const transform = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function getContrastRatio(l1: number, l2: number) {
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

export default function ColorPicker({ theme, siteConfig, showToast, onSendToGenerator }: ColorPickerProps) {
  const accentColor = siteConfig.primaryNeonAccent || '#00FFD1';
  
  // Master Color HSV & Alpha state
  const [h, setH] = useState<number>(205); // Elegant Slate blue default
  const [s, setS] = useState<number>(85);
  const [v, setV] = useState<number>(90);
  const [alpha, setAlpha] = useState<number>(100);

  // References for coordinates sliders dragging
  const gridRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const alphaSliderRef = useRef<HTMLDivElement>(null);

  // Computed state
  const rgb = useMemo(() => hsvToRgb(h, s, v), [h, s, v]);
  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  // Input bindings (string state to allow fluid typings)
  const [hexInput, setHexInput] = useState<string>(hex);
  const [rInput, setRInput] = useState<string>(String(rgb.r));
  const [gInput, setGInput] = useState<string>(String(rgb.g));
  const [bInput, setBInput] = useState<string>(String(rgb.b));
  const [hInput, setHInput] = useState<string>(String(Math.round(h)));
  const [sInput, setSInput] = useState<string>(String(Math.round(s)));
  const [lInput, setLInput] = useState<string>(String(Math.round(hsl.l)));
  const [cyInput, setCyInput] = useState<string>(String(cmyk.c));
  const [mgInput, setMgInput] = useState<string>(String(cmyk.m));
  const [ylInput, setYlInput] = useState<string>(String(cmyk.y));
  const [kbInput, setKbInput] = useState<string>(String(cmyk.k));

  // Sync inputs with computed values except when user is actively editing
  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  useEffect(() => {
    setRInput(String(rgb.r));
    setGInput(String(rgb.g));
    setBInput(String(rgb.b));
  }, [rgb]);

  useEffect(() => {
    setHInput(String(Math.round(h)));
    setSInput(String(Math.round(s)));
    setLInput(String(Math.round(hsl.l)));
  }, [h, s, hsl.l]);

  useEffect(() => {
    setCyInput(String(cmyk.c));
    setMgInput(String(cmyk.m));
    setYlInput(String(cmyk.y));
    setKbInput(String(cmyk.k));
  }, [cmyk]);

  // Handle typing or change on Hex
  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    const clean = val.replace('#', '').trim();
    if (clean.length === 3 || clean.length === 6) {
      const parsedRgb = hexToRgb(clean);
      const parsedHsv = rgbToHsv(parsedRgb.r, parsedRgb.g, parsedRgb.b);
      setH(parsedHsv.h);
      setS(parsedHsv.s);
      setV(parsedHsv.v);
    }
  };

  // Handle updates on rgb
  const handleRgbInputChange = (channel: 'r' | 'g' | 'b', val: string) => {
    const num = Math.max(0, Math.min(255, parseInt(val) || 0));
    if (channel === 'r') { setRInput(val); const hsv = rgbToHsv(num, rgb.g, rgb.b); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
    if (channel === 'g') { setGInput(val); const hsv = rgbToHsv(rgb.r, num, rgb.b); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
    if (channel === 'b') { setBInput(val); const hsv = rgbToHsv(rgb.r, rgb.g, num); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
  };

  // Handle updates on hsl
  const handleHslInputChange = (channel: 'h' | 's' | 'l', val: string) => {
    const num = parseInt(val) || 0;
    if (channel === 'h') {
      const hClamped = Math.max(0, Math.min(360, num));
      setHInput(val);
      const newRgb = hslToRgb(hClamped, hsl.s, hsl.l);
      const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setH(hsv.h); setS(hsv.s); setV(hsv.v);
    }
    if (channel === 's') {
      const sClamped = Math.max(0, Math.min(100, num));
      setSInput(val);
      const newRgb = hslToRgb(h, sClamped, hsl.l);
      const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setH(hsv.h); setS(hsv.s); setV(hsv.v);
    }
    if (channel === 'l') {
      const lClamped = Math.max(0, Math.min(100, num));
      setLInput(val);
      const newRgb = hslToRgb(h, hsl.s, lClamped);
      const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setH(hsv.h); setS(hsv.s); setV(hsv.v);
    }
  };

  // Handle updates on CMYK
  const handleCmykInputChange = (channel: 'c' | 'm' | 'y' | 'k', val: string) => {
    const num = Math.max(0, Math.min(100, parseInt(val) || 0));
    if (channel === 'c') { setCyInput(val); const newRgb = cmykToRgb(num, cmyk.m, cmyk.y, cmyk.k); const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
    if (channel === 'm') { setMgInput(val); const newRgb = cmykToRgb(cmyk.c, num, cmyk.y, cmyk.k); const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
    if (channel === 'y') { setYlInput(val); const newRgb = cmykToRgb(cmyk.c, cmyk.m, num, cmyk.k); const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
    if (channel === 'k') { setKbInput(val); const newRgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, num); const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b); setH(hsv.h); setS(hsv.s); setV(hsv.v); }
  };

  // Coordinate math for Saturation-Value 2D canvas mouse interactions
  const updateGridFromCoords = (clientX: number, clientY: number) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;
    
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    setS(Math.round(x * 100));
    setV(Math.round((1 - y) * 100));
  };

  const handleGridMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    updateGridFromCoords(e.clientX, e.clientY);
    const onMouseMove = (moveEvent: MouseEvent) => {
      updateGridFromCoords(moveEvent.clientX, moveEvent.clientY);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleGridTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    updateGridFromCoords(touch.clientX, touch.clientY);
    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const moveTouch = moveEvent.touches[0];
      updateGridFromCoords(moveTouch.clientX, moveTouch.clientY);
    };
    const onTouchEnd = () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  // Hue rainbow slider dragging
  const updateHueFromCoords = (clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    setH(Math.round(x * 360));
  };

  const handleHueMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    updateHueFromCoords(e.clientX);
    const onMouseMove = (moveEvent: MouseEvent) => {
      updateHueFromCoords(moveEvent.clientX);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Alpha checker slider dragging
  const updateAlphaFromCoords = (clientX: number) => {
    if (!alphaSliderRef.current) return;
    const rect = alphaSliderRef.current.getBoundingClientRect();
    let x = (clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    setAlpha(Math.round(x * 100));
  };

  const handleAlphaMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    updateAlphaFromCoords(e.clientX);
    const onMouseMove = (moveEvent: MouseEvent) => {
      updateAlphaFromCoords(moveEvent.clientX);
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Apply a hex color from quick charts
  const applyHexColor = (targetHex: string) => {
    const rgbVal = hexToRgb(targetHex);
    const hsvVal = rgbToHsv(rgbVal.r, rgbVal.g, rgbVal.b);
    setH(hsvVal.h);
    setS(hsvVal.s);
    setV(hsvVal.v);
    showToast(`Loaded color: ${targetHex}`, 'success');
  };

  // Copy helper
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const handleCopy = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    showToast(`Copied ${title}: ${text}`, 'success');
    setTimeout(() => setCopiedValue(null), 2000);
  };

  // Generate Shades, Tints, and Tones charts
  // Shades: blend color with black (0, 0, 0)
  // Tints: blend color with white (255, 255, 255)
  // Tones: blend color with neutral medium grey (128, 128, 128)
  const blendColor = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, percent: number) => {
    const p = percent / 100;
    return rgbToHex(
      Math.round(r1 + (r2 - r1) * p),
      Math.round(g1 + (g2 - g1) * p),
      Math.round(b1 + (b2 - b1) * p)
    );
  };

  const tintsArray = useMemo(() => {
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(p => blendColor(rgb.r, rgb.g, rgb.b, 255, 255, 255, p));
  }, [rgb]);

  const shadesArray = useMemo(() => {
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(p => blendColor(rgb.r, rgb.g, rgb.b, 0, 0, 0, p));
  }, [rgb]);

  const tonesArray = useMemo(() => {
    return [10, 20, 30, 40, 50, 60, 70, 80, 90].map(p => blendColor(rgb.r, rgb.g, rgb.b, 128, 128, 128, p));
  }, [rgb]);

  // Generate Harmonies
  const harmonies = useMemo(() => {
    const getClampedH = (angle: number) => (h + angle + 360) % 360;
    
    // Complementary (+180°)
    const compRgb = hsvToRgb(getClampedH(180), s, v);
    
    // Analogous (-30°, +30°)
    const ana1Rgb = hsvToRgb(getClampedH(-30), s, v);
    const ana2Rgb = hsvToRgb(getClampedH(30), s, v);

    // Triadic (+120°, +240°)
    const tri1Rgb = hsvToRgb(getClampedH(120), s, v);
    const tri2Rgb = hsvToRgb(getClampedH(240), s, v);

    // Split complementary (+150°, +210°)
    const split1Rgb = hsvToRgb(getClampedH(150), s, v);
    const split2Rgb = hsvToRgb(getClampedH(210), s, v);

    // Tetradic (+90°, +180°, +270°)
    const tet1Rgb = hsvToRgb(getClampedH(90), s, v);
    const tet2Rgb = hsvToRgb(getClampedH(180), s, v);
    const tet3Rgb = hsvToRgb(getClampedH(270), s, v);

    // Monochromatic (Change Saturation and Value vectors)
    const mono1 = hsvToRgb(h, Math.max(0, s - 30), Math.min(100, v + 10));
    const mono2 = hsvToRgb(h, s, Math.max(0, v - 30));
    const mono3 = hsvToRgb(h, Math.max(0, s - 50), Math.min(100, v + 15));

    return [
      { name: 'Complementary', colors: [rgbToHex(compRgb.r, compRgb.g, compRgb.b)] },
      { name: 'Analogous', colors: [rgbToHex(ana1Rgb.r, ana1Rgb.g, ana1Rgb.b), hex, rgbToHex(ana2Rgb.r, ana2Rgb.g, ana2Rgb.b)] },
      { name: 'Triadic', colors: [hex, rgbToHex(tri1Rgb.r, tri1Rgb.g, tri1Rgb.b), rgbToHex(tri2Rgb.r, tri2Rgb.g, tri2Rgb.b)] },
      { name: 'Split Comp', colors: [hex, rgbToHex(split1Rgb.r, split1Rgb.g, split1Rgb.b), rgbToHex(split2Rgb.r, split2Rgb.g, split2Rgb.b)] },
      { name: 'Tetradic', colors: [hex, rgbToHex(tet1Rgb.r, tet1Rgb.g, tet1Rgb.b), rgbToHex(tet2Rgb.r, tet2Rgb.g, tet2Rgb.b), rgbToHex(tet3Rgb.r, tet3Rgb.g, tet3Rgb.b)] },
      { name: 'Monochromatic', colors: [rgbToHex(mono1.r, mono1.g, mono1.b), hex, rgbToHex(mono2.r, mono2.g, mono2.b), rgbToHex(mono3.r, mono3.g, mono3.b)] }
    ];
  }, [h, s, v, hex]);

  // Accessibility (WCAG 2.1) rating calculation
  const selectedLuminance = useMemo(() => getRelativeLuminance(rgb.r, rgb.g, rgb.b), [rgb]);
  
  const whiteLuminance = 1.0;
  const blackLuminance = 0.0;

  const contrastWithWhite = useMemo(() => getContrastRatio(selectedLuminance, whiteLuminance), [selectedLuminance]);
  const contrastWithBlack = useMemo(() => getContrastRatio(selectedLuminance, blackLuminance), [selectedLuminance]);

  const wcagRatings = useMemo(() => {
    return {
      white: {
        ratio: contrastWithWhite,
        aaNormal: contrastWithWhite >= 4.5,
        aaLarge: contrastWithWhite >= 3.0,
        aaaNormal: contrastWithWhite >= 7.0,
        aaaLarge: contrastWithWhite >= 4.5
      },
      black: {
        ratio: contrastWithBlack,
        aaNormal: contrastWithBlack >= 4.5,
        aaLarge: contrastWithBlack >= 3.0,
        aaaNormal: contrastWithBlack >= 7.0,
        aaaLarge: contrastWithBlack >= 4.5
      }
    };
  }, [contrastWithWhite, contrastWithBlack]);

  // Code snippets formulas
  const sassVariable = `$color-primary: ${hex};`;
  const tailwindSnippet = `colors: {\n  custom: '${hex}',\n}`;
  const rgbaValue = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(alpha / 100).toFixed(2)})`;
  const swiftCode = `let myColor = UIColor(red: ${(rgb.r/255).toFixed(2)}, green: ${(rgb.g/255).toFixed(2)}, blue: ${(rgb.b/255).toFixed(2)}, alpha: ${(alpha/100).toFixed(2)})`;
  const androidXml = `<color name="custom_color">${hex}</color>`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in" id="color-picker-view-root">
      
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono tracking-widest font-extrabold text-[#00FFD1] uppercase" style={{ color: accentColor }}>
            PROFESSIONAL STUDIO COMPASS
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none">
            Interactive <span className="text-[#00FFD1]" style={{ color: accentColor }}>Color Picker</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl font-medium leading-relaxed">
            Beautifully redesigned state-of-the-art interactive color analyzer. Drag coordinates smoothly to discover instant hex values, RGB, HSL, and CMYK ratios. Generate synchronized harmonies, custom tint-shade progressions, and verify real-time visual accessibility (WCAG 2.1 Pass scores).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-right font-mono text-[10px] text-slate-400">
            <span>CALIBRATION:</span>
            <span className="text-emerald-400 font-extrabold ml-1 uppercase">SRGB COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="picker-interactive-sandbox-row">
        
        {/* Left Side: Custom Saturation-Value box & Sliders (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main 2D Saturation-Value Box with Solid Hue background */}
          <div 
            ref={gridRef}
            onMouseDown={handleGridMouseDown}
            onTouchStart={handleGridTouchStart}
            className="w-full h-80 sm:h-96 rounded-3xl relative overflow-hidden cursor-crosshair select-none shadow-2xl border border-white/10"
            style={{ 
              backgroundColor: `hsl(${h}, 100%, 50%)`,
              backgroundImage: 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
            }}
            id="color-picker-2d-canvas"
          >
            {/* Visual Pointer Ring */}
            <div 
              style={{ 
                left: `${s}%`, 
                top: `${100 - v}%`,
                backgroundColor: hex,
                borderColor: v > 65 && s < 30 ? '#111827' : '#ffffff'
              }}
              className="absolute w-5 h-5 rounded-full border-2 shadow-2xl -ml-2.5 -mt-2.5 pointer-events-none transition-shadow duration-100 ring-2 ring-black/40"
            />
          </div>

          {/* Slider 1: Hue Rainbow Track */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
              <span className="font-bold">HUE ANGLE</span>
              <span className="text-[#00FFD1] font-extrabold" style={{ color: accentColor }}>{Math.round(h)}°</span>
            </div>
            <div 
              ref={hueSliderRef}
              onMouseDown={handleHueMouseDown}
              className="w-full h-5 rounded-xl cursor-ew-resize relative select-none border border-white/15"
              style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
              }}
            >
              <div 
                style={{ left: `${(h / 360) * 100}%` }}
                className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-6 bg-white rounded-md border border-slate-950 shadow-md ring-2 ring-white/20"
              />
            </div>
          </div>

          {/* Slider 2: Opacity / Alpha Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
              <span className="font-bold">OPACITY (ALPHA)</span>
              <span className="text-orange-400 font-extrabold">{alpha}%</span>
            </div>

            <div 
              ref={alphaSliderRef}
              onMouseDown={handleAlphaMouseDown}
              className="w-full h-5 rounded-xl cursor-ew-resize relative select-none border border-white/15 overflow-hidden"
              style={{
                backgroundImage: 'conic-gradient(#334155 25%, #1e293b 0 50%, #334155 0 75%, #1e293b 0)'
              }}
            >
              {/* Opacity mask layer representing current color alpha gradient path */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent, ${hex})`
                }}
              />
              <div 
                style={{ left: `${alpha}%` }}
                className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-6 bg-white rounded-md border border-slate-950 shadow-md ring-2 ring-white/20"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Numerical Inputs & Action Reports (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Color Block & HEX clipboard field */}
          <div className="bg-slate-950/40 p-6 rounded-3xl border border-white/5 space-y-5">
            <div className="flex items-center gap-4">
              {/* Color representation swatch */}
              <div 
                className="w-20 h-20 rounded-2xl border border-white/15 shrink-0 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: 'conic-gradient(#475569 25%, #334155 0 50%, #475569 0 75%, #334155 0)'
                }}
              >
                <div 
                  className="absolute inset-0" 
                  style={{ backgroundColor: hex, opacity: alpha / 100 }} 
                />
              </div>

              {/* Large copy identifier block */}
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider leading-none">ACTIVE SELECTED HEX:</span>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-2xl sm:text-3.5xl font-black text-white uppercase tracking-tight font-mono">{hex}</span>
                  <button
                    onClick={() => handleCopy(hex, 'HEX')}
                    className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title="Copy hex code"
                  >
                    {copiedValue === hex ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Utility button: Add this custom color seed directly back to Palette Generator */}
            {onSendToGenerator && (
              <button
                onClick={() => onSendToGenerator(hex)}
                className="w-full py-3 px-4 rounded-xl font-bold font-mono text-xs text-slate-900 bg-[#00FFD1] hover:bg-[#00FFD1]/90 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                <Sparkles className="h-4 w-4" />
                <span>Export Color to Palette Generator</span>
              </button>
            )}
          </div>

          {/* Interactive Numerical Input Matrix grids */}
          <div className="bg-[#020617] p-5 rounded-3xl border border-white/10 space-y-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-extrabold border-b border-white/5 pb-2">
              EXACT CHANNEL CALIBRATORS
            </span>

            {/* Custom HEX value entry input */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <span className="col-span-3 text-xs font-mono font-bold text-slate-400">HEX ADDR</span>
              <div className="col-span-9 relative">
                <span className="absolute left-3.5 top-2 text-xs font-mono text-slate-500">#</span>
                <input
                  type="text"
                  value={hexInput.replace('#', '')}
                  onChange={(e) => handleHexInputChange('#' + e.target.value)}
                  maxLength={7}
                  aria-label="Hex color picker value"
                  className="w-full bg-slate-950/80 rounded-xl border border-white/15 py-1.5 pl-7 pr-10 text-xs font-mono font-bold text-white uppercase tracking-widest outline-none focus:border-[#00FFD1]"
                />
                <button
                  onClick={() => handleCopy(hex, 'HEX')}
                  className="absolute right-2.5 top-1.5 p-1 text-slate-500 hover:text-white cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* RGB values inputs */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <span className="col-span-3 text-xs font-mono font-bold text-slate-400">RGB (0-255)</span>
              <div className="col-span-9 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Red</span>
                  <input
                    type="number"
                    value={rInput}
                    min={0}
                    max={255}
                    onChange={(e) => handleRgbInputChange('r', e.target.value)}
                    aria-label="RGB Red channel value"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-2 text-xs font-mono text-white text-center outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Green</span>
                  <input
                    type="number"
                    value={gInput}
                    min={0}
                    max={255}
                    onChange={(e) => handleRgbInputChange('g', e.target.value)}
                    aria-label="RGB Green channel value"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-2 text-xs font-mono text-white text-center outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase block mb-1">Blue</span>
                  <input
                    type="number"
                    value={bInput}
                    min={0}
                    max={255}
                    onChange={(e) => handleRgbInputChange('b', e.target.value)}
                    aria-label="RGB Blue channel value"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-2 text-xs font-mono text-white text-center outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* HSL values inputs */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <span className="col-span-3 text-xs font-mono font-bold text-slate-400">HSL %</span>
              <div className="col-span-9 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Hue (0-360)</span>
                  <input
                    type="number"
                    value={hInput}
                    min={0}
                    max={360}
                    onChange={(e) => handleHslInputChange('h', e.target.value)}
                    aria-label="HSL Hue degrees value"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-2 text-xs font-mono text-white text-center outline-none focus:border-amber-450"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Sat %</span>
                  <input
                    type="number"
                    value={sInput}
                    min={0}
                    max={100}
                    onChange={(e) => handleHslInputChange('s', e.target.value)}
                    aria-label="HSL Saturation percentage value"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-2 text-xs font-mono text-white text-center outline-none focus:border-amber-450"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Light %</span>
                  <input
                    type="number"
                    value={lInput}
                    min={0}
                    max={100}
                    onChange={(e) => handleHslInputChange('l', e.target.value)}
                    aria-label="HSL Lightness percentage value"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-2 text-xs font-mono text-white text-center outline-none focus:border-amber-450"
                  />
                </div>
              </div>
            </div>

            {/* CMYK percentages inputs */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <span className="col-span-3 text-xs font-mono font-bold text-slate-400">CMYK %</span>
              <div className="col-span-9 grid grid-cols-4 gap-1.5">
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Cyan</span>
                  <input
                    type="number"
                    value={cyInput}
                    min={0}
                    max={100}
                    onChange={(e) => handleCmykInputChange('c', e.target.value)}
                    aria-label="CMYK Cyan percentage"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-1.5 text-xs font-mono text-white text-center outline-none"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Magenta</span>
                  <input
                    type="number"
                    value={mgInput}
                    min={0}
                    max={100}
                    onChange={(e) => handleCmykInputChange('m', e.target.value)}
                    aria-label="CMYK Magenta percentage"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-1.5 text-xs font-mono text-white text-center outline-none"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Yellow</span>
                  <input
                    type="number"
                    value={ylInput}
                    min={0}
                    max={100}
                    onChange={(e) => handleCmykInputChange('y', e.target.value)}
                    aria-label="CMYK Yellow percentage"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-1.5 text-xs font-mono text-white text-center outline-none"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-mono text-slate-500 block mb-1">Black</span>
                  <input
                    type="number"
                    value={kbInput}
                    min={0}
                    max={100}
                    onChange={(e) => handleCmykInputChange('k', e.target.value)}
                    aria-label="CMYK Black percentage"
                    className="w-full bg-slate-950/80 rounded-lg border border-white/15 py-1 px-1.5 text-xs font-mono text-white text-center outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Progressive Scale: Shades, Tints, and Tones section inside interactive card */}
      <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 space-y-6" id="progressive-tints-shades-deck">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase flex items-center gap-1.5" style={{ color: accentColor }}>
            <Layers className="h-3.5 w-3.5" />
            <span>PROGRESSIVE COHESIVE SWATCH SCALE</span>
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Color Shades, Tints, & Tones
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl font-normal">
            Syntactical range progression intervals in steps of 10%. Perfect for finding consistent shadow overlays, text legibility backgrounds, and high-DPI borders. Click on any block to load it directly.
          </p>
        </div>

        <div className="space-y-5">
          {/* Tints Block Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>COLOR TINTS (BLENDING WHITE)</span>
              <span className="text-slate-500">10% - 90%</span>
            </div>
            <div className="grid grid-cols-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <div 
                className="col-span-1 border-r border-white/5 cursor-pointer flex items-center justify-center font-mono text-[9px]"
                style={{ backgroundColor: hex }}
                onClick={() => applyHexColor(hex)}
                title="Active Color"
              />
              {tintsArray.map((color, i) => (
                <button
                  key={`tint-${i}`}
                  onClick={() => applyHexColor(color)}
                  className="col-span-1 border-r last:border-r-0 border-white/5 cursor-pointer relative group"
                  style={{ backgroundColor: color }}
                  title={`Tint ${ (i+1)*10 }%: ${color}`}
                  aria-label={`Tint ${ (i+1)*10 }%: ${color}`}
                >
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center font-mono text-[8px] text-white font-extrabold select-none">
                    {color.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shades Block Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>COLOR SHADES (BLENDING BLACK)</span>
              <span className="text-slate-500">10% - 90%</span>
            </div>
            <div className="grid grid-cols-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <div 
                className="col-span-1 border-r border-white/5 cursor-pointer flex items-center justify-center font-mono text-[9px]"
                style={{ backgroundColor: hex }}
                onClick={() => applyHexColor(hex)}
                title="Active Color"
              />
              {shadesArray.map((color, i) => (
                <button
                  key={`shade-${i}`}
                  onClick={() => applyHexColor(color)}
                  className="col-span-1 border-r last:border-r-0 border-white/5 cursor-pointer relative group"
                  style={{ backgroundColor: color }}
                  title={`Shade ${ (i+1)*10 }%: ${color}`}
                  aria-label={`Shade ${ (i+1)*10 }%: ${color}`}
                >
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center font-mono text-[8px] text-white font-extrabold select-none">
                    {color.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tones Block Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>COLOR TONES (BLENDING GREY)</span>
              <span className="text-slate-500">10% - 90%</span>
            </div>
            <div className="grid grid-cols-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <div 
                className="col-span-1 border-r border-white/5 cursor-pointer flex items-center justify-center font-mono text-[9px]"
                style={{ backgroundColor: hex }}
                onClick={() => applyHexColor(hex)}
                title="Active Color"
              />
              {tonesArray.map((color, i) => (
                <button
                  key={`tone-${i}`}
                  onClick={() => applyHexColor(color)}
                  className="col-span-1 border-r last:border-r-0 border-white/5 cursor-pointer relative group"
                  style={{ backgroundColor: color }}
                  title={`Tone ${ (i+1)*10 }%: ${color}`}
                  aria-label={`Tone ${ (i+1)*10 }%: ${color}`}
                >
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center font-mono text-[8px] text-white font-extrabold select-none">
                    {color.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Color Harmonies Matching Matrix */}
      <div className="bg-slate-950/20 p-6 rounded-3xl border border-white/5 space-y-6" id="picker-harmonies-palette-block">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase flex items-center gap-1.5" style={{ color: accentColor }}>
            <Palette className="h-3.5 w-3.5" />
            <span>THEORETICAL VECTOR HARMONICS</span>
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Interactive Color Harmonies
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl font-normal leading-relaxed">
            Beautifully computed mathematical harmonies mapping complementary, split-complementary, triadic, tetradic, analogous, and monochromatic layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {harmonies.map((harmony) => (
            <div 
              key={harmony.name} 
              className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono leading-none">
                <span className="text-white font-extrabold uppercase">{harmony.name}</span>
                <span className="text-slate-500 font-bold">{harmony.colors.length} SHADES</span>
              </div>

              <div className="flex rounded-xl overflow-hidden border border-white/10 divide-x divide-white/5">
                {harmony.colors.map((colorItem, i) => (
                  <button
                    key={`${harmony.name}-${i}`}
                    className="flex-1 h-16 group relative select-none cursor-pointer transition-all hover:scale-[1.01]"
                    style={{ backgroundColor: colorItem }}
                    onClick={() => applyHexColor(colorItem)}
                    aria-label={`Select harmony color ${colorItem}`}
                  >
                    <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center font-mono text-[8px] text-white gap-0.5">
                      <span className="font-bold">LOAD</span>
                      <span>{colorItem.toUpperCase()}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Live WCAG 2.1 Pass Accessibility Evaluation Checker */}
      <div className="bg-[#020617] border border-white/10 rounded-3xl p-6 space-y-6" id="picker-wcag-accessibility-card">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase flex items-center gap-1.5" style={{ color: accentColor }}>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>WCAG 2.1 COLOR ACCESSIBILITY INDEX</span>
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Readability Contrast Diagnostic
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl font-normal">
            Ensuring high-contrast reading experiences. Accessible websites require a minimum contrast ratio of 4.5:1 for normal body text and 3.0:1 for large display headers under AA standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Checker 1: Foreground typography with Selected Color on White background */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-slate-300 font-mono">SELECTED ON WHITE BACKGROUND</span>
              <span className={`text-sm font-mono font-black ${wcagRatings.white.ratio >= 4.5 ? 'text-emerald-400' : 'text-orange-400'}`}>
                {wcagRatings.white.ratio.toFixed(2)}:1
              </span>
            </div>

            {/* Typography Preview box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <h4 className="text-lg font-bold leading-tight" style={{ color: hex }}>
                Visual Header Preview (AA Compliance)
              </h4>
              <p className="text-xs mt-1 leading-relaxed font-semibold" style={{ color: hex }}>
                The speed-tier palette catalog is computed with absolute precision. High contrast safeguards visual reading experiences across desktop and mobile screens.
              </p>
            </div>

            {/* Readout tags */}
            <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono font-black uppercase">
              <div className={`p-2 rounded-lg ${wcagRatings.white.aaNormal ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AA Body: {wcagRatings.white.aaNormal ? 'PASS' : 'FAIL'}
              </div>
              <div className={`p-2 rounded-lg ${wcagRatings.white.aaLarge ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AA Head: {wcagRatings.white.aaLarge ? 'PASS' : 'FAIL'}
              </div>
              <div className={`p-2 rounded-lg ${wcagRatings.white.aaaNormal ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AAA Body: {wcagRatings.white.aaaNormal ? 'PASS' : 'FAIL'}
              </div>
              <div className={`p-2 rounded-lg ${wcagRatings.white.aaaLarge ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AAA Head: {wcagRatings.white.aaaLarge ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

          {/* Checker 2: Typography on Selected Deep Charcoal background */}
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-slate-300 font-mono">SELECTED ON CHARCOAL BACKGROUND</span>
              <span className={`text-sm font-mono font-black ${wcagRatings.black.ratio >= 4.5 ? 'text-emerald-400' : 'text-orange-400'}`}>
                {wcagRatings.black.ratio.toFixed(2)}:1
              </span>
            </div>

            {/* Typography Preview box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-white/5">
              <h4 className="text-lg font-bold leading-tight" style={{ color: hex }}>
                Visual Header Preview (AA Compliance)
              </h4>
              <p className="text-xs mt-1 leading-relaxed font-semibold text-slate-300" style={{ color: hex }}>
                The speed-tier palette catalog is computed with absolute precision. High contrast safeguards visual reading experiences across desktop and mobile screens.
              </p>
            </div>

            {/* Readout tags */}
            <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono font-black uppercase">
              <div className={`p-2 rounded-lg ${wcagRatings.black.aaNormal ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AA Body: {wcagRatings.black.aaNormal ? 'PASS' : 'FAIL'}
              </div>
              <div className={`p-2 rounded-lg ${wcagRatings.black.aaLarge ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AA Head: {wcagRatings.black.aaLarge ? 'PASS' : 'FAIL'}
              </div>
              <div className={`p-2 rounded-lg ${wcagRatings.black.aaaNormal ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AAA Body: {wcagRatings.black.aaaNormal ? 'PASS' : 'FAIL'}
              </div>
              <div className={`p-2 rounded-lg ${wcagRatings.black.aaaLarge ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'}`}>
                AAA Head: {wcagRatings.black.aaaLarge ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 6. Studio Code/Asset Export center */}
      <div className="bg-slate-950/20 p-6 rounded-3xl border border-white/5 space-y-6" id="picker-code-snippets-block">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#00FFD1] tracking-widest font-black uppercase flex items-center gap-1.5" style={{ color: accentColor }}>
            <Code className="h-3.5 w-3.5" />
            <span>DEVELOPERS' EXPORT SLOTS</span>
          </span>
          <h3 className="text-xl font-black text-white tracking-tight">
            Code and Asset Copy Snippets
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl font-normal">
            Directly copy calibrated color assets across popular frontend frameworks, mobile systems, and styling architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Snippet 1 : CSS RGBA */}
          <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>CSS RGBA FORMULA</span>
              <button 
                onClick={() => handleCopy(rgbaValue, 'CSS RGBA')}
                className="hover:text-white cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <code className="text-[11px] font-mono font-bold text-white bg-slate-950/80 p-2.5 rounded-xl border border-white/10 shrink-0 select-all block truncate">
              {rgbaValue}
            </code>
          </div>

          {/* Snippet 2 : Tailwind CSS Config */}
          <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>TAILWIND CSS CONFIG</span>
              <button 
                onClick={() => handleCopy(tailwindSnippet, 'Tailwind config snippet')}
                className="hover:text-white cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <code className="text-[10px] font-mono font-bold text-white bg-slate-950/80 p-2.5 rounded-xl border border-white/10 shrink-0 select-all block whitespace-pre overflow-x-auto">
              {tailwindSnippet}
            </code>
          </div>

          {/* Snippet 3 : Android material XML */}
          <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>ANDROID MATERIAL XML ITEM</span>
              <button 
                onClick={() => handleCopy(androidXml, 'Android color resource')}
                className="hover:text-white cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <code className="text-[10px] font-mono font-bold text-white bg-slate-950/80 p-2.5 rounded-xl border border-white/10 shrink-0 select-all block truncate">
              {androidXml}
            </code>
          </div>

          {/* Snippet 4 : Sass and Less Variable */}
          <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>SASS STYLING VARIABLE</span>
              <button 
                onClick={() => handleCopy(sassVariable, 'Sass variable')}
                className="hover:text-white cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <code className="text-[11px] font-mono font-bold text-white bg-slate-950/80 p-2.5 rounded-xl border border-white/10 shrink-0 select-all block truncate">
              {sassVariable}
            </code>
          </div>

          {/* Snippet 5 : Swift Mobile UIColor */}
          <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>SWIFT iOS UICOLOR</span>
              <button 
                onClick={() => handleCopy(swiftCode, 'Swift code')}
                className="hover:text-white cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <code className="text-[10px] font-mono font-bold text-white bg-slate-950/80 p-2.5 rounded-xl border border-white/10 shrink-0 select-all block whitespace-pre overflow-x-auto">
              {swiftCode}
            </code>
          </div>

          {/* Snippet 6 : Comprehensive JSON */}
          <div className="p-4 rounded-2xl bg-[#020617]/50 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>COMPUTED JSON SPECIFICATION</span>
              <button 
                onClick={() => handleCopy(JSON.stringify({ hex, rgb, hsl, cmyk }, null, 2), 'JSON Specifications')}
                className="hover:text-white cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <code className="text-[10px] font-mono font-bold text-white bg-slate-950/80 p-2.5 rounded-xl border border-white/10 shrink-0 block whitespace-pre overflow-x-auto">
              {`{ "hex": "${hex}", "rgb": "${rgb.r},${rgb.g},${rgb.b}" }`}
            </code>
          </div>
        </div>
      </div>

      <FAQSection 
        theme={theme} 
        siteConfig={siteConfig}
        title="Color Analyzer FAQ"
        subtitle="Learn about mathematical color models, relative luminance calculation scales, and classic visual harmonies."
        customItems={[
          {
            id: 'cp-spaces',
            category: 'Color Models',
            question: 'What color spaces does this picker support and how are they translated?',
            answer: 'This analyzer supports four core mathematical coordinates: HEX string representing sRGB values, standard Red-Green-Blue (RGB) integers, Hue-Saturation-Lightness (HSL) cylindrical-coordinate representations, and Cyan-Magenta-Yellow-Key (CMYK) subtractive pigment ratios. Adjusting any tract dynamically triggers real-time mathematical transformations to keep all variables sync.',
            icon: Sliders
          },
          {
            id: 'cp-contrast',
            category: 'Accessibility',
            question: 'How is the real-time contrast score calculated, and what do the scores mean?',
            answer: 'The layout engine computes relative luminance metrics conforming directly to WCAG 2.1 specifications. It assesses contrast ratios against both pure black (#000000) and pure white (#ffffff) canvas backgrounds. A ratio exceeding 4.5:1 receives a "Pass" score for standard body text weights (WCAG AA), and scores exceeding 7.0:1 pass the stricter AAA visual standards.',
            icon: Info
          },
          {
            id: 'cp-harmonics',
            category: 'Color Harmonies',
            question: 'What classic color harmonies are calculated in the matching module?',
            answer: 'The harmonies drawer dynamically computes 6 distinct classical color formulas: Complementary (180° opposite), Split-Complementary (150° and 210° offsets), Triadic (three segments spaced 120° apart), Tetradic (four segments with 90° offsets), Monochromatic (constant hue with variance in lightness and saturation), and Analogous (adjacent segments spaced 30° apart).',
            icon: Palette
          },
          {
            id: 'cp-export',
            category: 'Integration',
            question: 'Can I export these color configurations directly to the live generator?',
            answer: 'Yes! You can instantly copy raw hex codes, formatted CSS variables, or JSON structured specs. Furthermore, clicking the "Send to Generator" action feeds your active selection into the live vector palette generator, populating a custom 6-color workspace workspace instantly.',
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
