import React, { useState } from 'react';
import { Smartphone, ShoppingBag, Utensils, Star, ThumbsUp, Coffee, Leaf, ChevronRight, Compass, Heart, Share2, Award } from 'lucide-react';
import { getContrastColor } from '../utils';

interface MockupPreviewsProps {
  colors: string[]; // 5 Hex codes
  paletteTitle: string;
}

export default function MockupPreviews({ colors, paletteTitle }: MockupPreviewsProps) {
  const [activeMock, setActiveMock] = useState<'food' | 'packaging' | 'menu'>('food');

  // Map palette colors to semantic layout slots
  const c1 = colors[0] || '#0f172a'; // Base background / Dark core
  const c2 = colors[1] || '#1e293b'; // Sub-base / Secondary accent
  const c3 = colors[2] || '#3b82f6'; // Brand primary / Main text / Button bg
  const c4 = colors[3] || '#f59e0b'; // CTA highlight / Interactive accent
  const c5 = colors[4] || '#f8fafc'; // High light tone / Border / Crisp white contrast

  // Contrast determination helpers
  const txtC1 = getContrastColor(c1);
  const txtC2 = getContrastColor(c2);
  const txtC3 = getContrastColor(c3);
  const txtC4 = getContrastColor(c4);
  const txtC5 = getContrastColor(c5);

  // Dynamic customization preview for Artisan Bag
  const [bagAccentIndex, setBagAccentIndex] = useState<number>(3); // Default to c4

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom duration-300" id="mockup-previews-container">
      
      {/* Title & Description Header */}
      <div className="space-y-4" id="mockups-header-block">
        <div>
          <h4 className="text-sm font-mono uppercase tracking-widest text-[#00FFD1] flex items-center gap-1.5 font-bold">
            <Compass className="h-4 w-4 animate-spin-slow text-[#00FFD1]" />
            <span>Interactive Space Previews</span>
          </h4>
          <p className="text-slate-400 text-xs mt-1">
            See the active palette <span className="text-white font-mono font-semibold">"{paletteTitle}"</span> injected into real interface products:
          </p>
        </div>

        {/* Action selector buttons placed explicitly BELOW Interactive Space Previews heading */}
        <div className="grid grid-cols-3 gap-2 bg-black/25 p-1 rounded-xl border border-white/5 w-full">
          {[
            { id: 'food', label: 'Food Delivery App', icon: Smartphone },
            { id: 'packaging', label: 'Artisan Bag', icon: ShoppingBag },
            { id: 'menu', label: 'Restaurant', icon: Utensils },
          ].map((mock) => {
            const Icon = mock.icon;
            const isSelected = activeMock === mock.id;
            return (
              <button
                key={mock.id}
                id={`mock-tab-${mock.id}`}
                onClick={() => setActiveMock(mock.id as any)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#00FFD1]/10 text-white border border-[#00FFD1]/30 font-extrabold shadow-lg scale-[1.01]' 
                    : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 text-[#00FFD1]" />
                <span className="truncate">{mock.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Mock Shell */}
      <div className="flex items-center justify-center bg-[#020617]/30 p-4 border border-white/10 rounded-xl min-h-[440px] relative">
        
        {/* Mock 1: Food Delivery UI Screen */}
        {activeMock === 'food' && (
          <div 
            id="mockup-food-screen"
            className="w-full max-w-sm rounded-[32px] border-8 border-slate-900 p-5 shadow-2xl relative overflow-hidden transition-all duration-500"
            style={{ backgroundColor: c1, color: txtC1 }}
          >
            {/* Camera speaker shell */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-32 bg-slate-900 rounded-b-xl flex items-center justify-center">
              <span className="h-1.5 w-1.5 bg-slate-800 rounded-full" />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between text-[11px] font-bold mt-2 uppercase tracking-wide opacity-80 mb-5">
              <span>09:41 AM</span>
              <span className="flex items-center gap-1 text-xs text-emerald-500 font-extrabold animate-pulse">● Live Order</span>
            </div>

            {/* Ramen Graphic banner card */}
            <div 
              className="rounded-2xl p-4.5 relative overflow-hidden flex flex-col justify-end h-32 mb-4.5 group"
              style={{ backgroundColor: c2, color: txtC2 }}
            >
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400 font-black" />
                <span>4.9 (120+)</span>
              </div>
              <p className="text-[10px] font-mono tracking-widest uppercase opacity-75">KYOTO GOURMET</p>
              <h5 className="text-base font-black tracking-tight mt-0.5">Spicy Tonkotsu Ramen</h5>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h6 className="text-[9px] font-mono opacity-80 uppercase tracking-widest font-bold">Delivery Destination</h6>
                  <p className="text-xs font-black truncate mt-0.5">Studio Penthouse, Suite 404</p>
                </div>
                <div 
                  className="rounded-full p-2.5 shadow-md"
                  style={{ backgroundColor: c3, color: txtC3 }}
                >
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>

              {/* Status Tracker */}
              <div className="space-y-2 border-t border-white/5 pt-3.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold">Prep Stages</span>
                  <span className="font-mono text-[11px]" style={{ color: c4 }}>Estimated: 12 mins</span>
                </div>
                <div className="h-2 rounded-full bg-black/30 overflow-hidden flex border border-white/5">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: '75%', backgroundColor: c4 }} />
                </div>
              </div>

              {/* Action buttons */}
              <button
                className="w-full text-center py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all hover:scale-[1.01] active:scale-[0.98] shadow-md cursor-pointer"
                style={{ backgroundColor: c3, color: txtC3 }}
              >
                Track Live Courier
              </button>

              <button
                className="w-full text-center py-2.5 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all border border-dashed hover:bg-white/5 cursor-pointer"
                style={{ borderColor: c4, color: c4 }}
              >
                Inquire Diet Modifications
              </button>
            </div>
          </div>
        )}

        {/* Mock 2: Artisan Bag / Premium E-commerce Product detail page */}
        {activeMock === 'packaging' && (
          <div 
            id="mockup-packaging-screen"
            className="w-full max-w-sm rounded-[24px] border border-white/10 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-500"
            style={{ backgroundColor: c1, color: txtC1 }}
          >
            {/* Elegant Background organic circles using remaining palette colors */}
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-15 pointer-events-none blur-xl" style={{ backgroundColor: c4 }} />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full opacity-20 pointer-events-none blur-xl" style={{ backgroundColor: c3 }} />

            <div className="flex justify-between items-center mb-4">
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] px-2.5 py-1 rounded bg-white/5 font-extrabold border border-white/5" style={{ color: c3 }}>
                Premium Craft
              </span>
              <div className="flex gap-1.5 text-slate-400">
                <button className="p-1.5 rounded-full bg-white/5 hover:text-red-400 transition-colors cursor-pointer">
                  <Heart className="h-3.5 w-3.5" />
                </button>
                <button className="p-1.5 rounded-full bg-white/5 hover:text-white transition-colors cursor-pointer">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Premium Handheld Bag Drawing (High Fidelity SVG utilizing color slots) */}
            <div className="w-full p-4 flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 mb-4 relative group">
              <svg 
                viewBox="0 0 100 80" 
                className="h-32 w-auto transition-transform group-hover:scale-105 duration-300 drop-shadow-xl"
              >
                {/* Bag Handle */}
                <path 
                  d="M35 30 C35 12, 65 12, 65 30" 
                  stroke={colors[bagAccentIndex === 0 ? 1 : 0] || '#ccc'} 
                  strokeWidth="5" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                
                {/* Main Bag Body */}
                <path 
                  d="M20 30 L80 30 L75 75 L25 75 Z" 
                  fill={colors[bagAccentIndex] || '#fff'} 
                  stroke={c5} 
                  strokeWidth="1.5" 
                />
                
                {/* Accent Front flap pouch list */}
                <path 
                  d="M32 30 L68 30 L62 52 L38 52 Z" 
                  fill={c2} 
                  opacity="0.95" 
                />

                {/* Brass Buckle center lock detail */}
                <rect 
                  x="47" 
                  y="46" 
                  width="6" 
                  height="8" 
                  rx="1.5" 
                  fill={c5} 
                />
                <circle cx="50" cy="50" r="1.2" fill={c1} />

                {/* Left/Right stitches */}
                <line x1="26" y1="35" x2="26" y2="70" stroke={c5} strokeDasharray="1.5 1.5" strokeWidth="0.8" opacity="0.7" />
                <line x1="74" y1="35" x2="74" y2="70" stroke={c5} strokeDasharray="1.5 1.5" strokeWidth="0.8" opacity="0.7" />
              </svg>

              <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 px-2 py-0.5 rounded text-[8.5px] font-mono text-slate-400">
                Vector Preview
              </div>
            </div>

            {/* Bag description texts */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <h4 className="text-sm font-black tracking-tight" style={{ color: c5 }}>The Artisan Leather Bag</h4>
                <span className="text-xs font-mono font-bold" style={{ color: c3 }}>$185.00</span>
              </div>
              <p className="text-[10.5px] opacity-80 leading-relaxed mt-1">
                Vegetable-tanned dynamic leather with dual solid brass pins and raw heavy canvas backing. Built sustainably by hand.
              </p>
            </div>

            {/* Interactive Color Variant Picker Swatch inside Mockup! */}
            <div className="mt-3.5 border-t border-white/5 pt-3 flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">Select Leather Tone:</span>
              <div className="flex gap-1.5 bg-black/20 p-1 rounded-lg">
                {colors.map((hex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBagAccentIndex(idx)}
                    className={`h-4.5 w-4.5 rounded-full border transition-all cursor-pointer ${
                      bagAccentIndex === idx 
                        ? 'ring-1.5 ring-offset-2 ring-white scale-110 border-white' 
                        : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={`Paint bag accent Slot ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Buy Action buttons */}
            <div className="mt-4 flex gap-2">
              <button 
                type="button"
                className="flex-1 text-center py-2.5 rounded-lg text-[10.5px] font-black tracking-widest uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                style={{ backgroundColor: c3, color: txtC3 }}
              >
                Add Bag to Cart
              </button>
              <button 
                type="button"
                className="px-3 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                title="Save product variant"
              >
                <Award className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Mock 3: Restaurant Menu Card */}
        {activeMock === 'menu' && (
          <div 
            id="mockup-menu-screen"
            className="w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden transition-all duration-500 text-left"
            style={{ backgroundColor: c5, color: txtC5 }} // Use high dynamic contrast light/soft theme color as menu back
          >
            {/* Elegant double line framing */}
            <div className="absolute inset-5 border border-dashed opacity-25 pointer-events-none" style={{ borderColor: c2 }}></div>

            <div className="space-y-6 relative z-10 text-center">
              <div className="space-y-1">
                <span className="text-[9px] font-bold tracking-[0.3em] block" style={{ color: c3 }}>L'ATELIER CULINAIRE</span>
                <h4 className="text-2xl font-black tracking-tight" style={{ color: c2 }}>LA TABLE CHIC</h4>
                <div className="h-0.5 w-12 mx-auto mt-2" style={{ backgroundColor: c3 }}></div>
              </div>

              {/* Menu listings */}
              <div className="text-left space-y-5 mt-6 px-3">
                
                <div className="group/item">
                  <div className="flex items-baseline justify-between gap-1">
                    <h5 className="font-bold text-sm tracking-wide" style={{ color: c1 }}>Pan-seared Ruby Salmon</h5>
                    <div className="flex-1 border-b border-dotted mx-2 opacity-30" style={{ borderColor: c1 }} />
                    <span className="font-mono font-bold text-xs" style={{ color: c3 }}>$34.00</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                    Sustainably caught cold-water salmon, organic ginger miso broth, wild spring sprouts.
                  </p>
                </div>

                <div className="group/item">
                  <div className="flex items-baseline justify-between gap-1">
                    <h5 className="font-bold text-sm tracking-wide" style={{ color: c1 }}>Truffle Glazed Ribeye</h5>
                    <div className="flex-1 border-b border-dotted mx-2 opacity-30" style={{ borderColor: c1 }} />
                    <span className="font-mono font-bold text-xs" style={{ color: c3 }}>$48.50</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                    Aged black Angus, rich split reduction glaze, shaved white truffles, crisp sea salt.
                  </p>
                </div>

                <div className="group/item">
                  <div className="flex items-baseline justify-between gap-1">
                    <h5 className="font-bold text-sm tracking-wide" style={{ color: c1 }}>Hand-cut Lemon Tagliolini</h5>
                    <div className="flex-1 border-b border-dotted mx-2 opacity-30" style={{ borderColor: c1 }} />
                    <span className="font-mono font-bold text-xs" style={{ color: c3 }}>$26.00</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed">
                    Artisan fresh flour dough, Meyer lemon emulsion, toasted pine nuts, fresh basil oil.
                  </p>
                </div>

              </div>

              {/* Menu metadata */}
              <div className="pt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold opacity-85" style={{ color: c2 }}>
                <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                <span>Vegetarian & Vegan Customizations Guided on Demand</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
