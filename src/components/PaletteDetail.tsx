import React, { useState } from 'react';
import { ChevronLeft, Heart, Bookmark, Copy, Check, Code, Hash, Download, HelpCircle, Layers, Sliders, Share2, Link, ExternalLink, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Palette, SiteConfig } from '../types';
import { 
  getContrastColor, 
  hexToRgbString, 
  hexToHslString,
  buildTailwindConfig,
  buildCssVariables,
  buildJsonCode
} from '../utils';
import MockupPreviews from './MockupPreviews';

interface PaletteDetailProps {
  palette: Palette;
  onClose: () => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  siteConfig?: SiteConfig;
}

export default function PaletteDetail({ palette, onClose, onLike, onBookmark, siteConfig }: PaletteDetailProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<'hex' | 'rgb' | 'hsl' | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'tailwind' | 'css' | 'json'>('tailwind');
  const [codeCopied, setCodeCopied] = useState(false);

  // Sharing states & Deep-link calculations
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'twitter' | 'linkedin'>('twitter');
  const [snippetCopied, setSnippetCopied] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}?palette=${palette.id}`;
  const twitterSnippet = `Check out this awesome color palette "${palette.title}" on flatpalette! 🎨\n\nColors: ${palette.colors.join(' • ')}\n\nDiscover & export responsive design configs:`;
  const linkedinSnippet = `I just discovered an outstanding color configuration on flatpalette: "${palette.title}"!\n\nIt features an interactive dashboard, mockup previews, and custom design token compiler configs.\n\nExplore this color spectrum:`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(`${snippet}\n\n${shareUrl}`);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  // Clipboard copy handler for hex formulas
  const handleCopyColorValues = (value: string, index: number, type: 'hex' | 'rgb' | 'hsl') => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedType(null);
    }, 1500);
  };

  // Build the code payload dynamically based on active code format tab
  const getActiveCodePayload = () => {
    switch (activeCodeTab) {
      case 'tailwind':
        return buildTailwindConfig(palette.title, palette.colors);
      case 'css':
        return buildCssVariables(palette.title, palette.colors);
      case 'json':
        return buildJsonCode(palette.title, palette.colors);
    }
  };

  const handleCopyCodeBlock = () => {
    navigator.clipboard.writeText(getActiveCodePayload());
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleExportAsPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw elegant dark background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#0f172a'); // slate-900
    bgGradient.addColorStop(1, '#020617'); // slate-950
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Add subtle horizontal lines for clean structure
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.lineTo(950, 40);
    ctx.stroke();

    // 3. Draw Header Title and Branding metadata
    ctx.textBaseline = 'top';

    // Small category tracker/badge
    ctx.fillStyle = '#00FFD1'; // primary neon accent
    ctx.font = 'bold 12px monospace';
    ctx.fillText('COLOR PALETTE MATRIX • COOPERATIVE CC0', 60, 60);

    // Main title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px sans-serif';
    ctx.fillText(palette.title.toUpperCase(), 60, 85);

    // Tiny attribution
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '500 12px sans-serif';
    ctx.fillText('Generated via Harmony Space Studios', 60, 135);

    // 4. Draw the 5 color blocks
    const startX = 60;
    const startY = 180;
    const blockWidth = 168; // Space within 1000px with gaps
    const blockHeight = 280;
    const gap = 12;

    palette.colors.forEach((hex, index) => {
      const x = startX + index * (blockWidth + gap);
      const y = startY;

      // Draw rounded rectangle for the color swatch
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, blockWidth, blockHeight, 16);
      } else {
        const radius = 16;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + blockWidth - radius, y);
        ctx.quadraticCurveTo(x + blockWidth, y, x + blockWidth, y + radius);
        ctx.lineTo(x + blockWidth, y + blockHeight - radius);
        ctx.quadraticCurveTo(x + blockWidth, y + blockHeight, x + blockWidth - radius, y + blockHeight);
        ctx.lineTo(x + radius, y + blockHeight);
        ctx.quadraticCurveTo(x, y + blockHeight, x, y + blockHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      }
      ctx.closePath();
      ctx.fillStyle = hex;
      ctx.fill();

      // Draw thin elegant border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Add a small numbering badge inside the color block at top-left
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x + 12, y + 12, 32, 22, 6);
      } else {
        ctx.rect(x + 12, y + 12, 32, 22);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`0${index + 1}`, x + 12 + 16, y + 15);

      // Contrast color for text values inside the swatch
      const contrast = getContrastColor(hex);
      ctx.fillStyle = contrast;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      
      // Hex code label
      ctx.fillText(hex.toUpperCase(), x + blockWidth / 2, y + blockHeight - 32);

      // Mini "HEX" header label
      ctx.fillStyle = contrast === '#ffffff' ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.5)';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('HEX FORMULA', x + blockWidth / 2, y + blockHeight - 52);

      ctx.restore();
    });

    // 5. Footer Branding & Accent Block
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 520, canvas.width, 80);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.moveTo(0, 520);
    ctx.lineTo(canvas.width, 520);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '11px sans-serif';
    ctx.fillText('LICENSE: Creative Commons CC0 Public Domain. Free for commercial & personal creation systems.', 60, 560);

    // Decorative right mini blocks representing color slots
    const dotStartX = 840;
    const dotY = 560;
    palette.colors.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.arc(dotStartX + i * 18, dotY, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${palette.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-palette.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="palette-detail-page">
      
      {/* Back button Row */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <button
          onClick={onClose}
          id="detail-back-btn"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
        >
          <ChevronLeft className="h-4.5 w-4.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Grid Discovery Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="detail-export-png-btn"
            onClick={handleExportAsPng}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/10 bg-white/5 text-slate-300 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 rounded-full text-xs font-bold transition-all shadow-md backdrop-blur-md cursor-pointer"
            title="Export Palette as PNG"
          >
            <Download className="h-4 w-4 text-[#00FFD1]" />
            <span>Export PNG</span>
          </button>

          <button
            id="detail-share-palette-btn"
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/10 bg-white/5 text-slate-300 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 rounded-full text-xs font-bold transition-all shadow-md backdrop-blur-md cursor-pointer"
            title="Share Palette Spectrum"
          >
            <Share2 className="h-4 w-4 text-[#00FFD1]" style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1' }} />
            <span>Share Palette</span>
          </button>

          <button
            id={`detail-like-btn-${palette.id}`}
            onClick={(e) => onLike(palette.id, e)}
            className="flex items-center gap-1.5 px-4.5 py-2 border border-white/10 bg-white/5 text-slate-300 hover:text-pink-500 hover:border-pink-500/30 rounded-full text-xs font-bold transition-all shadow-md backdrop-blur-md"
          >
            <Heart className="h-4 w-4" />
            <span className="font-mono">{palette.likes}</span>
          </button>

          <button
            id={`detail-bookmark-btn-${palette.id}`}
            onClick={(e) => onBookmark(palette.id, e)}
            className="p-2 border border-white/10 bg-white/5 text-slate-350 hover:text-[#00FFD1] hover:border-[#00FFD1]/30 rounded-full transition-all shadow-md backdrop-blur-md"
            title="Add Bookmark"
          >
            <Bookmark className={`h-4.5 w-4.5 ${palette.bookmarks ? 'fill-[#00FFD1] text-[#00FFD1]' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Col-span 7): Main breakdown matrices */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header titles */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">
              <span>PALETTE PROFILE</span>
              <span>•</span>
              <span>CREATIVE COMMONS CC0</span>
            </div>
            <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight mt-1">{palette.title}</h2>
            <div className="flex flex-wrap gap-1 mt-3">
              {palette.tags.map(t => (
                <span key={t} className="text-xs bg-white/10 border border-white/5 text-slate-300 px-2.5 py-1 rounded-full font-bold">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Color Breakdown Grid blocks */}
          <div className="space-y-3.5" id="color-breakdown-ledger">
            {palette.colors.map((hex, index) => {
              const contrast = getContrastColor(hex);
              const rgb = hexToRgbString(hex);
              const hsl = hexToHslString(hex);

              return (
                <div 
                  key={index}
                  id={`slot-card-${index}`}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/20 hover:bg-white/10 transition-colors shadow-lg"
                >
                  {/* Left segment showing actual color strip */}
                  <div className="flex items-center gap-4.5 w-full sm:w-auto">
                    <div 
                      className="h-16 w-16 rounded-xl flex items-center justify-center font-black shadow-inner"
                      style={{ backgroundColor: hex, color: contrast }}
                    >
                      <span className="text-sm font-mono">0{index + 1}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-mono font-bold text-white uppercase">{hex}</span>
                        <span className="text-xs text-slate-500 font-mono font-bold">Slot {index + 1}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1 font-semibold">
                        <span>RGB: {rgb}</span>
                        <span>|</span>
                        <span>HSL: {hsl}</span>
                      </div>
                    </div>
                  </div>

                  {/* Copy actions toolbar */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                    {[
                      { type: 'hex', label: 'HEX', payload: hex },
                      { type: 'rgb', label: 'RGB', payload: rgb },
                      { type: 'hsl', label: 'HSL', payload: hsl },
                    ].map((act) => {
                      const isCopied = copiedIndex === index && copiedType === act.type;
                      return (
                        <button
                          key={act.type}
                          id={`copy-btn-${index}-${act.type}`}
                          onClick={() => handleCopyColorValues(act.payload, index, act.type as any)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-white/5 text-[10px] font-bold tracking-wider hover:text-[#00FFD1] transition-all cursor-pointer ${
                            isCopied 
                              ? 'text-emerald-400 border border-emerald-500/30' 
                              : 'text-slate-400 border border-white/5 hover:border-[#00FFD1]/30'
                          }`}
                        >
                          {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{isCopied ? 'COPIED' : act.label}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Mount Mockup Previews right below to provide amazing interactive live experience! */}
          <MockupPreviews colors={palette.colors} paletteTitle={palette.title} />

        </div>

        {/* Right Column (Col-span 5): Single-click code architecture exporter */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl space-y-5" id="code-exports-panel">
            
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-[#00FFD1]" />
              <h3 className="font-bold text-slate-100 text-base">Instant Config Integration</h3>
            </div>
            
            <p className="text-xs text-slate-450 leading-relaxed">
              Export this color system into standard design environment configs. Click to copy directly into your local codebase variables.
            </p>

            {/* Export Tabs selection toggle */}
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 text-[11px] font-bold backdrop-blur-md">
              {[
                { id: 'tailwind', label: 'Tailwind Config' },
                { id: 'css', label: 'CSS Variables' },
                { id: 'json', label: 'JSON String' }
              ].map((tab) => {
                const isSelected = activeCodeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`export-tab-${tab.id}`}
                    onClick={() => {
                      setActiveCodeTab(tab.id as any);
                      setCodeCopied(false);
                    }}
                    className={`flex-1 py-1.5 text-center rounded-full transition-all text-xs ${
                      isSelected 
                        ? 'bg-white/10 text-[#00FFD1] border border-white/10 font-black shadow-lg' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Code Highlight Box */}
            <div className="relative">
              <pre className="text-[11px] font-mono text-slate-300 bg-[#020617]/45 p-4.5 rounded-xl border border-white/10 overflow-x-auto h-64 leading-relaxed">
                <code>{getActiveCodePayload()}</code>
              </pre>

              <button
                id="copy-code-block-btn"
                onClick={handleCopyCodeBlock}
                className={`absolute top-3.5 right-3.5 p-2 rounded-lg bg-slate-900/90 border border-white/5 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold ${
                  codeCopied ? 'text-emerald-400 border-emerald-500/20' : ''
                }`}
              >
                {codeCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>COPIED CONFIG</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>

            {/* Help guidelines */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-start gap-3 backdrop-blur-md">
              <HelpCircle className="h-4 w-4 text-[#00FFD1] mt-0.5 flex-shrink-0" />
              <div className="text-[10px] text-slate-400 leading-normal">
                <span className="font-semibold block text-white mb-0.5">Integration Suggestion</span>
                Tailwind CSS settings can be safely copied directly into your tailwind configs under `extend.colors`. CSS Variables are recommended for global root access styles.
              </div>
            </div>

          </div>

          {/* Quick Details stats */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3.5 text-xs backdrop-blur-md shadow-xl">
            <h4 className="font-bold text-slate-200 uppercase tracking-widest font-mono text-[10px]">Architectural Log Parameters</h4>
            <div className="grid grid-cols-2 gap-3 font-mono text-slate-450">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="block text-[9px] text-slate-500 uppercase">VOTES / LIKES</span>
                <span className="text-white font-bold text-sm">{palette.likes} likes</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <span className="block text-[9px] text-slate-500 uppercase">GRID VIEWS</span>
                <span className="text-white font-bold text-sm">{palette.views || 480} reads</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg col-span-2">
                <span className="block text-[9px] text-slate-500 uppercase">PERSISTENT SIGNATURE</span>
                <span className="text-[#00FFD1] font-bold text-[10px] truncate block">{palette.id}-cc0-flatpalette-manifest-key</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Share Palette Modal Override */}
      {shareModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
          id="share-palette-modal"
          onClick={() => setShareModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-6 md:p-8 space-y-6 shadow-2xl relative"
            id="share-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              type="button"
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => setShareModalOpen(false)}
              id="close-share-modal-btn"
            >
              <span className="text-sm font-black px-1">✕</span>
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5">
              <span className="text-[10px] bg-[#00FFD1]/10 text-[#00FFD1] px-2.5 py-0.5 rounded font-mono font-black" style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1' }}>
                SHARE DEEP LINK MATRIX
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Share Palette System</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect your color profiles instantly. Share this palette with other creators, developers, or clients with deep-linked coordinate parameters.
              </p>
            </div>

            {/* Accent colored swatch showcase */}
            <div className="flex h-10 w-full rounded-lg overflow-hidden border border-white/10 shadow-md">
              {palette.colors.map((hex, i) => (
                <div 
                  key={i} 
                  className="flex-1 hover:flex-[1.5] transition-all duration-300 relative group cursor-pointer" 
                  style={{ backgroundColor: hex }}
                  title={hex}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity font-bold" style={{ color: getContrastColor(hex) }}>
                    {hex}
                  </span>
                </div>
              ))}
            </div>

            {/* Deep Linked URL Sharing */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono tracking-widest text-[#00FFD1] font-bold uppercase" style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1' }}>
                DEEP-LINKED PARAMETER LINK
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 select-all outline-none"
                  id="share-link-input"
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                    copiedLink 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-[#00FFD1]/10 text-[#00FFD1] border border-[#00FFD1]/20 hover:bg-[#00FFD1]/20'
                  }`}
                  style={!copiedLink ? { color: siteConfig?.primaryNeonAccent || '#00FFD1', borderColor: `${siteConfig?.primaryNeonAccent || '#00FFD1'}33` } : {}}
                  id="copy-share-link-btn"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'COPIED!' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Social Post Snippets */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <label className="block text-[10px] font-mono tracking-widest text-slate-300 font-bold uppercase">
                  PRE-GENERATED SOCIAL SNIPPETS
                </label>
                
                {/* Platform select tabs */}
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5 text-[10px] font-mono font-bold">
                  <button 
                    type="button"
                    onClick={() => { setActiveSnippetTab('twitter'); setSnippetCopied(false); }}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${activeSnippetTab === 'twitter' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    Twitter / X
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setActiveSnippetTab('linkedin'); setSnippetCopied(false); }}
                    className={`px-2.5 py-1 rounded transition-all cursor-pointer ${activeSnippetTab === 'linkedin' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    LinkedIn
                  </button>
                </div>
              </div>

              {/* Snippet box */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={4}
                  value={activeSnippetTab === 'twitter' ? `${twitterSnippet}\n${shareUrl}` : `${linkedinSnippet}\n\n${shareUrl}`}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 font-mono leading-relaxed resize-none outline-none focus:border-white/20"
                />
                
                <button
                  type="button"
                  onClick={() => handleCopySnippet(activeSnippetTab === 'twitter' ? twitterSnippet : linkedinSnippet)}
                  className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer bg-slate-900 border border-white/5 hover:text-white ${
                    snippetCopied ? 'text-emerald-400 border-emerald-500/20' : 'text-slate-400'
                  }`}
                  id="copy-snippet-btn"
                >
                  {snippetCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{snippetCopied ? 'SNIPPET COPIED!' : 'COPY SNIPPET'}</span>
                </button>
              </div>
            </div>

            {/* Direct Platform Intents Grid */}
            <div className="pt-2">
              <label className="block text-[9px] font-mono tracking-widest text-slate-500 font-bold uppercase mb-2">
                DIRECT SOCIAL SHARING REDIRECTS
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterSnippet)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/5 bg-white/5 hover:bg-sky-500/10 hover:border-sky-500/40 text-slate-350 hover:text-sky-400 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  id="share-twitter-direct"
                >
                  <Twitter className="h-4 w-4 text-sky-400" />
                  <span>X / Twitter</span>
                  <ExternalLink className="h-3 w-3 opacity-60 ml-auto sm:ml-0" />
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/5 bg-white/5 hover:bg-blue-600/10 hover:border-blue-500/40 text-slate-350 hover:text-blue-400 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  id="share-linkedin-direct"
                >
                  <Linkedin className="h-4 w-4 text-blue-400" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-60 ml-auto sm:ml-0" />
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-white/5 bg-white/5 hover:bg-blue-800/10 hover:border-blue-600/40 text-slate-350 hover:text-blue-500 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  id="share-facebook-direct"
                >
                  <Facebook className="h-4 w-4 text-blue-500" />
                  <span>Facebook</span>
                  <ExternalLink className="h-3 w-3 opacity-60 ml-auto sm:ml-0" />
                </a>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-500 font-mono leading-none pt-2">
              flatpalette Open Design System Registry • CC0 Public License
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
