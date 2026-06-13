import React from 'react';
import { 
  ExternalLink, Palette, Code, Layout, Type, Image, Bookmark, Sparkles,
  Crop, Minimize2, FileText, UserCircle, Grid, Sliders, Camera
} from 'lucide-react';
import { SiteConfig } from '../types';

interface DesignUtilitiesProps {
  theme?: string;
  siteConfig?: Partial<SiteConfig>;
}

export default function DesignUtilities({ theme = 'dark', siteConfig }: DesignUtilitiesProps) {
  const accentColor = siteConfig?.primaryNeonAccent || '#00FFD1';

  const utilities = [
    {
      title: 'Free Advance Font Generator',
      description: 'Supercharge your branding with advanced typography generators, custom weight adjustments, and direct format exports.',
      href: 'https://genfonts.com/',
      icon: Type,
      badge: 'Typography'
    },
    {
      title: 'Favicon Studio',
      description: 'Design, generate, and bundle premium multi-resolution favicons, safari web clips, and manifest.json code suites.',
      href: 'https://faviconexpert.com/',
      icon: Bookmark,
      badge: 'Brand Assets'
    },
    {
      title: 'CSS Suite & Free Fonts',
      description: 'Explore full free premium stylesheets, curated public-domain fonts, and responsive grid layouts.',
      href: 'https://freecss.net/',
      icon: Code,
      badge: 'Premium CSS'
    },
    {
      title: 'Free Resource UI',
      description: 'Unlock professional Figma/vector UI packs, responsive website mockups, and components for developers.',
      href: 'https://templatemind.com/',
      icon: Layout,
      badge: 'UI Ecosystem'
    },
    {
      title: 'Image Watermarker',
      description: 'Protect your intellectual property by applying brand watermarks, text annotations, and logos in bulk.',
      href: 'https://templatemind.com/tools/watermark',
      icon: Sparkles,
      badge: 'Asset Protection'
    },
    {
      title: 'Image Converter',
      description: 'Convert imagery instantly between web-optimized extensions like WEBP, PNG, JPG, and AVIF.',
      href: 'https://templatemind.com/tools/image-converter',
      icon: Image,
      badge: 'File Optimizer'
    },
    {
      title: 'Image Cropper',
      description: 'Surgically crop and align visual assets with aspect-ratio presets tailored for modern social media posts.',
      href: 'https://templatemind.com/tools/image-cropper',
      icon: Crop,
      badge: 'Layout Alignment'
    },
    {
      title: 'Image Compressor',
      description: 'Drastically reduce image file sizes without sacrificing quality for speed-tier search engine optimization.',
      href: 'https://templatemind.com/tools/image-compressor',
      icon: Minimize2,
      badge: 'Web Speed'
    },
    {
      title: 'Word Count',
      description: 'Analyze copy structures, keyword density, reading metrics, card limits, and precise character volume.',
      href: 'https://templatemind.com/tools/word-counter',
      icon: FileText,
      badge: 'Copy Analysis'
    },
    {
      title: 'Profile Picture Maker',
      description: 'Forge beautiful, high-contrast circular profile avatars, border gradients, and custom photo backgrounds.',
      href: 'https://templatemind.com/tools/profile-maker',
      icon: UserCircle,
      badge: 'Avatar Brand'
    },
    {
      title: 'Fancy Font Generator',
      description: 'Transform monotonous character bodies into stylized textual assets and decorative headers for social bios.',
      href: 'https://templatemind.com/tools/font-generator',
      icon: Type,
      badge: 'Interactive Text'
    },
    {
      title: 'Free Icon Gallery',
      description: 'Access thousands of scalable, pixel-perfect minimal vector stroke icon sets ready for instant copy.',
      href: 'https://templatemind.com/tools/icons',
      icon: Grid,
      badge: 'Vector Assets'
    },
    {
      title: 'Free Color Palettes',
      description: 'Aesthetic harmonic palette range systems, trend layout guidelines, and curated color configurations.',
      href: 'https://templatemind.com/tools/color-palettes',
      icon: Palette,
      badge: 'Palette Curator'
    },
    {
      title: 'CSS Font Stacks',
      description: 'Browse optimized native font integration code systems and fallback typography arrangements.',
      href: 'https://templatemind.com/tools/css-fonts',
      icon: Code,
      badge: 'Web Safe Fonts'
    },
    {
      title: 'Gradient Generator',
      description: 'Generate rich CSS linear & radial conic-gradients with fluid color-vector transition steps.',
      href: 'https://templatemind.com/tools/gradients',
      icon: Sliders,
      badge: 'Glow Engine'
    },
    {
      title: 'Screen Capture',
      description: 'Capture high-resolution screenshots, mockups, browser window shells, and responsive testing views.',
      href: 'https://templatemind.com/tools/screenshot',
      icon: Camera,
      badge: 'Viewport Asset'
    }
  ];

  return (
    <section className="space-y-6" id="design-utilities-section">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="utilities-grid">
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
