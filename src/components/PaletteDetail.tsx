import React, { useState } from 'react';
import { ChevronLeft, Heart, Bookmark, Copy, Check, Code, Hash, Download, HelpCircle, Layers, Sliders, Share2, Link, ExternalLink, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Palette, SiteConfig } from '../types';
import { 
  getContrastColor, 
  hexToRgbString, 
  hexToHslString,
  buildTailwindConfig,
  buildCssVariables,
  buildJsonCode,
  getContrastRatio
} from '../utils';
import MockupPreviews from './MockupPreviews';
import PaletteCard from './PaletteCard';

interface PaletteDetailProps {
  palette: Palette;
  onClose: () => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  siteConfig?: SiteConfig;
  allPalettes: Palette[];
  onSelectPalette: (palette: Palette) => void;
}

export default function PaletteDetail({ 
  palette, 
  onClose, 
  onLike, 
  onBookmark, 
  siteConfig,
  allPalettes,
  onSelectPalette
}: PaletteDetailProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedType, setCopiedType] = useState<'hex' | 'rgb' | 'hsl' | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'tailwind' | 'css' | 'json'>('tailwind');
  const [codeCopied, setCodeCopied] = useState(false);

  // Limit of visible related palettes
  const [visibleRelatedLimit, setVisibleRelatedLimit] = useState(12);

  // Compute related palettes based on common tags, fallback to popular ones, excluding current
  const relatedPalettes = React.useMemo(() => {
    if (!allPalettes) return [];
    return allPalettes
      .filter((p) => p.id !== palette.id && p.approved)
      .map((p) => {
        const sharedTagsCount = p.tags.filter((t) => palette.tags.includes(t)).length;
        return { p, score: sharedTagsCount };
      })
      .sort((a, b) => b.score - a.score || b.p.likes - a.p.likes)
      .map((item) => item.p);
  }, [allPalettes, palette]);

  const displayedRelated = relatedPalettes.slice(0, visibleRelatedLimit);

  // Contrast Ratio Analyzer States
  const [analyzerBg, setAnalyzerBg] = useState(palette.colors[0]);
  const [analyzerFg, setAnalyzerFg] = useState(palette.colors[palette.colors.length - 1] || palette.colors[1]);
  const [analyzerText, setAnalyzerText] = useState("Empower accessibility and design with perfect clarity.");
  const [previewSize, setPreviewSize] = useState<'normal' | 'large'>('normal');

  // Social Share Card Generator States
  const [socialTitle, setSocialTitle] = useState(palette.title);
  const [socialSubtitle, setSocialSubtitle] = useState('Creative color spectrum curated on flatpalette.com');
  const [socialStyle, setSocialStyle] = useState<'columns' | 'bento' | 'minimal'>('columns');
  const [socialShowTags, setSocialShowTags] = useState(true);
  const [socialShowBrand, setSocialShowBrand] = useState(true);
  const [isDownloadingSocialCard, setIsDownloadingSocialCard] = useState(false);

  React.useEffect(() => {
    if (palette.colors && palette.colors.length > 0) {
      setAnalyzerBg(palette.colors[0]);
      setAnalyzerFg(palette.colors[palette.colors.length - 1] || palette.colors[1]);
    }
    setSocialTitle(palette.title);
  }, [palette]);


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

  const handleDownloadSocialCard = () => {
    setIsDownloadingSocialCard(true);
    
    // Slight artificial delay for stunning UI states
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsDownloadingSocialCard(false);
        return;
      }

      const colorsCount = palette.colors.length;

      if (socialStyle === 'columns') {
        // --- STYLE 1: Spectrum Columns ---
        // Solid deep dark space background
        ctx.fillStyle = '#0a0f1d';
        ctx.fillRect(0, 0, 1200, 630);

        // Radial shine on top left
        const radGrad = ctx.createRadialGradient(240, 315, 50, 240, 315, 450);
        radGrad.addColorStop(0, 'rgba(0, 255, 209, 0.05)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 480, 630);

        // Sidebar divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(480, 0);
        ctx.lineTo(480, 630);
        ctx.stroke();

        // 1. Curated metadata line
        ctx.fillStyle = siteConfig?.primaryNeonAccent || '#00FFD1';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('CURATED SPECIFICATION • COOPERATIVE CC0', 45, 75);

        // 2. Title header
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 38px sans-serif';
        const maxTitleW = 390;
        const words = socialTitle.split(' ');
        let currentLine = '';
        const titleLines: string[] = [];
        
        for (let n = 0; n < words.length; n++) {
          let testLine = currentLine + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxTitleW && n > 0) {
            titleLines.push(currentLine);
            currentLine = words[n] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        titleLines.push(currentLine);

        let currentY = 120;
        titleLines.forEach((line) => {
          ctx.fillText(line.trim().toUpperCase(), 45, currentY);
          currentY += 46;
        });

        // 3. Custom subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 15px sans-serif';
        const subWords = socialSubtitle.split(' ');
        let currentSubLine = '';
        const subLines: string[] = [];
        
        for (let n = 0; n < subWords.length; n++) {
          let testLine = currentSubLine + subWords[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxTitleW && n > 0) {
            subLines.push(currentSubLine);
            currentSubLine = subWords[n] + ' ';
          } else {
            currentSubLine = testLine;
          }
        }
        subLines.push(currentSubLine);

        currentY += 15;
        subLines.forEach((line) => {
          ctx.fillText(line.trim(), 45, currentY);
          currentY += 24;
        });

        // 4. Tags
        if (socialShowTags) {
          ctx.font = '700 13px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          let tagsLabel = palette.tags.map(t => `#${t}`).join('  ');
          if (tagsLabel.length > 42) tagsLabel = tagsLabel.slice(0, 42) + '...';
          ctx.fillText(tagsLabel, 45, currentY + 30);
        }

        // 5. Watermark info block
        if (socialShowBrand) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(45, 525, 390, 45);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.strokeRect(45, 525, 390, 45);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('DISCOVER MORE AT HTTPS://FLATPALETTE.COM', 65, 552);
        }

        // 6. Draw Columns of colors on the right side
        const colWidth = 720 / colorsCount;
        palette.colors.forEach((hex, i) => {
          const colX = 480 + i * colWidth;
          ctx.fillStyle = hex;
          ctx.fillRect(colX, 0, colWidth, 630);

          const contrast = getContrastColor(hex);
          
          // Slot numbering
          ctx.fillStyle = contrast === '#ffffff' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.35)';
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`0${i+1}`, colX + colWidth / 2, 45);

          // Hex string rotated vertical or shown at bottom
          ctx.fillStyle = contrast;
          ctx.font = 'bold 18px monospace';
          ctx.fillText(hex.toUpperCase(), colX + colWidth / 2, 580);
        });
        
        ctx.textAlign = 'left'; // Reset

      } else if (socialStyle === 'bento') {
        // --- STYLE 2: Bento Swatches ---
        ctx.fillStyle = '#070a13';
        ctx.fillRect(0, 0, 1200, 630);

        // Sidebar dividing line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(400, 0);
        ctx.lineTo(400, 630);
        ctx.stroke();

        // Left sidebar texting
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('FLATPALETTE BENTO METRICS', 45, 75);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 34px sans-serif';
        const maxSidebarW = 310;
        const words = socialTitle.split(' ');
        let currentLine = '';
        const titleLines: string[] = [];
        
        for (let n = 0; n < words.length; n++) {
          let testLine = currentLine + words[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxSidebarW && n > 0) {
            titleLines.push(currentLine);
            currentLine = words[n] + ' ';
          } else {
            currentLine = testLine;
          }
        }
        titleLines.push(currentLine);

        let currentY = 120;
        titleLines.forEach((line) => {
          ctx.fillText(line.trim().toUpperCase(), 45, currentY);
          currentY += 40;
        });

        // custom sub info
        ctx.fillStyle = '#64748b';
        ctx.font = '500 13px sans-serif';
        const subWords = socialSubtitle.split(' ');
        let currentSubLine = '';
        const subLines: string[] = [];
        
        for (let n = 0; n < subWords.length; n++) {
          let testLine = currentSubLine + subWords[n] + ' ';
          let metrics = ctx.measureText(testLine);
          if (metrics.width > maxSidebarW && n > 0) {
            subLines.push(currentSubLine);
            currentSubLine = subWords[n] + ' ';
          } else {
            currentSubLine = testLine;
          }
        }
        subLines.push(currentSubLine);

        currentY += 15;
        subLines.forEach((line) => {
          ctx.fillText(line.trim(), 45, currentY);
          currentY += 21;
        });

        // Tags
        if (socialShowTags) {
          ctx.fillStyle = siteConfig?.primaryNeonAccent || '#00FFD1';
          ctx.font = '700 11px monospace';
          let tagsLabel = palette.tags.map(t => `#${t}`).join('  ');
          if (tagsLabel.length > 36) tagsLabel = tagsLabel.slice(0, 36) + '...';
          ctx.fillText(tagsLabel, 45, currentY + 30);
        }

        // Brand footnote
        if (socialShowBrand) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('DESIGNED ON HTTPS://FLATPALETTE.COM', 45, 555);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.font = 'normal 10px sans-serif';
          ctx.fillText('CC0 Public Domain Creative Commons Spec', 45, 575);
        }

        // Draw Swatches
        const drawGridTile = (x: number, y: number, w: number, h: number, hex: string, label: string) => {
          ctx.save();
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, 16);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.fillStyle = hex;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();

          const contrast = getContrastColor(hex);
          ctx.fillStyle = contrast;
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(hex.toUpperCase(), x + w/2, y + h - 25);

          ctx.fillStyle = contrast === '#ffffff' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.4)';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(label, x + w/2, y + 25);
          ctx.restore();
        };

        const g = 18;
        const s1x = 400 + 40;
        const s1y = 40;
        const s1w = 340;
        const s1h = 340;

        const s2x = 400 + 40 + 340 + g;
        const s2y = 40;
        const s2w = 340;
        const s2h = 160;

        const s3x = 400 + 40 + 340 + g;
        const s3y = 40 + 160 + g;
        const s3w = 161;
        const s3h = 160;

        const s4x = 400 + 40 + 340 + g + 161 + g;
        const s4y = 40 + 160 + g;
        const s4w = 161;
        const s4h = 160;

        const s5x = 400 + 40;
        const s5y = 40 + 340 + g;
        const s5w = 698;
        const s5h = 190;

        const colors = palette.colors;
        drawGridTile(s1x, s1y, s1w, s1h, colors[0] || '#ffffff', 'DOMINANT ACCENT 01');
        drawGridTile(s2x, s2y, s2w, s2h, colors[1] || '#ffffff', 'SUPPORT SLOP 02');
        drawGridTile(s3x, s3y, s3w, s3h, colors[2] || '#ffffff', 'ACCENT 03');
        drawGridTile(s4x, s4y, s4w, s4h, colors[3] || '#ffffff', 'ACCENT 04');
        drawGridTile(s5x, s5y, s5w, s5h, colors[4] || '#ffffff', 'DARK FOUNDATION BASE 05');

      } else {
        // --- STYLE 3: Minimalist Horizontal Bands with Floating Placard ---
        const rowHeight = 630 / colorsCount;
        palette.colors.forEach((hex, i) => {
          ctx.fillStyle = hex;
          ctx.fillRect(0, i * rowHeight, 1200, rowHeight);

          const contrast = getContrastColor(hex);
          ctx.fillStyle = contrast === '#ffffff' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.18)';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`0${i+1}`, 20, i * rowHeight + 25);
        });

        // Floating placard in middle
        const placardW = 560;
        const placardH = 260;
        const placardX = (1200 - placardW) / 2;
        const placardY = (630 - placardH) / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 12;

        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(placardX, placardY, placardW, placardH, 20);
        } else {
          ctx.rect(placardX, placardY, placardW, placardH);
        }
        ctx.fillStyle = '#0a0d16';
        ctx.fill();
        ctx.shadowColor = 'transparent'; // Reset

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = 'center';

        ctx.fillStyle = siteConfig?.primaryNeonAccent || '#00FFD1';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('COLOR ARCHITECTURE PORTAL', 1200 / 2, placardY + 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 30px sans-serif';
        ctx.fillText(socialTitle.toUpperCase(), 1200 / 2, placardY + 95);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 12px sans-serif';
        ctx.fillText(socialSubtitle, 1200 / 2, placardY + 135);

        // Circular dots indicating colors inside the placard
        const dotY = placardY + 180;
        const spacing = 32;
        const size = 10;
        const startX = (1200 / 2) - ((colorsCount - 1) * spacing) / 2;

        palette.colors.forEach((hex, i) => {
          const dotX = startX + i * spacing;
          ctx.fillStyle = hex;
          ctx.beginPath();
          ctx.arc(dotX, dotY, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        if (socialShowBrand) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('FLATPALETTE.COM • CC0 SPECS', 1200 / 2, placardY + placardH - 25);
        }

        ctx.restore();
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${palette.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-social-card.png`;
      link.href = dataUrl;
      link.click();
      
      setIsDownloadingSocialCard(false);
    }, 850);
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

      {/* Contrast Ratio Analyzer Section */}
      <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl space-y-6" id="contrast-analyzer-section">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00FFD1] uppercase tracking-widest font-bold" style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1' }}>
            <span>ACCESSIBILITY COMPLIANCE</span>
            <span>•</span>
            <span>WCAG 2.0 STANDARDS</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mt-1">Contrast Ratio Analyzer</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Verify readability scores of pairing foreground colors against backgrounds in this palette. Ensure conformity with Web Content Accessibility Guidelines (WCAG) AA and AAA specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Block: Interactive Workshop (Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">1. Color Pair Selector</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Background Selector */}
                <div className="space-y-2">
                  <label className="block text-xs text-slate-300 font-bold">Background Color :</label>
                  <div className="flex flex-wrap gap-2">
                    {palette.colors.map((color, i) => {
                      const isBgSelected = analyzerBg === color;
                      return (
                        <button
                          key={`bg-${color}-${i}`}
                          onClick={() => setAnalyzerBg(color)}
                          className={`group relative h-10 w-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isBgSelected 
                              ? 'border-white scale-110 shadow-lg' 
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Select Color Slot 0${i+1} (${color}) as Background`}
                        >
                          <span className={`text-[10px] font-mono font-black ${
                            getContrastColor(color) === '#ffffff' ? 'text-white' : 'text-black'
                          }`}>
                            0{i+1}
                          </span>
                          {isBgSelected && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#00FFD1] rounded-full" style={{ backgroundColor: siteConfig?.primaryNeonAccent || '#00FFD1' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">{analyzerBg.toUpperCase()}</div>
                </div>

                {/* Foreground Selector */}
                <div className="space-y-2">
                  <label className="block text-xs text-slate-300 font-bold">Text / Foreground Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {palette.colors.map((color, i) => {
                      const isFgSelected = analyzerFg === color;
                      return (
                        <button
                          key={`fg-${color}-${i}`}
                          onClick={() => setAnalyzerFg(color)}
                          className={`group relative h-10 w-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                            isFgSelected 
                              ? 'border-white scale-110 shadow-lg' 
                              : 'border-white/10 hover:border-white/30'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Select Color Slot 0${i+1} (${color}) as Text`}
                        >
                          <span className={`text-[10px] font-mono font-black ${
                            getContrastColor(color) === '#ffffff' ? 'text-white' : 'text-black'
                          }`}>
                            0{i+1}
                          </span>
                          {isFgSelected && (
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#00FFD1] rounded-full" style={{ backgroundColor: siteConfig?.primaryNeonAccent || '#00FFD1' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 font-semibold">{analyzerFg.toUpperCase()}</div>
                </div>
              </div>

              {/* Live Preview interactive playground container */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">2. Live Demonstration Sandbox</span>
                  
                  {/* Size toggles */}
                  <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10 text-[9.5px] font-bold">
                    <button 
                      onClick={() => setPreviewSize('normal')}
                      className={`px-2.5 py-1 rounded-md transition-all ${previewSize === 'normal' ? 'bg-white/10 text-white font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      Normal (14px)
                    </button>
                    <button 
                      onClick={() => setPreviewSize('large')}
                      className={`px-2.5 py-1 rounded-md transition-all ${previewSize === 'large' ? 'bg-white/10 text-white font-black' : 'text-slate-400 hover:text-white'}`}
                    >
                      Large (20px Bold)
                    </button>
                  </div>
                </div>

                <div 
                  className="rounded-xl p-6 min-h-[140px] flex flex-col justify-between transition-all duration-300 border border-white/5 relative overflow-hidden"
                  style={{ backgroundColor: analyzerBg }}
                >
                  <input 
                    type="text"
                    value={analyzerText}
                    onChange={(e) => setAnalyzerText(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 w-full text-left font-sans transition-all tracking-tight leading-relaxed select-all"
                    style={{ 
                      color: analyzerFg,
                      fontSize: previewSize === 'large' ? '20px' : '14px',
                      fontWeight: previewSize === 'large' ? 800 : 500
                    }}
                    title="Click to edit preview message"
                    placeholder="Type customized mock text..."
                  />

                  {/* Diary notes verifying typography guidelines */}
                  <div className="space-y-1 pt-4 opacity-80 border-t border-white/10 mt-4 pointer-events-none">
                    <p style={{ color: analyzerFg }} className="text-[10px] font-mono">
                      Background: {analyzerBg.toUpperCase()} | Foreground: {analyzerFg.toUpperCase()}
                    </p>
                    <p style={{ color: analyzerFg }} className="text-[10px] leading-tight font-medium max-w-sm">
                      Evaluate active color spectrums against paragraphs, input elements, buttons, and system displays.
                    </p>
                  </div>
                </div>
                <div className="text-[9px] text-slate-550 italic">★ ProTip: Click and edit the message text directly to simulate custom values!</div>
              </div>
            </div>
          </div>

          {/* Right Block: Results Metrics & 2D Matrix (Col-span 5) */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            {/* Real-time score ticker */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">3. Contrast Metrics Score</span>
                  <div className="text-4xl font-black text-white mt-1.5 font-mono tracking-tight">
                    {getContrastRatio(analyzerBg, analyzerFg).toFixed(2)}
                    <span className="text-sm text-slate-400 font-medium ml-1">: 1</span>
                  </div>
                </div>
                
                {/* Visual meter bubble */}
                <div className="h-10 px-3 rounded-lg flex items-center justify-center font-bold text-xs" style={{
                  backgroundColor: getContrastRatio(analyzerBg, analyzerFg) >= 7.0 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : getContrastRatio(analyzerBg, analyzerFg) >= 4.5 
                    ? 'rgba(20, 184, 166, 0.15)' 
                    : getContrastRatio(analyzerBg, analyzerFg) >= 3.0 
                    ? 'rgba(234, 179, 8, 0.15)' 
                    : 'rgba(239, 68, 68, 0.15)',
                  color: getContrastRatio(analyzerBg, analyzerFg) >= 7.0 
                    ? '#10b981' 
                    : getContrastRatio(analyzerBg, analyzerFg) >= 4.5 
                    ? '#14b8a6' 
                    : getContrastRatio(analyzerBg, analyzerFg) >= 3.0 
                    ? '#eab308' 
                    : '#ef4444',
                  border: `1px solid ${
                    getContrastRatio(analyzerBg, analyzerFg) >= 7.0 
                      ? 'rgba(16, 185, 129, 0.3)' 
                      : getContrastRatio(analyzerBg, analyzerFg) >= 4.5 
                      ? 'rgba(20, 184, 166, 0.3)' 
                      : getContrastRatio(analyzerBg, analyzerFg) >= 3.0 
                      ? 'rgba(234, 179, 8, 0.3)' 
                      : 'rgba(239, 68, 68, 0.3)'
                  }`
                }}>
                  {getContrastRatio(analyzerBg, analyzerFg) >= 7.0 
                    ? 'Triple-A Superb' 
                    : getContrastRatio(analyzerBg, analyzerFg) >= 4.5 
                    ? 'Double-A Compliant' 
                    : getContrastRatio(analyzerBg, analyzerFg) >= 3.0 
                    ? 'Large Text Only' 
                    : 'Poor Contrast'}
                </div>
              </div>

              {/* Animated/visual simple speed gauge bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min((getContrastRatio(analyzerBg, analyzerFg) / 21) * 100, 100)}%`,
                    backgroundColor: getContrastRatio(analyzerBg, analyzerFg) >= 7 
                      ? '#10b981' 
                      : getContrastRatio(analyzerBg, analyzerFg) >= 4.5 
                      ? '#14b8a6' 
                      : getContrastRatio(analyzerBg, analyzerFg) >= 3 
                      ? '#eab308' 
                      : '#ef4444'
                  }}
                />
              </div>

              {/* Multi-Tier checklist */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {[
                  { label: 'AA Normal Text', rule: 'Req Ratio ≥ 4.5:1', pass: getContrastRatio(analyzerBg, analyzerFg) >= 4.5 },
                  { label: 'AA Large Text', rule: 'Req Ratio ≥ 3.0:1', pass: getContrastRatio(analyzerBg, analyzerFg) >= 3.0 },
                  { label: 'AAA Normal Text', rule: 'Req Ratio ≥ 7.0:1', pass: getContrastRatio(analyzerBg, analyzerFg) >= 7.0 },
                  { label: 'AAA Large Text', rule: 'Req Ratio ≥ 4.5:1', pass: getContrastRatio(analyzerBg, analyzerFg) >= 4.5 },
                ].map((tier, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-lg border flex flex-col justify-between transition-colors ${
                      tier.pass 
                        ? 'bg-emerald-950/20 border-emerald-500/10 text-emerald-400' 
                        : 'bg-red-950/20 border-red-500/10 text-red-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono tracking-wide font-black uppercase">{tier.label}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] opacity-70 font-semibold">{tier.rule}</span>
                      <span className="text-[10px] font-black tracking-widest uppercase">
                        {tier.pass ? '✓ PASS' : '✗ FAIL'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrix Analyzer */}
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">4. All Pairings Matrix (Bg vs Fg)</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Click any coordinate inside the 5×5 matrix to instantly sync it to the workspace testing sandbox above.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[10px] font-mono">
                  <thead>
                    <tr>
                      <th className="p-1 text-[8.5px] text-slate-500 font-bold bg-white/2">BG \ FG</th>
                      {palette.colors.map((_, colIdx) => (
                        <th key={`head-fg-${colIdx}`} className="p-1 font-black bg-white/2 text-slate-300">
                          0{colIdx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {palette.colors.map((bgHex, rowIdx) => (
                      <tr key={`matrix-row-${rowIdx}`} className="border-t border-white/5">
                        {/* Background label */}
                        <td className="p-1 font-black bg-white/2 text-slate-300 text-left items-center gap-1.5">
                          0{rowIdx + 1}
                        </td>
                        {palette.colors.map((fgHex, colIdx) => {
                          const ratio = getContrastRatio(bgHex, fgHex);
                          const isCurrentMatch = analyzerBg === bgHex && analyzerFg === fgHex;
                          
                          // Style code: bg index same as fg index is invalid contrast (1:1)
                          const isDiagonal = rowIdx === colIdx;
                          let textStyle = "text-slate-450";
                          if (ratio >= 7) textStyle = "text-emerald-400 font-bold";
                          else if (ratio >= 4.5) textStyle = "text-teal-400 font-bold";
                          else if (ratio >= 3) textStyle = "text-yellow-400";
                          else textStyle = "text-red-400/60";

                          return (
                            <td 
                              key={`matrix-cell-${rowIdx}-${colIdx}`}
                              onClick={() => {
                                if (!isDiagonal) {
                                  setAnalyzerBg(bgHex);
                                  setAnalyzerFg(fgHex);
                                }
                              }}
                              className={`p-1.5 transition-all cursor-pointer relative group select-none ${
                                isDiagonal ? 'cursor-not-allowed opacity-30 bg-black/20' : 'hover:bg-white/10'
                              } ${isCurrentMatch ? 'bg-[#00FFD1]/10 outline outline-1 outline-[#00FFD1]/30 rounded' : ''}`}
                              title={
                                isDiagonal 
                                  ? 'Identical colors (No Contrast)' 
                                  : `Combine bg: 0${rowIdx+1} with fg: 0${colIdx+1}. Contrast Ratio is ${ratio.toFixed(2)}:1`
                              }
                            >
                              {isDiagonal ? (
                                <span className="text-[10px] text-slate-650">—</span>
                              ) : (
                                <span className={textStyle}>{ratio.toFixed(1)}</span>
                              )}
                              
                              {/* On-hover overlay showing brief label */}
                              {!isDiagonal && (
                                <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-[9px] text-white p-1 rounded whitespace-nowrap shadow-xl mb-1 z-10 font-sans pointer-events-none">
                                  0{rowIdx+1} bg \ 0{colIdx+1} fg ({ratio.toFixed(2)}:1)
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Social Share Card Generator Section */}
      <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl space-y-6" id="social-share-card-generator-section">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00FFD1] uppercase tracking-widest font-bold" style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1' }}>
            <span>DESIGN EXPORT PACK</span>
            <span>•</span>
            <span>SOCIAL SHARE MEDIA CARD</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight mt-1">Social Share Card Generator</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Generate and customize a beautiful, high-resolution (1200×630 px) presentation card of this palette. Perfect for sharing on Twitter, LinkedIn, Instagram, or portfolios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Card Customizer Controls (Col-span 5) */}
          <div className="lg:col-span-5 bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">1. Configure Card Content</span>

              {/* Layout Selectors */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300 font-bold">Select Presentation Layout:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'columns', label: 'Spectrum Columns' },
                    { id: 'bento', label: 'Bento Grid' },
                    { id: 'minimal', label: 'Minimal Card' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSocialStyle(style.id as any)}
                      className={`py-2 text-[10.5px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        socialStyle === style.id
                          ? 'border-[#00FFD1] bg-[#00FFD1]/10 text-[#00FFD1]'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                      style={{ 
                        borderColor: socialStyle === style.id ? siteConfig?.primaryNeonAccent : undefined,
                        color: socialStyle === style.id ? siteConfig?.primaryNeonAccent : undefined
                      }}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Card Title Input */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300 font-bold">Custom Palette Title :</label>
                <input
                  type="text"
                  value={socialTitle}
                  onChange={(e) => setSocialTitle(e.target.value)}
                  maxLength={40}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-550 focus:border-[#00FFD1]/55 outline-none font-bold"
                  placeholder="Enter custom card heading..."
                />
              </div>

              {/* Custom Card Subtitle Input */}
              <div className="space-y-1.5">
                <label className="block text-xs text-slate-300 font-bold">Slogan / Custom Subtitle :</label>
                <input
                  type="text"
                  value={socialSubtitle}
                  onChange={(e) => setSocialSubtitle(e.target.value)}
                  maxLength={80}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-550 focus:border-[#00FFD1]/55 outline-none"
                  placeholder="Enter custom card description..."
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Tag Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-slate-900/40">
                  <span className="text-[10px] text-slate-350 font-bold uppercase tracking-wider">Include Tags</span>
                  <button
                    onClick={() => setSocialShowTags(!socialShowTags)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      socialShowTags ? 'bg-[#00FFD1]' : 'bg-slate-800'
                    }`}
                    style={{ backgroundColor: socialShowTags ? (siteConfig?.primaryNeonAccent || '#00FFD1') : undefined }}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-slate-950 transition-all ${
                      socialShowTags ? 'left-[18px]' : 'left-[2px]'
                    }`} />
                  </button>
                </div>

                {/* Brand Toggle */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-slate-900/40">
                  <span className="text-[10px] text-slate-350 font-bold uppercase tracking-wider">Use Brand Mark</span>
                  <button
                    onClick={() => setSocialShowBrand(!socialShowBrand)}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                      socialShowBrand ? 'bg-[#00FFD1]' : 'bg-slate-800'
                    }`}
                    style={{ backgroundColor: socialShowBrand ? (siteConfig?.primaryNeonAccent || '#00FFD1') : undefined }}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-slate-950 transition-all ${
                      socialShowBrand ? 'left-[18px]' : 'left-[2px]'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Direct compilation action btn */}
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={handleDownloadSocialCard}
                disabled={isDownloadingSocialCard}
                className="w-full py-3 bg-[#00FFD1] hover:bg-[#00ffc2]/90 disabled:opacity-50 text-slate-950 font-black tracking-widest text-xs uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: siteConfig?.primaryNeonAccent || '#00FFD1' }}
              >
                {isDownloadingSocialCard ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Assembling Card Graphics...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Social PNG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Premium Real-time Live Render Preview (Col-span 7) */}
          <div className="lg:col-span-7 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">2. Live Presentation Card Mock (1.91 : 1 Aspect)</span>
            
            <div className="relative border border-white/10 rounded-xl overflow-hidden aspect-[1.91/1] w-full bg-slate-950 shadow-2xl flex">
              {/* Spinner loader layout overlay if working under download */}
              {isDownloadingSocialCard && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-2 text-center animate-fade-in">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-700 border-t-[#00FFD1] animate-spin" style={{ borderTopColor: siteConfig?.primaryNeonAccent || '#00FFD1' }} />
                  <p className="text-xs font-mono text-slate-300 font-bold">Rendering pixel-perfect vector context...</p>
                </div>
              )}

              {/* Template Style 1: Column Stripes */}
              {socialStyle === 'columns' && (
                <div className="w-full h-full flex bg-[#0a0f1d]">
                  {/* Info block (40%) */}
                  <div className="w-[40%] p-3.5 sm:p-5 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
                    {/* Glowing highlight sphere */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,209,0.06),transparent_70%)] pointer-events-none" />
                    
                    <div className="space-y-1 z-10">
                      <span className="text-[7.5px] font-mono font-bold uppercase tracking-widest text-[#00FFD1]" style={{ color: siteConfig?.primaryNeonAccent }}>
                        Curated Spec • flatpalette
                      </span>
                      <h4 className="text-[15px] sm:text-[18px] font-black tracking-tight text-white line-clamp-3 uppercase leading-tight font-sans">
                        {socialTitle || 'UNTITLED SPECTRUM'}
                      </h4>
                      <p className="text-slate-400 text-[8px] sm:text-[10px] tracking-normal leading-relaxed line-clamp-3 font-medium">
                        {socialSubtitle || 'Creative color configuration.'}
                      </p>
                    </div>

                    <div className="space-y-2.5 z-10">
                      {socialShowTags && (
                        <div className="text-[8px] font-mono text-slate-500 font-bold truncate">
                          {palette.tags.map(t => `#${t}`).join(' ')}
                        </div>
                      )}
                      
                      {socialShowBrand && (
                        <div className="border border-white/10 bg-white/2 p-1.5 rounded text-[8px] font-mono text-white/50 text-center tracking-wider font-extrabold">
                          FLATPALETTE.COM
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Colors block (60%) */}
                  <div className="w-[60%] flex h-full">
                    {palette.colors.map((hex, i) => {
                      const contrast = getContrastColor(hex);
                      return (
                        <div 
                          key={i} 
                          className="flex-1 h-full flex flex-col justify-between p-2.5 relative group transition-all"
                          style={{ backgroundColor: hex }}
                        >
                          <span 
                            className="text-[9px] font-mono font-extrabold"
                            style={{ color: contrast === '#ffffff' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}
                          >
                            0{i+1}
                          </span>
                          <span 
                            className="text-[9px] sm:text-[10.5px] font-mono font-black tracking-wide"
                            style={{ color: contrast }}
                          >
                            {hex.toUpperCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Template Style 2: Bento Grid */}
              {socialStyle === 'bento' && (
                <div className="w-full h-full flex bg-[#070a13]">
                  {/* Left segment (35%) */}
                  <div className="w-[35%] p-4 sm:p-5 flex flex-col justify-between border-r border-white/5 z-10 relative">
                    <div className="space-y-1">
                      <span className="text-[7.5px] font-mono font-bold uppercase tracking-widest text-slate-500">
                        BENTO SPEC FRAMEWORK
                      </span>
                      <h4 className="text-[14px] sm:text-[17px] font-black tracking-tight text-white line-clamp-3 uppercase leading-tight">
                        {socialTitle || 'UNTITLED SPEC'}
                      </h4>
                      <p className="text-slate-450 text-[8px] sm:text-[9.5px] leading-relaxed line-clamp-3">
                        {socialSubtitle}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {socialShowTags && (
                        <div className="text-[8px] font-mono text-[#00FFD1] uppercase tracking-wider font-extrabold" style={{ color: siteConfig?.primaryNeonAccent }}>
                          {palette.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
                        </div>
                      )}
                      
                      {socialShowBrand && (
                        <div className="text-[8px] text-slate-500 font-mono">
                          CC0 • FLATPALETTE.COM
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right segment: Bento Cells (65%) */}
                  <div className="w-[65%] grid grid-cols-12 gap-1.5 p-2 bg-black/15">
                    {/* Swatch 1: Large square */}
                    <div 
                      className="col-span-6 row-span-2 rounded-lg flex flex-col justify-between p-2 sm:p-2.5 border border-white/5 shadow"
                      style={{ backgroundColor: palette.colors[0] }}
                    >
                      <span className="text-[8px] sm:text-[9px] font-mono font-extrabold" style={{ color: getContrastColor(palette.colors[0]) === '#ffffff' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}>
                        DOMINANT
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono font-black" style={{ color: getContrastColor(palette.colors[0]) }}>
                        {palette.colors[0]?.toUpperCase()}
                      </span>
                    </div>

                    {/* Swatch 2: Wide Horizontal */}
                    <div 
                      className="col-span-6 rounded-lg flex flex-col justify-between p-1.5 sm:p-2 border border-white/5 shadow"
                      style={{ backgroundColor: palette.colors[1] || palette.colors[0] }}
                    >
                      <span className="text-[8px] font-mono font-bold" style={{ color: getContrastColor(palette.colors[1] || palette.colors[0]) === '#ffffff' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)' }}>
                        SUPPORT
                      </span>
                      <span className="text-[8.5px] sm:text-[9px] font-mono font-black" style={{ color: getContrastColor(palette.colors[1] || palette.colors[0]) }}>
                        {palette.colors[1]?.toUpperCase() || palette.colors[0]?.toUpperCase()}
                      </span>
                    </div>

                    {/* Swatch 3: Accent A */}
                    <div 
                      className="col-span-3 rounded-lg flex flex-col justify-between p-1.5 border border-white/5"
                      style={{ backgroundColor: palette.colors[2] || palette.colors[0] }}
                    >
                      <span className="text-[8px] font-mono font-black" style={{ color: getContrastColor(palette.colors[2] || palette.colors[0]) }}>
                        {palette.colors[2]?.toUpperCase().slice(0, 4) || palette.colors[0]?.toUpperCase().slice(0,4)}...
                      </span>
                    </div>

                    {/* Swatch 4: Accent B */}
                    <div 
                      className="col-span-3 rounded-lg flex flex-col justify-between p-1.5 border border-white/5"
                      style={{ backgroundColor: palette.colors[3] || palette.colors[0] }}
                    >
                      <span className="text-[8px] font-mono font-black" style={{ color: getContrastColor(palette.colors[3] || palette.colors[0]) }}>
                        {palette.colors[3]?.toUpperCase().slice(0, 4) || palette.colors[0]?.toUpperCase().slice(0,4)}...
                      </span>
                    </div>

                    {/* Swatch 5: Full Width Foot block */}
                    <div 
                      className="col-span-12 rounded-lg flex flex-col justify-between p-1.5 sm:p-2 border border-white/5"
                      style={{ backgroundColor: palette.colors[4] || palette.colors[0] }}
                    >
                      <span className="text-[8.5px] font-mono font-black" style={{ color: getContrastColor(palette.colors[4] || palette.colors[0]) }}>
                        BASE: {palette.colors[4]?.toUpperCase() || palette.colors[0]?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Style 3: Minimal Center Card */}
              {socialStyle === 'minimal' && (
                <div className="w-full h-full relative flex flex-col overflow-hidden">
                  {/* Backdrop strips */}
                  <div className="absolute inset-0 flex flex-col h-full w-full pointer-events-none">
                    {palette.colors.map((hex, i) => (
                      <div key={i} className="flex-1 w-full" style={{ backgroundColor: hex }} />
                    ))}
                  </div>

                  {/* Center Floating Placard */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] bg-[#0a0d16] border border-white/10 rounded-xl px-4 py-3 shadow-2xl flex flex-col items-center text-center space-y-1 sm:space-y-1.5 z-10">
                    <span className="text-[7px] font-mono text-[#00FFD1] font-bold tracking-widest uppercase" style={{ color: siteConfig?.primaryNeonAccent }}>
                      COLOR ARCHITECTURE
                    </span>
                    <h4 className="text-[12px] sm:text-[14px] font-black uppercase text-white tracking-normal line-clamp-1">
                      {socialTitle || 'UNTITLED SPECTRUM'}
                    </h4>
                    <p className="text-slate-450 text-[7px] sm:text-[8px] line-clamp-1 leading-normal max-w-[220px]">
                      {socialSubtitle}
                    </p>

                    {/* Dots indicator list */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {palette.colors.map((hex, i) => (
                        <div 
                          key={i} 
                          className="w-2 h-2 rounded-full border border-white/10" 
                          style={{ backgroundColor: hex }} 
                        />
                      ))}
                    </div>

                    {socialShowBrand && (
                      <span className="text-[6.5px] font-mono text-slate-500 font-extrabold uppercase mt-1 tracking-wider">
                        FLATPALETTE.COM • COOPERATIVE
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="text-[9px] font-mono text-slate-500 text-center italic">
              ★ Tip: The downloaded PNG is rendered in crisp vector resolution (1200×630 pixels) regardless of preview window scaling factor.
            </div>
          </div>
        </div>
      </div>

      {/* Related Palettes / Related Posts section */}
      <div className="mt-16 pt-10 border-t border-white/5" id="related-palettes-section">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00FFD1] uppercase tracking-widest font-bold" style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1' }}>
              <span>RECOMMENDED SPECTRUIMS</span>
              <span>•</span>
              <span>DISCOVERY CONNECT</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight mt-1">Related Palettes</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Based on shared visual categories and mood tags. Explore matching color architecture frameworks.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 font-bold bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
            SHOWING {Math.min(displayedRelated.length, visibleRelatedLimit)} OF {relatedPalettes.length} RELATED
          </div>
        </div>

        {relatedPalettes.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-white/5 bg-white/2">
            <p className="text-sm text-slate-500 italic">No other related color configurations found matching current criteria.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Grid structure: 4 items per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedRelated.map((p, idx) => (
                <PaletteCard
                  key={p.id}
                  palette={p}
                  onSelect={onSelectPalette}
                  onLike={onLike}
                  onBookmark={onBookmark}
                  index={idx}
                />
              ))}
            </div>

            {/* Load more button */}
            {relatedPalettes.length > visibleRelatedLimit && (
              <div className="flex justify-center pt-4">
                <button
                  id="load-more-related-btn"
                  onClick={() => setVisibleRelatedLimit(prev => prev + 12)}
                  className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:border-[#00FFD1]/30 hover:text-[#00FFD1] text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                  style={{ color: siteConfig?.primaryNeonAccent || '#00FFD1', borderColor: `${siteConfig?.primaryNeonAccent || '#00FFD1'}33` }}
                >
                  <span>Load More Related</span>
                </button>
              </div>
            )}
          </div>
        )}
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
