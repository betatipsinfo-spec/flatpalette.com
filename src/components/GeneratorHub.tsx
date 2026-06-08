import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, RefreshCw, Copy, Check, Info, Sliders, Save, Sparkles, X, Tag, Image as ImageIcon, Pipette, Upload, CheckCircle2 } from 'lucide-react';
import { generateRandomHex, generateHarmony, getContrastColor, hexToRgbString, hexToHsl } from '../utils';

interface GeneratorHubProps {
  onAddSubittedPalette: (title: string, colors: string[], tags: string[]) => void;
  initialColors?: string[];
}

export default function GeneratorHub({ onAddSubittedPalette, initialColors }: GeneratorHubProps) {
  const [colors, setColors] = useState<string[]>(() => {
    return initialColors && initialColors.length > 0
      ? initialColors
      : ['#00FFD1', '#f10b7f', '#241244', '#ffd700', '#fbfbfb'];
  });

  useEffect(() => {
    if (initialColors && initialColors.length > 0) {
      setColors(initialColors);
    }
  }, [initialColors]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [harmonyType, setHarmonyType] = useState<'random' | 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary'>('random');
  const [colorBlindnessMode, setColorBlindnessMode] = useState<'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('normal');
  const [isSaved, setIsSaved] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const suggestTitleForColors = async (targetColors: string[], targetTags: string[]) => {
    setIsSuggestingTitle(true);
    setSuggestError(null);
    try {
      const response = await fetch('/api/gemini/suggest-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colors: targetColors,
          tags: targetTags,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to suggest title');
      }

      const data = await response.json();
      if (data.title) {
        setSaveTitle(data.title);
      }
    } catch (err: any) {
      console.error(err);
      setSuggestError(err.message || 'Error communicating with AI');
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  const handleSuggestTitle = async () => {
    await suggestTitleForColors(colors, selectedTags);
  };

  // Suffix parameters for multi-select tags state control
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('flatpalette_popular_tags_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Fallback
      }
    }
    return ['Cyberpunk', 'Neon', 'Vibrant', 'Dark', 'Retro', 'Pastel', 'Minimal', 'Nature', 'Vintage', 'Muted', 'Warm', 'Modern', 'Luxury'];
  });

  useEffect(() => {
    localStorage.setItem('flatpalette_popular_tags_v1', JSON.stringify(popularTags));
  }, [popularTags]);

  // Helper to score how relevant a tag is to the current 5-color palette
  const getTagRelevanceScore = (tag: string, paletteColors: string[]) => {
    try {
      const hsls = paletteColors.map(c => hexToHsl(c));
      const tagLower = tag.toLowerCase();

      // Basic stats
      const avgS = hsls.reduce((acc, c) => acc + c.s, 0) / hsls.length;
      const avgL = hsls.reduce((acc, c) => acc + c.l, 0) / hsls.length;
      
      const countNeon = hsls.filter(c => c.s >= 80 && c.l >= 40 && c.l <= 75).length;
      const countVibrant = hsls.filter(c => c.s >= 65).length;
      const countDark = hsls.filter(c => c.l <= 32).length;
      const countPastel = hsls.filter(c => c.l >= 70 && c.s <= 45).length;
      const countWarm = hsls.filter(c => (c.h >= 0 && c.h <= 70) || (c.h >= 320 && c.h <= 360)).length;
      const countCool = hsls.filter(c => c.h >= 165 && c.h <= 270).length;
      const countGreen = hsls.filter(c => c.h >= 75 && c.h <= 160).length;
      // Gold/Orange-yellow: Hue 35 to 58, Saturation >= 50, Lightness 35 to 75
      const countGold = hsls.filter(c => c.h >= 35 && c.h <= 58 && c.s >= 45 && c.l >= 35 && c.l <= 75).length;
      const countMuted = hsls.filter(c => c.s <= 40).length;
      const countGrayscale = hsls.filter(c => c.s <= 15).length;

      let score = 0;

      if (tagLower === 'cyberpunk') {
        if (countNeon > 0) score += 4;
        if (countDark > 0) score += 2;
        const hasPinkOrBlue = hsls.some(c => (c.h >= 280 && c.h <= 350) || (c.h >= 180 && c.h <= 245));
        if (hasPinkOrBlue) score += 4;
      } else if (tagLower === 'neon') {
        score += countNeon * 5;
        if (avgS > 75) score += 3;
      } else if (tagLower === 'vibrant') {
        score += countVibrant * 3;
        if (avgS > 65) score += 2;
      } else if (tagLower === 'dark') {
        score += countDark * 5;
        if (avgL < 35) score += 3;
      } else if (tagLower === 'retro') {
        const hasRetroHue = hsls.some(c => (c.h >= 15 && c.h <= 45) || (c.h >= 160 && c.h <= 200));
        if (hasRetroHue) score += 4;
        if (countMuted > 0) score += 2;
      } else if (tagLower === 'pastel') {
        score += countPastel * 5;
        if (avgL > 70 && avgS < 45) score += 3;
      } else if (tagLower === 'minimal') {
        score += countGrayscale * 4;
        if (avgS < 25) score += 2;
      } else if (tagLower === 'nature') {
        score += countGreen * 5;
        const hasNatureEarthTone = hsls.some(c => c.h >= 20 && c.h <= 60 && c.l < 55);
        if (hasNatureEarthTone) score += 3;
      } else if (tagLower === 'vintage') {
        const hasSepiaOrBeige = hsls.some(c => c.h >= 25 && c.h <= 48 && c.s < 60);
        if (hasSepiaOrBeige) score += 5;
        if (countMuted > 0) score += 2;
      } else if (tagLower === 'muted') {
        score += countMuted * 4;
        if (avgS < 40) score += 2;
      } else if (tagLower === 'warm') {
        score += countWarm * 5;
        if (countWarm >= 3) score += 2;
      } else if (tagLower === 'modern') {
        score += countCool * 3;
        const hasSlate = hsls.some(c => c.h >= 190 && c.h <= 230 && c.s < 40);
        if (hasSlate) score += 4;
      } else if (tagLower === 'luxury') {
        score += countGold * 5;
        const hasDeepBlackAndPurple = hsls.some(c => c.l < 15 || (c.h >= 240 && c.h <= 290 && c.l < 40));
        if (hasDeepBlackAndPurple) score += 4;
      }

      return score;
    } catch (e) {
      return 0;
    }
  };

  // Sort popular tags dynamically based on match with the dominant base hue & color properties
  const sortedPopularTagsByHue = React.useMemo(() => {
    return [...popularTags].sort((a, b) => {
      const scoreA = getTagRelevanceScore(a, colors);
      const scoreB = getTagRelevanceScore(b, colors);
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return a.localeCompare(b);
    });
  }, [popularTags, colors]);

  const [confirmTagModal, setConfirmTagModal] = useState<{
    isOpen: boolean;
    tagToRemove: string;
  }>({
    isOpen: false,
    tagToRemove: ''
  });

  const [confirmDeletePresetModal, setConfirmDeletePresetModal] = useState<{
    isOpen: boolean;
    tagToDelete: string;
  }>({
    isOpen: false,
    tagToDelete: ''
  });

  // Image Analyzer State Section
  const [imageSrc, setImageSrc] = useState<string>('https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=600&q=80');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [highlightCoords, setHighlightCoords] = useState<{ x: number; y: number } | null>(null);

  // Helper helper to convert custom image files to local data URLs
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setHighlightCoords(null);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

    // Get clicked coordinates inside the image element rect
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight;

    // Display pointer ripple highlight indicator on image elements coordinate space
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    setHighlightCoords({ x: pctX, y: pctY });

    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];

    const rgbToHexValue = (rNum: number, gNum: number, bNum: number) => {
      const clamp = (val: number) => Math.max(0, Math.min(255, val));
      const parts = [clamp(rNum), clamp(gNum), clamp(bNum)].map(val => {
        const h = val.toString(16);
        return h.length === 1 ? '0' + h : h;
      });
      return '#' + parts.join('');
    };

    const targetHex = rgbToHexValue(r, g, b);

    // Modify target active slot with extracted color
    setColors((prev) => {
      const next = [...prev];
      next[activeSlotIndex] = targetHex;
      return next;
    });
    setIsSaved(false);

    // Auto hover/advance to the next slot index
    setActiveSlotIndex((prevIdx) => (prevIdx + 1) % 5);
  };

  // Helper to extract 5 dominant colors and set them as a beautiful sequence
  const handleExtractDominantColors = () => {
    const imgElement = document.getElementById('analyzer-source-image') as HTMLImageElement;
    if (!imgElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imgElement, 0, 0, 120, 120);
    const imgData = ctx.getImageData(0, 0, 120, 120).data;

    // Fast grouping of colors via quantization in grid blocks
    const bucketFreq: { [hex: string]: number } = {};
    const rgbToHexValue = (rNum: number, gNum: number, bNum: number) => {
      const clamp = (val: number) => Math.max(0, Math.min(255, val));
      const parts = [clamp(rNum), clamp(gNum), clamp(bNum)].map(val => {
        const h = val.toString(16);
        return h.length === 1 ? '0' + h : h;
      });
      return '#' + parts.join('');
    };

    for (let i = 0; i < imgData.length; i += 24) { // Step quickly
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];
      if (a < 128) continue; // transparent pixel bypass

      // Quantize to reduce identical shade noise
      const rKey = Math.round(r / 20) * 20;
      const gKey = Math.round(g / 20) * 20;
      const bKey = Math.round(b / 20) * 20;

      const hex = rgbToHexValue(rKey, gKey, bKey);
      bucketFreq[hex] = (bucketFreq[hex] || 0) + 1;
    }

    const sortedList = Object.entries(bucketFreq)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    // Gather 5 aesthetically distinct colors
    const pickedSet: string[] = [];
    const isColorClose = (hexA: string, hexB: string) => {
      const getRgb = (hStr: string) => {
        const parsed = hStr.replace('#', '');
        return {
          r: parseInt(parsed.substring(0, 2), 16),
          g: parseInt(parsed.substring(2, 4), 16),
          b: parseInt(parsed.substring(4, 6), 16)
        };
      };
      try {
        const rgbA = getRgb(hexA);
        const rgbB = getRgb(hexB);
        return Math.sqrt(
          Math.pow(rgbA.r - rgbB.r, 2) +
          Math.pow(rgbA.g - rgbB.g, 2) +
          Math.pow(rgbA.b - rgbB.b, 2)
        ) < 70; // Euclidean threshold check
      } catch {
        return false;
      }
    };

    for (const colorCandidate of sortedList) {
      if (pickedSet.length >= 5) break;
      if (!pickedSet.some(existingCol => isColorClose(existingCol, colorCandidate))) {
        pickedSet.push(colorCandidate);
      }
    }

    // Fallback padding if too few unique tones
    while (pickedSet.length < 5) {
      pickedSet.push(generateRandomHex());
    }

    const nextColors = colors.map((col, idx) => (locked[idx] ? col : pickedSet[idx]));
    setColors(nextColors);
    setHighlightCoords(null);
    setIsSaved(false);
    // Get palette name auto when click auto dominant
    suggestTitleForColors(nextColors, selectedTags);
  };

  // Dynamic state trigger sync when harmony selection occurs
  useEffect(() => {
    if (harmonyType === 'random') {
      setSelectedTags((prevTags) => {
        const knownHarmonies = ['Monochromatic', 'Analogous', 'Complementary', 'Triadic', 'Split Complementary', 'Vibrant'];
        return prevTags.filter(t => !knownHarmonies.includes(t));
      });
      return;
    }
    const harmonyLabel = harmonyType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    setSelectedTags((prevTags) => {
      // Remove any previously set systemic harmony names
      const knownHarmonies = ['Monochromatic', 'Analogous', 'Complementary', 'Triadic', 'Split Complementary', 'Vibrant'];
      const filtered = prevTags.filter(t => !knownHarmonies.includes(t));
      if (!filtered.includes(harmonyLabel)) {
        return [...filtered, harmonyLabel];
      }
      return filtered;
    });
  }, [harmonyType]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setConfirmTagModal({
        isOpen: true,
        tagToRemove: tag
      });
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleTogglePopularTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const confirmRemoveTag = () => {
    setSelectedTags(prev => prev.filter(t => t !== confirmTagModal.tagToRemove));
    setConfirmTagModal({ isOpen: false, tagToRemove: '' });
  };

  const confirmDeletePresetTag = () => {
    setPopularTags(prev => prev.filter(t => t !== confirmDeletePresetModal.tagToDelete));
    setConfirmDeletePresetModal({ isOpen: false, tagToDelete: '' });
  };

  // Generate new colors respecting locked state
  const handleShiftColors = useCallback(() => {
    setColors((prevColors) => {
      let seedHex = prevColors[0]; // Default seed color

      // Find the first locked color as the seed, or use the first color if none is locked
      const firstLockedIdx = prevColors.findIndex((_, idx) => locked[idx]);
      if (firstLockedIdx !== -1) {
        seedHex = prevColors[firstLockedIdx];
      }

      let newSet: string[] = [];

      if (harmonyType === 'random') {
        // Generate entirely independent random hexes
        newSet = prevColors.map((col, idx) => (locked[idx] ? col : generateRandomHex()));
      } else {
        // Structured harmony generation based on seed
        const matchedHarmony = generateHarmony(seedHex, harmonyType as any);
        newSet = prevColors.map((col, idx) => (locked[idx] ? col : matchedHarmony[idx] || generateRandomHex()));
      }

      return newSet;
    });
    setIsSaved(false);
  }, [locked, harmonyType]);

  // Implement Spacebar global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shifting colors if user is currently typing inside the title input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleShiftColors();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleShiftColors]);

  // Lock status toggle
  const toggleLock = (index: number) => {
    setLocked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Color text string override
  const handleHexInputChange = (index: number, val: string) => {
    setColors((prev) => {
      const next = [...prev];
      if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
        next[index] = val;
      }
      return next;
    });
  };

  const handleCopyColor = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleSavePalette = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    // Trigger save to feed callback
    onAddSubittedPalette(saveTitle.trim(), colors, selectedTags);
    setSaveTitle('');
    // Reset tags with current active harmony type
    if (harmonyType === 'random') {
      setSelectedTags([]);
    } else {
      const harmonyLabel = harmonyType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      setSelectedTags([harmonyLabel]);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="generator-hub-page">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="h-7 w-7 text-[#00FFD1]" />
            <span>Harmony Space Generator</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            Lock beautiful colors, toggle systemic math harmonies, and press <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px] border border-white/15">Spacebar</kbd> on your keyboard to shift the system.
          </p>
        </div>

        {/* Controls block for Harmony & Color Blindness */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Harmony Category Dropdown selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase shrink-0 hidden sm:inline font-bold">Harmony Formula:</span>
            <select
              id="generator-harmony-select"
              value={harmonyType}
              onChange={(e) => setHarmonyType(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white outline-none backdrop-blur-md focus:border-[#00FFD1]/40 cursor-pointer"
            >
              <option value="random" className="bg-slate-950 text-white">🌟 Full Independent Seeds (Random)</option>
              <option value="monochromatic" className="bg-slate-950 text-white">🎨 Monochromatic Harmony</option>
              <option value="analogous" className="bg-slate-950 text-white">🌈 Analogous Hue Shifts</option>
              <option value="complementary" className="bg-slate-950 text-white">☯️ Complementary Dualism</option>
              <option value="triadic" className="bg-slate-950 text-white">🔺 Triadic Splits (120°)</option>
              <option value="split-complementary" className="bg-slate-950 text-white">🏹 Split-Complementary Mode</option>
            </select>
          </div>

          {/* Color Blindness Simulator selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-semibold text-slate-400 font-mono uppercase shrink-0 hidden sm:inline font-bold">Simulator:</span>
            <select
              id="generator-blindness-select"
              value={colorBlindnessMode}
              onChange={(e) => setColorBlindnessMode(e.target.value as any)}
              className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white outline-none backdrop-blur-md focus:border-[#00FFD1]/40 cursor-pointer"
            >
              <option value="normal" className="bg-slate-950 text-white">👀 Normal Vision</option>
              <option value="protanopia" className="bg-slate-950 text-white">🔴 Protanopia (Red-Blind)</option>
              <option value="deuteranopia" className="bg-slate-950 text-white">🟢 Deuteranopia (Green-Blind)</option>
              <option value="tritanopia" className="bg-slate-950 text-white">🔵 Tritanopia (Blue-Blind)</option>
              <option value="achromatopsia" className="bg-slate-950 text-white">⚫ Achromatopsia (No Color)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main color generators strip grid */}
      <div 
        className="grid grid-cols-1 md:grid-cols-5 h-[360px] md:h-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative mb-8 transition-all duration-300"
        id="generator-panels-matrix"
        style={colorBlindnessMode !== 'normal' ? { filter: `url(#sim-${colorBlindnessMode})` } : undefined}
      >
        {colors.map((hex, index) => {
          const contrast = getContrastColor(hex);
          const isLocked = locked[index];
          const isCopied = copiedIndex === index;

          return (
            <div
              key={index}
              id={`generator-panel-${index}`}
              className="relative flex flex-col justify-between p-6 transition-all duration-300 group/panel"
              style={{ backgroundColor: hex }}
            >
              {/* Copy Indicator */}
              {isCopied && (
                <div 
                  className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center backdrop-blur-[2px]"
                  style={{ color: contrast }}
                >
                  <div className="flex flex-col items-center scale-100 transition-all animate-bounce">
                    <Check className="h-6 w-6" />
                    <span className="text-xs font-mono font-bold mt-1">COPIED!</span>
                  </div>
                </div>
              )}

              {/* Top controls Row (Lock status) */}
              <div className="flex items-center justify-between">
                <button
                  id={`panel-lock-btn-${index}`}
                  onClick={() => toggleLock(index)}
                  className="p-2 sm:p-2.5 rounded-full backdrop-blur-md bg-black/15 hover:bg-black/30 border border-white/10 transition-all active:scale-95 cursor-pointer shadow-md"
                  style={{ color: contrast }}
                  title={isLocked ? "Lock State: Frozen" : "Lock State: Shifting"}
                >
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-pink-500 animate-pulse" />
                  ) : (
                    <Unlock className="h-4 w-4 opacity-80" />
                  )}
                </button>

                <div className="text-[10px] sm:text-xs font-mono font-bold opacity-60" style={{ color: contrast }}>
                  0{index + 1}
                </div>
              </div>

              {/* Bottom Details Row (Editable Hex, Copy controls) */}
              <div className="space-y-4">
                
                {/* Custom text color input */}
                <div className="relative">
                  <input
                    type="text"
                    id={`panel-hex-input-${index}`}
                    value={hex}
                    maxLength={7}
                    onChange={(e) => handleHexInputChange(index, e.target.value)}
                    className="w-full bg-slate-950/20 text-center font-mono font-black text-base sm:text-lg border-b border-dashed border-white/20 outline-none uppercase py-1 focus:border-white focus:bg-slate-950/45 transition-all outline-hidden text-[#000]"
                    style={{ color: contrast, borderBottomColor: `${contrast}44`, backgroundColor: `rgba(0,0,0,0.1)` }}
                  />
                  {/* Real visual hidden picker trigger if clicked */}
                  <input
                    type="color"
                    id={`panel-picker-${index}`}
                    value={hex.length === 7 ? hex : '#ffffff'}
                    onChange={(e) => {
                      setColors((prev) => {
                        const next = [...prev];
                        next[index] = e.target.value;
                        return next;
                      });
                    }}
                    className="absolute right-1 top-1 h-5 w-5 opacity-0 cursor-pointer"
                  />
                  <div 
                    className="absolute right-1 top-2.5 h-3.5 w-3.5 rounded border border-white/25 cursor-pointer"
                    style={{ backgroundColor: hex, borderColor: contrast }}
                    onClick={() => document.getElementById(`panel-picker-${index}`)?.click()}
                    title="Open Color Picker Widget"
                  />
                </div>

                {/* Sub titles */}
                <div className="flex flex-col opacity-60 font-mono text-[10.5px] tracking-wide" style={{ color: contrast }}>
                  <span>RGB: {hex.length === 7 ? hexToRgbString(hex) : '---'}</span>
                </div>

                {/* Copy Overlay CTA button */}
                <button
                  id={`panel-copy-btn-${index}`}
                  onClick={() => handleCopyColor(hex, index)}
                  className="w-full py-2.5 rounded-lg border text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-black/15 hover:bg-black/35 transition-all text-center"
                  style={{ color: contrast, borderColor: `${contrast}33` }}
                >
                  Copy Slot Hex
                </button>

              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {colorBlindnessMode !== 'normal' && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-8 p-3.5 rounded-xl border border-[#00FFD1]/20 bg-[#00FFD1]/5 text-xs text-slate-300 flex items-center gap-3 backdrop-blur-xs"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00FFD1] animate-pulse shrink-0" />
            <div className="flex-1 text-[11px] sm:text-xs">
              <span className="font-bold text-[#00FFD1] uppercase mr-1.5">
                {colorBlindnessMode === 'protanopia' && '🔴 Protanopia (Red-Blind):'}
                {colorBlindnessMode === 'deuteranopia' && '🟢 Deuteranopia (Green-Blind):'}
                {colorBlindnessMode === 'tritanopia' && '🔵 Tritanopia (Blue-Blind):'}
                {colorBlindnessMode === 'achromatopsia' && '⚫ Achromatopsia (No Color):'}
              </span>
              <span>
                {colorBlindnessMode === 'protanopia' && 'Simulates inability to perceive red light. Red shades appear greenish/gray, and colors are shifted relative to blue/yellow.'}
                {colorBlindnessMode === 'deuteranopia' && 'Simulates inability to perceive green light. Red/green color distinction is reduced, yellow and blue hues remain dominant.'}
                {colorBlindnessMode === 'tritanopia' && 'Simulates inability to perceive blue light. Blue appears greenish, yellow appears pinkish/red.'}
                {colorBlindnessMode === 'achromatopsia' && 'Simulates absolute lack of color receptors. Highly useful for inspecting high-contrast visibility and structural text legibility.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setColorBlindnessMode('normal')}
              className="text-[#00FFD1] hover:text-white transition-colors font-semibold underline text-[10px] uppercase cursor-pointer shrink-0"
            >
              Reset Vision
            </button>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Main Spacebar shifter and saving controls row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Shifter action column (Col span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Photo Inspiration & Color Picker Studio block */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4" id="image-picker-studio">
            {/* Title row */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-[#00FFD1]" />
                  <span>Photo Inspiration Extractor</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Sample colors directly from the image workspace to target layout spots.
                </p>
              </div>
            </div>

            {/* Studio Inner Layout */}
            <div className="flex flex-col items-center space-y-4">
              
              {/* Tuning Slot selector ABOVE image preview */}
              <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/5 w-full justify-between">
                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Active Target Slot:</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const colorHex = colors[idx] || '#000000';
                    const isActive = activeSlotIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlotIndex(idx)}
                        className={`h-6 px-2.5 rounded text-[10px] font-black transition-all relative cursor-pointer ${
                          isActive 
                            ? 'ring-2 ring-white text-white scale-105' 
                            : 'opacity-50 hover:opacity-100 text-slate-300'
                        }`}
                        style={{ backgroundColor: colorHex, color: getContrastColor(colorHex) }}
                        title={`Set target slot to 0${idx + 1}`}
                      >
                        0{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Squeezed interactive image container */}
              <div className="w-full flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-xl border border-white/5 relative h-80">
                <div className="relative h-full max-w-full overflow-hidden rounded-lg group select-none flex items-center justify-center">
                  <img
                    src={imageSrc}
                    alt="Inspiration source target"
                    id="analyzer-source-image"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onClick={handleImageClick}
                    className="h-full w-auto max-w-full object-contain cursor-crosshair rounded-lg border border-white/10 transition-transform active:scale-[0.99]"
                  />
                  
                  {/* Target Highlight Coordinates Pointer circle */}
                  {highlightCoords && (
                    <div 
                      className="absolute h-4 w-4 rounded-full border border-white bg-black/20 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                      style={{ left: `${highlightCoords.x}%`, top: `${highlightCoords.y}%` }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-[#00FFD1] animate-ping" />
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-1.5 left-1.5 bg-slate-900/95 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8.5px] text-slate-400 font-mono tracking-wider select-none flex items-center gap-1">
                  <Pipette className="h-2.5 w-2.5 text-[#00FFD1]" />
                  <span>Tap image to inject slot 0{activeSlotIndex + 1}</span>
                </div>
              </div>

              {/* Action buttons BELOW image preview */}
              <div className="grid grid-cols-2 gap-2 w-full">
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/40 border border-white/10 hover:border-[#00FFD1]/30 hover:bg-white/5 transition-all cursor-pointer text-center group">
                  <Upload className="h-3 w-3 text-slate-400 group-hover:text-[#00FFD1] transition-colors" />
                  <span className="text-[10px] text-slate-300 font-bold">Upload Custom</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleExtractDominantColors}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#00FFD1] text-slate-900 hover:text-slate-950 text-[10px] font-black tracking-wider uppercase transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="h-3 w-3 fill-current text-purple-600 group-hover:text-slate-950" />
                  <span>Auto Dominant</span>
                </button>
              </div>

            </div>
          </div>

          {/* Shifter action row sub-card */}
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
            <button
              id="generator-shift-btn"
              onClick={handleShiftColors}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-600 to-[#00FFD1] text-white text-sm font-black uppercase tracking-wider shadow-lg hover:shadow-cyan-500/10 active:scale-95 transition-all group cursor-pointer"
            >
              <RefreshCw className="h-4.5 w-4.5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Shift Harmony Matrix</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-[#00FFD1] shrink-0" />
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Tap <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-[#ffffff]/10 font-mono text-white text-[10px]">SPACE</kbd> key anywhere inside the workspace or click on individual column numbers to lock colors dynamically.
              </p>
            </div>
          </div>
        </div>

        {/* Save Custom Palette Form column (Col span 5) */}
        <div className="lg:col-span-5 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
          <form onSubmit={handleSavePalette} className="flex flex-col gap-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#00FFD1] flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 fill-[#00FFD1] text-[#00FFD1]" />
              <span>Register Palette To Feed</span>
            </h4>
            
            <div className="flex flex-col gap-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  id="generator-save-title-input"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Give your palette an elite name..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-3 pr-10 py-2 text-xs text-white placeholder-slate-450 outline-none focus:border-[#00FFD1]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleSuggestTitle}
                  disabled={isSuggestingTitle}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-[#00FFD1] disabled:text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
                  title="Suggest AI Title via Gemini"
                  id="generator-ai-suggest-btn"
                >
                  {isSuggestingTitle ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#00FFD1]" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 hover:scale-110 transition-transform text-[#00FFD1]" />
                  )}
                </button>
              </div>

              {suggestError && (
                <p className="text-[10px] text-pink-500 font-medium">{suggestError}</p>
              )}

              <button
                type="submit"
                id="generator-save-submit-btn"
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white/10 text-[#00FFD1] hover:bg-white/15 border border-white/10 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Publish to Feed</span>
              </button>
            </div>

            {/* Multi-select category tags selector */}
            <div className="space-y-1.5 mt-1 border-t border-white/5 pt-2">

              {/* Preset selection flow */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 font-bold block">Click to toggle popular tags:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="+ Add preset tag"
                      id="new-preset-tag-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const formatted = val.charAt(0).toUpperCase() + val.slice(1);
                            if (!popularTags.includes(formatted)) {
                              setPopularTags(prev => [...prev, formatted]);
                              e.currentTarget.value = '';
                            }
                          }
                        }
                      }}
                      className="w-24 bg-white/5 border border-white/10 hover:border-white/20 text-[10px] text-slate-300 rounded px-1.5 py-0.5 outline-none focus:border-[#00FFD1]/30 transition-all placeholder-slate-500 font-medium"
                      title="Type a tag and press Enter to save as preset badge"
                    />
                  </div>
                </div>
                <motion.div 
                  layout
                  className="flex flex-wrap gap-1.5"
                >
                  <AnimatePresence mode="popLayout">
                    {sortedPopularTagsByHue.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.82 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.82 }}
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          layout
                          className={`group relative inline-flex items-center gap-1 text-[11.5px] rounded transition-all font-semibold border ${
                            isSelected 
                              ? 'bg-purple-900/40 border-purple-500/30 text-purple-300 hover:bg-purple-950/40' 
                              : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                          }`}
                        >
                          {/* Tag click toggle trigger */}
                          <button
                            type="button"
                            onClick={() => handleTogglePopularTag(tag)}
                            className="px-1.5 py-0.5 cursor-pointer font-semibold outline-none select-none text-left"
                          >
                            #{tag}
                          </button>
 
                          {/* Tag delete/remove from preset list button (on hover) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeletePresetModal({
                                isOpen: true,
                                tagToDelete: tag
                              });
                            }}
                            className="text-[13px] leading-none hover:text-red-400 text-slate-500 opacity-0 group-hover:opacity-100 pr-1 transition-opacity cursor-pointer border-l border-white/10 pl-1"
                            title={`Remove ${tag} preset`}
                          >
                            &times;
                          </button>
                        </motion.div>
                      );
                    })}
                    {sortedPopularTagsByHue.length === 0 && (
                      <motion.span 
                        key="empty-popular"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[12px] text-slate-500 italic"
                      >
                        No popular tags. Type one above to store!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Chosen tags bar */}
              <div className="space-y-1.5 pt-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Category Tags (Multi-Select):
                </label>
                <motion.div 
                  layout
                  className="flex flex-wrap gap-1 min-h-[30px] p-1.5 rounded-lg bg-slate-950/40 border border-white/5 overflow-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    {selectedTags.length === 0 ? (
                      <motion.span 
                        key="empty-chosen"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-slate-500 text-[10px] italic font-medium"
                      >
                        No category tags active. Click above to select...
                      </motion.span>
                    ) : (
                      selectedTags.map((tag) => (
                        <motion.span 
                          key={tag} 
                          initial={{ opacity: 0, scale: 0.82 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.82 }}
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          layout
                          onClick={() => handleTagClick(tag)}
                          className="bg-purple-900/40 hover:bg-red-950/40 border border-purple-500/30 hover:border-red-500/30 text-purple-300 hover:text-red-300 text-[9.5px] px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all font-semibold group"
                          title="Click to remove tag"
                        >
                          <span>#{tag}</span>
                          <span className="text-[11px] text-purple-400 group-hover:text-red-400 leading-none">&times;</span>
                        </motion.span>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Manual input tag addition */}
              <div className="flex gap-1.5 mt-1.5">
                <input
                  type="text"
                  placeholder="Or type custom tag..."
                  id="custom-tag-type-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.currentTarget.value.trim();
                      if (val && !selectedTags.includes(val)) {
                        setSelectedTags(prev => [...prev, val]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="flex-1 rounded border border-white/5 bg-slate-950/40 px-2.5 py-1 text-[10.5px] text-slate-300 placeholder-slate-500 outline-none focus:border-[#00FFD1]/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('custom-tag-type-input') as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val && !selectedTags.includes(val)) {
                      setSelectedTags(prev => [...prev, val]);
                      input.value = '';
                    }
                  }}
                  className="px-2.5 py-1 bg-white/5 hover:bg-[#00FFD1]/10 text-[#00FFD1] border border-white/5 hover:border-[#00FFD1]/20 rounded text-[10.5px] font-bold"
                >
                  + Add
                </button>
              </div>
            </div>

            {isSaved && (
              <p className="text-xs text-emerald-400 font-bold tracking-wide animate-pulse flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Vibrant array exported success! Saved to standard local state.</span>
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Custom Tag Removal Deletion Confirmation Modal */}
      {confirmTagModal.isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmTagModal({ isOpen: false, tagToRemove: '' })}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl space-y-4 z-10 text-left animate-in fade-in zoom-in-95 duration-155">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#00FFD1]" />
                <span>Remove Category Tag</span>
              </span>
              <button
                type="button"
                onClick={() => setConfirmTagModal({ isOpen: false, tagToRemove: '' })}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Are you sure you want to delete the category tag <strong className="text-pink-400 font-bold">#{confirmTagModal.tagToRemove}</strong> from this submission?
            </p>
            
            <div className="flex items-center justify-end gap-3.5 pt-1.5">
              <button
                type="button"
                onClick={() => setConfirmTagModal({ isOpen: false, tagToRemove: '' })}
                className="px-4.5 py-2 rounded-lg border border-white/10 text-slate-350 hover:text-white hover:bg-white/5 text-[11px] font-bold tracking-wide uppercase transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveTag}
                className="px-4.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold tracking-wide uppercase transition-all shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Tag Removal Deletion Confirmation Modal */}
      {confirmDeletePresetModal.isOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmDeletePresetModal({ isOpen: false, tagToDelete: '' })}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl space-y-4 z-10 text-left animate-in fade-in zoom-in-95 duration-155">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-[#00FFD1]" />
                <span>Remove Preset Tag</span>
              </span>
              <button
                type="button"
                onClick={() => setConfirmDeletePresetModal({ isOpen: false, tagToDelete: '' })}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Are you sure you want to delete the preset tag <strong className="text-pink-400 font-bold">#{confirmDeletePresetModal.tagToDelete}</strong> from your preset tag options? This will remove it from the list permanently.
            </p>
            
            <div className="flex items-center justify-end gap-3.5 pt-1.5">
              <button
                type="button"
                onClick={() => setConfirmDeletePresetModal({ isOpen: false, tagToDelete: '' })}
                className="px-4.5 py-2 rounded-lg border border-white/10 text-slate-350 hover:text-white hover:bg-white/5 text-[11px] font-bold tracking-wide uppercase transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePresetTag}
                className="px-4.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold tracking-wide uppercase transition-all shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SVG Color Blindness Filters Definition inside hidden container */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="sim-protanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.56667 0.43333 0 0 0
                                                 0.55833 0.44167 0 0 0
                                                 0 0.24167 0.75833 0 0
                                                 0 0 0 1 0"/>
          </filter>
          <filter id="sim-deuteranopia" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0
                                                 0.7 0.3 0 0 0
                                                 0 0.3 0.7 0 0
                                                 0 0 0 1 0"/>
          </filter>
          <filter id="sim-tritanopia" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0
                                                 0 0.43333 0.56667 0 0
                                                 0 0.475 0.525 0 0
                                                 0 0 0 1 0"/>
          </filter>
          <filter id="sim-achromatopsia" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0
                                                 0.299 0.587 0.114 0 0
                                                 0.299 0.587 0.114 0 0
                                                 0 0 0 1 0"/>
          </filter>
        </defs>
      </svg>

    </div>
  );
}
