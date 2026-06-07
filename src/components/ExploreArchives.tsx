import React, { useMemo, useState, useEffect } from 'react';
import { 
  Sliders, Flame, Eye, Calendar, Tag, ShieldAlert, RotateCcw, ChevronDown,
  Grid, Image, Smile, Type, ExternalLink, Sparkles, ArrowRight, Layers, Globe
} from 'lucide-react';
import { Palette } from '../types';
import PaletteCard from './PaletteCard';
import { COLOR_NOMECLATURE_MAP } from '../data';

interface ExploreArchivesProps {
  palettes: Palette[];
  onSelect: (p: Palette) => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedHue: string;
  setSelectedHue: (hue: string) => void;
  selectedSort: 'likes' | 'views' | 'latest';
  setSelectedSort: (sort: 'likes' | 'views' | 'latest') => void;
  theme?: string;
  siteConfig?: any;
}

export default function ExploreArchives({
  palettes,
  onSelect,
  onLike,
  onBookmark,
  searchQuery,
  setSearchQuery,
  selectedHue,
  setSelectedHue,
  selectedSort,
  setSelectedSort,
  theme = 'dark',
  siteConfig = {},
}: ExploreArchivesProps) {
  
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Reset pagination count when queries or filter criteria list changes
  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedHue, selectedSort]);
  
  // Custom hue list with styling preview
  const hueOptions = [
    { name: 'all', label: 'All Hues', color: 'bg-slate-400' },
    { name: 'blue', label: 'Blue / Cyan', color: 'bg-cyan-500' },
    { name: 'red', label: 'Red / Ruby', color: 'bg-red-500' },
    { name: 'orange', label: 'Orange / Amber', color: 'bg-orange-500' },
    { name: 'yellow', label: 'Yellow / Gold', color: 'bg-yellow-400' },
    { name: 'green', label: 'Green / Jade', color: 'bg-emerald-500' },
    { name: 'pink', label: 'Pink / Violet', color: 'bg-pink-500' },
    { name: 'purple', label: 'Purple / Magenta', color: 'bg-purple-600' },
    { name: 'dark', label: 'Dark / Deep', color: 'bg-slate-900 border border-white/20' },
    { name: 'light', label: 'Light / Soft', color: 'bg-white' },
    { name: 'brown', label: 'Brown / Warm', color: 'bg-amber-950' },
  ];

  const [categoryTags, setCategoryTags] = useState<string[]>(() => {
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
    const saved = localStorage.getItem('flatpalette_popular_tags_v1');
    if (saved) {
      try {
        setCategoryTags(JSON.parse(saved));
      } catch (err) {
        // Fallback
      }
    }
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    palettes.forEach(p => p.tags.forEach(t => set.add(t)));
    return Array.from(set);
  }, [palettes]);

  // Comprehensive sorting and filtering matrix
  const filteredPalettes = useMemo(() => {
    let result = [...palettes];

    // Filter by text search query (title, color tags or exact colors)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        const matchesColors = p.colors.some(c => c.toLowerCase().includes(q));
        
        // Also match colors by natural name mapping
        let matchesNomeclature = false;
        Object.keys(COLOR_NOMECLATURE_MAP).forEach(key => {
          if (q.includes(key) || key.includes(q)) {
            const hexes = COLOR_NOMECLATURE_MAP[key];
            const hasCommonColor = p.colors.some(c => 
              hexes.some(hc => c.toLowerCase() === hc.toLowerCase())
            );
            if (hasCommonColor) matchesNomeclature = true;
          }
        });

        return matchesTitle || matchesTags || matchesColors || matchesNomeclature;
      });
    }

    // Filter by dominant baseline hue
    if (selectedHue !== 'all') {
      const hexesForHue = COLOR_NOMECLATURE_MAP[selectedHue] || [];
      result = result.filter((p) => {
        // If the palette colors match any of the target hue group colors
        return p.colors.some((colorHex) => {
          // Check if color matches mapped hexes directly
          const isDirectMatch = hexesForHue.some(h => h.toLowerCase() === colorHex.toLowerCase());
          
          // Or tag checks if the hue name corresponds to a tag
          const hasTag = p.tags.some(t => t.toLowerCase() === selectedHue.toLowerCase());
          
          return isDirectMatch || hasTag;
        });
      });
    }

    // Sort execution details
    if (selectedSort === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    } else if (selectedSort === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (selectedSort === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [palettes, searchQuery, selectedHue, selectedSort]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedHue('all');
    setSelectedSort('likes');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="explore-archives-page">
      
      {/* Title Segment */}
      <div className="border-b border-white/5 pb-5 mb-8">
        <h2 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sliders className="h-7 w-7 text-[#00FFD1]" />
          <span>Color Discovery Archives</span>
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
          Filter and sort through the world's most vibrant digital design color arrangements. Click a palette card block to view and export configs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Side-rail Filter Toggles */}
        <div className="lg:col-span-1 space-y-6" id="filters-side-rail">
          
          {/* Active stats */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#00FFD1] mb-1 font-bold">Index State</div>
            <div className="text-sm font-bold text-white mb-2">{filteredPalettes.length} Palettes Found</div>
            {selectedHue !== 'all' || selectedSort !== 'likes' || searchQuery !== '' ? (
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[#00FFD1] hover:text-white text-xs font-bold transition-colors border border-white/10"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Active Filters</span>
              </button>
            ) : null}
          </div>

          {/* Sort Controller Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-bold">
              <Flame className="h-3.5 w-3.5 text-pink-500" />
              <span>Sort Grid Matrix</span>
            </h4>
            <div className="flex flex-col gap-1">
              {[
                { name: 'likes', label: 'Trending & Likes', icon: Flame },
                { name: 'views', label: 'Most Viewed Feed', icon: Eye },
                { name: 'latest', label: 'Freshly Submitted', icon: Calendar },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = selectedSort === option.name;
                return (
                  <button
                    key={option.name}
                    id={`sort-btn-${option.name}`}
                    onClick={() => setSelectedSort(option.name as any)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${
                      isSelected 
                        ? 'bg-white/15 border border-white/25 text-white shadow-lg' 
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#00FFD1]' : 'text-slate-400'}`} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Tag Explorer */}
          <div className="space-y-3 lg:block hidden">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-bold">
              <Tag className="h-3.5 w-3.5 text-[#00FFD1]" />
              <span>Category Tags</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {categoryTags.map((tag) => {
                const isSelected = searchQuery.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(isSelected ? '' : tag)}
                    className={`text-[13px] px-3 py-1 rounded-full transition-all font-bold ${
                      isSelected 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black hover:scale-105' 
                        : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white border border-white/5'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dominant Hue Filter Group */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">
              Dominant Base Hue
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
              {hueOptions.map((hue) => {
                const isSelected = selectedHue === hue.name;
                return (
                  <button
                    key={hue.name}
                    id={`hue-btn-${hue.name}`}
                    onClick={() => setSelectedHue(hue.name)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-bold text-left transition-all ${
                      isSelected 
                        ? 'bg-white/15 text-[#00FFD1] border border-white/15 shadow-md' 
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${hue.color}`} />
                    <span>{hue.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Palette Grid Matrix Showcase */}
        <div className="lg:col-span-3">
          {filteredPalettes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950 p-12 text-center" id="empty-search-state">
              <ShieldAlert className="h-12 w-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-250 mt-4">No matching architectural palettes</h3>
              <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto">
                No indexed color systems matched your filters. Try clearing search keywords or selecting different color parameters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
              >
                Reset Database Coordinates
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6" 
                id="archives-grid-matrix"
              >
                {filteredPalettes.slice(0, visibleCount).map((p, idx) => (
                  <PaletteCard
                    key={p.id}
                    palette={p}
                    index={idx}
                    onSelect={onSelect}
                    onLike={onLike}
                    onBookmark={onBookmark}
                  />
                ))}
              </div>

              {/* Dynamic load expansion trigger if there are more archives in the database */}
              {filteredPalettes.length > visibleCount && (
                <div className="text-center pt-4" id="archives-load-more-section">
                  <button
                    id="archives-load-more-btn"
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 hover:border-[#00FFD1]/50 text-slate-200 hover:text-white bg-white/5 hover:bg-[#00FFD1]/10 text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 group cursor-pointer"
                  >
                    <ChevronDown className="h-4 w-4 text-[#00FFD1] group-hover:translate-y-0.5 transition-transform" />
                    <span>Load More Archives</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Curated Creative Utilities above footer for Color Archives */}
      <div className="mt-20 pt-16 border-t border-white/5" id="archives-creative-toolkit-section">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#00FFD1] to-purple-600 p-0.5 shadow-md">
            <div className={`px-3 py-1 rounded-[10px] ${theme === 'light' ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'} text-[10px] font-bold tracking-wider uppercase flex items-center gap-1`}>
              <Sparkles className="h-3.5 w-3.5 text-pink-500 animate-pulse" />
              <span>Recommended Workspace Tools</span>
            </div>
          </div>
          <h3 className={`text-xl sm:text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
            Free Creative Design Utilities
          </h3>
          <p className={`text-xs sm:text-sm max-w-xl mx-auto leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Streamline your workflow with these highly functional visual converters, custom galleries, and icon customization engines designed for creators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="toolkit-bento-grid">
          {[
            {
              id: 'tool-icon-gallery',
              title: 'Free Icon Gallery',
              actionTitle: 'Customize SVG Icons',
              description: 'Tailor, style, and preview premium minimal vectors with a custom sizing and customization dashboard.',
              url: 'https://templatemind.com/tools/icons',
              icon: <Grid className="h-5 w-5 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />,
              bgGradient: 'from-blue-500/10 to-indigo-500/5',
              borderAccent: 'group-hover:border-blue-500/35'
            },
            {
              id: 'tool-color-palettes',
              title: 'Free Color Palettes',
              actionTitle: 'Browse Trend Systems',
              description: 'Find inspiration in hundreds of trending harmonic range systems and architectural hue contrast charts.',
              url: 'https://templatemind.com/tools/color-palettes',
              icon: <Sliders className="h-5 w-5 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />,
              bgGradient: 'from-pink-500/10 to-rose-500/5',
              borderAccent: 'group-hover:border-pink-500/35'
            },
            {
              id: 'tool-ui-resources',
              title: 'Free UI Resources',
              actionTitle: 'Access Templates',
              description: 'Unlock responsive ready-to-deploy layouts, vector UI files, and elegant web resources.',
              url: 'https://templatemind.com/',
              icon: <Layers className="h-5 w-5 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />,
              bgGradient: 'from-purple-500/10 to-fuchsia-500/5',
              borderAccent: 'group-hover:border-purple-500/35'
            },
            {
              id: 'tool-css-fonts',
              title: 'CSS Font Stacks',
              actionTitle: 'Analyze Font Family',
              description: 'Browse beautiful, web-safe system fonts and modular typography fallback sets for modern layout stacks.',
              url: 'https://templatemind.com/tools/css-fonts',
              icon: <Type className="h-5 w-5 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />,
              bgGradient: 'from-emerald-500/10 to-teal-500/5',
              borderAccent: 'group-hover:border-emerald-500/35'
            },
            {
              id: 'tool-favicon-studio',
              title: 'Favicon Studio',
              actionTitle: 'Generate Multi-Size Icons',
              description: 'Customize complete high-resolution platform favicon manifests, site shortcuts, and packaging suites.',
              url: 'https://faviconexpert.com/',
              icon: <Globe className="h-5 w-5 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />,
              bgGradient: 'from-amber-500/10 to-orange-500/5',
              borderAccent: 'group-hover:border-amber-500/35'
            },
            {
              id: 'tool-css-suite',
              title: 'CSS Suite & Free Fonts',
              actionTitle: 'Access CSS Templates',
              description: 'Explore elegant, curated stylesheets, layout presets, and responsive web resources for rapid production.',
              url: 'https://freecss.net/',
              icon: <Sparkles className="h-5 w-5 text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />,
              bgGradient: 'from-cyan-500/10 to-blue-500/5',
              borderAccent: 'group-hover:border-cyan-500/35'
            }
          ].map((item) => (
            <a
              key={item.id}
              id={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-200 hover:shadow-lg hover:shadow-slate-100 hover:border-slate-400'
                  : 'bg-[#020617]/40 border-white/5 hover:bg-white/5'
              } ${item.borderAccent}`}
            >
              {/* Background ambient gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-white/5 border border-white/10'} group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className={`text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${
                    theme === 'light'
                      ? 'border-slate-200 text-slate-500 bg-slate-50'
                      : 'border-white/10 text-slate-400 bg-slate-950/50'
                  }`}>
                    Free Tool
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className={`text-sm font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    {item.title}
                  </h4>
                  <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="relative pt-6 flex items-center justify-between border-t border-dashed mt-4 border-slate-200/10 dark:border-white/5">
                <span className="text-[11px] font-bold tracking-wider text-[#00FFD1] uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>
                  <span>{item.actionTitle}</span>
                  <ArrowRight className="h-3 w-3 animate-pulse" />
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 group-hover:rotate-12 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
