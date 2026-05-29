import React, { useState } from 'react';
import { Heart, Bookmark, Eye, Copy, Check, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Palette } from '../types';
import { getContrastColor } from '../utils';

interface PaletteCardProps {
  key?: React.Key | string;
  palette: Palette;
  onSelect: (palette: Palette) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  index?: number;
}

export default function PaletteCard({ palette, onSelect, onLike, onBookmark, index = 0 }: PaletteCardProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleColorCopy = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop from opening palette detail
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const delay = (index % 12) * 0.04;

  return (
    <motion.div 
      id={`palette-card-${palette.id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
    >
      {/* Interconnected 5-column horizontal color strip */}
      <div 
        className="flex h-36 w-full overflow-hidden cursor-crosshair relative"
        id={`color-strip-${palette.id}`}
      >
        {palette.colors.map((hex, index) => {
          const contrast = getContrastColor(hex);
          const isCopied = copiedHex === hex;

          return (
            <div
              key={`${hex}-${index}`}
              id={`color-col-${palette.id}-${index}`}
              className="group/col relative flex h-full flex-1 hover:flex-[2.2] items-center justify-center transition-all duration-300 ease-out"
              style={{ backgroundColor: hex }}
              onClick={(e) => handleColorCopy(hex, e)}
            >
              {/* Copy Overlays on hovering individual color block */}
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/col:opacity-100 transition-opacity bg-black/10 text-xs font-mono font-medium tracking-wide pointer-events-none"
                style={{ color: contrast }}
              >
                {isCopied ? (
                  <div className="flex flex-col items-center scale-95 animate-bounce">
                    <Check className="h-4.5 w-4.5" />
                    <span className="text-[10px] font-bold">COPIED!</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-75">
                    <Copy className="h-4 w-4" />
                    <span className="text-[9px] mt-1">{hex.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Keep color labels showing faintly at base if not hovered */}
              <div 
                className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-30 group-hover/col:opacity-0 transition-opacity text-[10px] font-semibold font-mono"
                style={{ color: contrast }}
              >
                {index + 1}
              </div>
            </div>
          );
        })}

        {/* Floating Staff Pick Badge */}
        {palette.isStaffPick && (
          <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-pink-500/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-400">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Staff Pick</span>
          </div>
        )}
      </div>

      {/* Card Detail Content (Clicking opens Detail view) */}
      <div 
        className="flex flex-col p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => onSelect(palette)}
        id={`card-info-${palette.id}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 truncate text-sm hover:text-[#00FFD1] transition-colors">
            {palette.title}
          </h3>
          <div className="flex flex-wrap gap-1">
            {palette.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag}
                className="text-[9px] bg-white/10 text-slate-300 font-bold px-2 py-0.5 rounded-full border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Likes Count & Bookmark Icons Footer Row */}
        <div className="mt-3.5 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-slate-400">
          <button
            id={`like-btn-${palette.id}`}
            onClick={(e) => onLike(palette.id, e)}
            className="flex items-center space-x-1.5 hover:text-pink-500 transition-colors group/like"
          >
            <Heart className="h-4 w-4 group-hover/like:scale-125 transition-transform text-slate-500 group-hover/like:text-pink-500" />
            <span className="font-mono font-medium text-slate-300">{palette.likes}</span>
          </button>

          <div className="flex items-center space-x-3">
            {palette.views && (
              <div className="hidden sm:flex items-center space-x-1 font-mono text-[10px] text-slate-500">
                <Eye className="h-3.5 w-3.5" />
                <span>{palette.views}</span>
              </div>
            )}

            <button
              id={`bookmark-btn-${palette.id}`}
              onClick={(e) => onBookmark(palette.id, e)}
              className="text-slate-500 hover:text-[#00FFD1] transition-colors"
              title="Bookmark Palette"
            >
              <Bookmark 
                className={`h-4 w-4 ${palette.bookmarks ? 'fill-[#00FFD1] text-[#00FFD1]' : ''}`} 
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
