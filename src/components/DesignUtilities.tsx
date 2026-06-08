import React from 'react';
import { ExternalLink, Palette, Code, Layout, Type, Image, Bookmark, Sparkles } from 'lucide-react';
import { SiteConfig } from '../types';

interface DesignUtilitiesProps {
  theme?: string;
  siteConfig?: Partial<SiteConfig>;
}

export default function DesignUtilities({ theme = 'dark', siteConfig }: DesignUtilitiesProps) {
  const accentColor = siteConfig?.primaryNeonAccent || '#00FFD1';

  const utilities = [
    {
      title: 'Free Icon Gallery',
      description: 'Curated library of high-quality vector stroke line icon packs for web developers and designers.',
      href: 'https://templatemind.com/tools/icons',
      icon: Image,
      badge: 'Vector SVG'
    },
    {
      title: 'Free Color Palette',
      description: 'Inspirational curated multi-tone layout formulas and color pairing tools to kickstart your next project.',
      href: 'https://templatemind.com/tools/color-palettes',
      icon: Palette,
      badge: 'Harmonies'
    },
    {
      title: 'Free UI Resources',
      description: 'Layered design templates, interface kits, mockups, and assets optimized for high-speed workflows.',
      href: 'https://templatemind.com/',
      icon: Layout,
      badge: 'Kits & Templates'
    },
    {
      title: 'CSS Font Stacks',
      description: 'Beautiful, high-performance web safe font combinations with elegant CSS fallbacks ready to copy.',
      href: 'https://templatemind.com/tools/css-fonts',
      icon: Type,
      badge: 'Web Safe Fonts'
    },
    {
      title: 'Favicon Studio',
      description: 'Fast online vector favicon generator, brand mask designer, and multi-format exporter.',
      href: 'https://faviconexpert.com/',
      icon: Bookmark,
      badge: 'Brand Assets'
    },
    {
      title: 'CSS Suit & Free Fonts',
      description: 'Full premium HTML/CSS templates, curated public fonts, and comprehensive frontend starter guides.',
      href: 'https://freecss.net/',
      icon: Code,
      badge: 'Premium CSS'
    }
  ];

  return (
    <section className="space-y-6 pt-6 border-t border-white/5" id="design-utilities-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-[#00FFD1]" style={{ color: accentColor }} />
            <span>Free Creative Design Utilities</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Complementary modern productivity tools curated to accelerate professional design and engineering pipelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="utilities-grid">
        {utilities.map((util, index) => {
          const Icon = util.icon;
          return (
            <a
              key={index}
              href={util.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 hover:border-slate-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15'
              }`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    theme === 'light' ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Icon className="h-4 w-4 text-[#00FFD1]" style={{ color: accentColor }} />
                  </div>
                  <span className={`text-[10px] font-mono tracking-wider font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    theme === 'light'
                      ? 'border-slate-200/80 bg-slate-100 text-slate-500'
                      : 'border-white/5 bg-white/5 text-slate-400'
                  }`}>
                    {util.badge}
                  </span>
                </div>

                {/* Content */}
                <h4 className={`text-sm font-extrabold tracking-tight group-hover:text-white transition-colors duration-200 ${
                  theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  {util.title}
                </h4>
                <p className={`text-xs leading-relaxed mt-1.5 line-clamp-2 ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {util.description}
                </p>
              </div>

              {/* Footer action */}
              <div className="flex items-center justify-end gap-1 mt-4 text-[11px] font-bold text-[#00FFD1] opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: accentColor }}>
                <span>Launch Tool</span>
                <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
