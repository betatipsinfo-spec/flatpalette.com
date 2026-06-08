import React, { useState } from 'react';
import { 
  Globe, Search, Check, Copy, Flame, Terminal, FileCode, CheckCircle, 
  RefreshCw, Play, ShieldAlert, Award, FileText, ArrowRight, Server, Compass, Network
} from 'lucide-react';
import { SiteConfig, Palette } from '../types';

interface SitemapViewerProps {
  theme?: string;
  siteConfig?: Partial<SiteConfig>;
  setActiveTab?: (tab: string) => void;
  palettes?: Palette[];
}

export default function SitemapViewer({ 
  theme = 'dark', 
  siteConfig, 
  setActiveTab,
  palettes = []
}: SitemapViewerProps) {
  const accentColor = siteConfig?.primaryNeonAccent || '#00FFD1';
  const [copiedText, setCopiedText] = useState<'xml' | 'json' | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'visual' | 'xml' | 'schema' | 'console'>('visual');
  const [testSlug, setTestSlug] = useState('');
  const [isSimulatingCrawl, setIsSimulatingCrawl] = useState(false);
  const [simulatedConsoleOutput, setSimulatedConsoleOutput] = useState<string[]>([]);
  const [indexingHistory, setIndexingHistory] = useState<Array<{ path: string; status: 'indexed' | 'pending'; timestamp: string }>>([
    { path: 'https://flatpalette.com/', status: 'indexed', timestamp: '2026-06-08' },
    { path: 'https://flatpalette.com/?tab=explore', status: 'indexed', timestamp: '2026-06-08' },
    { path: 'https://flatpalette.com/?tab=generator', status: 'indexed', timestamp: '2026-06-07' },
    { path: 'https://flatpalette.com/?tab=color-names', status: 'indexed', timestamp: '2026-06-06' },
  ]);

  // Static site node coordinates and indexing priorities
  const sitemapNodes = [
    { name: 'Home / Interactive Palette Builder', path: 'https://flatpalette.com/', priority: '1.0 (Critical)', frequency: 'daily', desc: 'Core reactive color generator and drag-and-drop spectrum palette locker.' },
    { name: 'Color Archives & Community Feed', path: 'https://flatpalette.com/?tab=explore', priority: '0.9 (Very High)', frequency: 'daily', desc: 'Vibrant, crowd-voted listings of public CC0 palette harmonies.' },
    { name: 'Speed Generator Lab', path: 'https://flatpalette.com/?tab=generator', priority: '0.9 (Very High)', frequency: 'daily', desc: 'Direct, zero-latency multi-tone palette layouts for prototyping.' },
    { name: 'System Color Names Finder', path: 'https://flatpalette.com/?tab=color-names', priority: '0.8 (High)', frequency: 'weekly', desc: 'Advanced search engine and name suggestions matching hex code offsets.' },
    { name: 'Fluid Color Wheel', path: 'https://flatpalette.com/?tab=color-wheel', priority: '0.8 (High)', frequency: 'weekly', desc: 'Interactive visual conic-gradient color theory wheel for designers.' },
    { name: 'Guidelines & Submission Hub', path: 'https://flatpalette.com/?tab=guidelines', priority: '0.7 (Medium)', frequency: 'weekly', desc: 'Upload curated palette specs and view system WCAG contrast benchmarks.' },
    { name: 'About flatpalette Team', path: 'https://flatpalette.com/?tab=about', priority: '0.6 (Medium)', frequency: 'monthly', desc: 'The overarching performance mission behind the speed-tier palette architecture.' },
    { name: 'Privacy & Localization Safe', path: 'https://flatpalette.com/?tab=privacy', priority: '0.5 (Low)', frequency: 'monthly', desc: 'Information on offline-first LocalStorage telemetry policies.' },
    { name: 'Terms of Service agreements', path: 'https://flatpalette.com/?tab=terms', priority: '0.5 (Low)', frequency: 'monthly', desc: 'Creative Commons CC0 1.0 Universal public release protocols.' },
  ];

  // Helper to generate dynamic live sitemap.xml preview string
  const generateXmlPreview = () => {
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // Static nodes
    sitemapNodes.forEach(node => {
      xml += `  <url>\n`;
      xml += `    <loc>${node.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${node.frequency}</changefreq>\n`;
      xml += `    <priority>${node.priority.split(' ')[0]}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic nodes from approved palettes
    const approvedPalettes = palettes.filter(p => p.approved).slice(0, 5);
    approvedPalettes.forEach(p => {
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const rawDate = (p as any).updated_at || p.createdAt || today;
      const cleanDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
      xml += `  <url>\n`;
      xml += `    <loc>https://flatpalette.com/?palette=${p.id}&amp;slug=${slug}</loc>\n`;
      xml += `    <lastmod>${cleanDate}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    });

    if (palettes.filter(p => p.approved).length > 5) {
      xml += `  <!-- ... and ${palettes.filter(p => p.approved).length - 5} more dynamic user-submitted community palette nodes ... -->\n`;
    }

    xml += `</urlset>`;
    return xml;
  };

  // Helper to generate dynamic live JSON-LD schema preview string
  const generateJsonLdPreview = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "flatpalette",
      "url": "https://flatpalette.com",
      "genre": "Developer and Designer Productivity Tool",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "All modern browsers",
      "about": {
        "@type": "CreativeWork",
        "name": "Creative Commons CC0 Color Palette Architectural Datasets"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://flatpalette.com/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };
    return JSON.stringify(schema, null, 2);
  };

  const copyToClipboard = (type: 'xml' | 'json', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Live simulation of search console crawler indexing updates
  const handleSimulateIndexUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSlug.trim()) return;

    setIsSimulatingCrawl(true);
    setSimulatedConsoleOutput([]);
    
    const formattedSlug = testSlug.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newPath = `https://flatpalette.com/?palette=simulated-ref&slug=${formattedSlug}`;

    const logs = [
      `[0.0s] [CMD] Initiating sitemap crawl cycle target: ${newPath}`,
      `[0.6s] [GET] Requesting target metadata and JSON-LD schema structure...`,
      `[1.2s] [SYS] Checking robots.txt coordinates and canonical tags...`,
      `[1.8s] [XML] Injecting dynamic node into memory index trees...`,
      `[2.4s] [SUCCESS] Target crawled successfully. Response 200 OK. Priority 0.7 approved.`,
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setSimulatedConsoleOutput(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setIsSimulatingCrawl(false);
          setIndexingHistory(prev => [
            { path: newPath, status: 'indexed', timestamp: new Date().toISOString().split('T')[0] },
            ...prev
          ]);
          setTestSlug('');
        }
      }, (index + 1) * 650);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in" id="sitemap-interactive-container">
      
      {/* 4. Controls/Selector Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-[#00FFD1]" style={{ color: accentColor }}>SEO CONTROL ENGINE</span>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5" />
            <span>Interactive Platform Node Indexer</span>
          </h2>
        </div>

        {/* Dynamic Buttons for toggling sub-views */}
        <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5" id="sitemap-view-selectors">
          <button
            onClick={() => setActiveSubTab('visual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'visual' ? 'bg-[#00FFD1]/10 text-[#00FFD1]' : 'text-slate-400 hover:text-white'
            }`}
            style={activeSubTab === 'visual' ? { color: accentColor, backgroundColor: `${accentColor}1a` } : {}}
          >
            Visual Directory tree
          </button>
          <button
            onClick={() => setActiveSubTab('xml')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'xml' ? 'bg-[#00FFD1]/10 text-[#00FFD1]' : 'text-slate-400 hover:text-white'
            }`}
            style={activeSubTab === 'xml' ? { color: accentColor, backgroundColor: `${accentColor}1a` } : {}}
          >
            Live sitemap.xml
          </button>
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'schema' ? 'bg-[#00FFD1]/10 text-[#00FFD1]' : 'text-slate-400 hover:text-white'
            }`}
            style={activeSubTab === 'schema' ? { color: accentColor, backgroundColor: `${accentColor}1a` } : {}}
          >
            Structured JSON-LD Schema
          </button>
          <button
            onClick={() => setActiveSubTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeSubTab === 'console' ? 'bg-[#00FFD1]/10 text-[#00FFD1]' : 'text-slate-400 hover:text-white'
            }`}
            style={activeSubTab === 'console' ? { color: accentColor, backgroundColor: `${accentColor}1a` } : {}}
          >
            Google Index Simulator
          </button>
        </div>
      </div>

      {/* Main interactive sub-tab components */}
      <div id="sitemap-subtab-viewer">

        {/* VIEW A: VISUAL DIRECTORY TREE */}
        {activeSubTab === 'visual' && (
          <div className="space-y-6" id="sitemap-visual-subtab">
            <div className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-slate-950/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Below is the comprehensive architectural node map of <strong>flatpalette</strong>. To improve SEO updates, our system outputs raw XML configurations so crawler engine algorithms can parse public domain palette indexes instantaneously. Click any system route name below to fast-travel instantly.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sitemapNodes.map((node, index) => (
                <div 
                  key={index} 
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2.5 mb-1.5">
                    <button 
                      onClick={() => {
                        const tabQuery = node.path.split('?tab=')[1];
                        if (tabQuery && setActiveTab) {
                          setActiveTab(tabQuery);
                        } else if (setActiveTab) {
                          setActiveTab('home');
                        }
                      }}
                      className="text-white hover:text-[#00FFD1] text-xs sm:text-sm font-extrabold tracking-tight transition-colors duration-150 cursor-pointer text-left focus:outline-none"
                      style={{ color: '#ffffff' }}
                    >
                      {node.name}
                    </button>
                    <span className="font-mono text-[9px] bg-white/5 border border-white/10 text-[#00FFD1] px-2 py-0.5 rounded-md shrink-0" style={{ color: accentColor, borderColor: `${accentColor}2a` }}>
                      Pri: {node.priority.split(' ')[0]}
                    </span>
                  </div>
                  
                  <span className="font-mono text-[10px] text-slate-450 truncate block opacity-60 overflow-hidden mb-2">
                    {node.path}
                    </span>
                  
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">
                    {node.desc}
                  </p>
                  
                  <div className="border-t border-white/5 mt-3 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                    <span>INDEX UPDATE: <span className="text-[#00FFD1]" style={{ color: accentColor }}>ACTIVE</span></span>
                    <span className="uppercase">FREQUENCY: {node.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW B: LIVE SITEMAP.XML PREVIEW */}
        {activeSubTab === 'xml' && (
          <div className="space-y-4" id="sitemap-xml-subtab">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-emerald-400" />
                <span>DYNAMIC PUBLIC/SITEMAP.XML</span>
              </span>
              <button 
                onClick={() => copyToClipboard('xml', generateXmlPreview())}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 font-sans font-bold cursor-pointer"
              >
                {copiedText === 'xml' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">XML Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy XML Source</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#020617] text-[11px] sm:text-xs font-mono text-slate-350 overflow-x-auto leading-relaxed max-h-[450px]">
              <code>{generateXmlPreview()}</code>
            </pre>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              Note: The live system automatically parses real-time entries from our database and compiles them into valid sitemaps so searching engines index updates without waiting for static builds.
            </p>
          </div>
        )}

        {/* VIEW C: STRUCTURED SCHEMA VIEW */}
        {activeSubTab === 'schema' && (
          <div className="space-y-4" id="sitemap-schema-subtab">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-pink-500" />
                <span>JSON-LD APPLICATION SCHEMA MARKUP</span>
              </span>
              <button 
                onClick={() => copyToClipboard('json', generateJsonLdPreview())}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 font-sans font-bold cursor-pointer"
              >
                {copiedText === 'json' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Schema Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Schema Block</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-[#020617] text-[11px] sm:text-xs font-mono text-slate-350 overflow-x-auto leading-relaxed max-h-[450px]">
              <code>{generateJsonLdPreview()}</code>
            </pre>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
              This structured JSON-LD block is embedded seamlessly inside the platform header index to offer Google rich search parameters directly from Google SERPs (Search Engine Results Pages).
            </p>
          </div>
        )}

        {/* VIEW D: GOOGLE INDEX SIMULATOR MACHINE */}
        {activeSubTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sitemap-console-subtab">
            
            {/* Left Box: Console Trigger */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <div className="p-5 rounded-2xl border border-white/5 bg-slate-950/20 space-y-4">
                <span className="text-[10px] bg-purple-950/40 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold tracking-wide">INDEX LAB</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter a simulated keyword slug parameter below to test how our dynamic XML sitemap handles immediate indexing updates.
                </p>

                <form onSubmit={handleSimulateIndexUpdate} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-1">PROSPECT REFRESH SLUG:</label>
                    <input
                      type="text"
                      required
                      value={testSlug}
                      onChange={(e) => setTestSlug(e.target.value)}
                      placeholder="e.g. cyber-neon-sunset"
                      className="w-full bg-slate-950 rounded-xl border border-white/10 px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulatingCrawl}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 md:gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSimulatingCrawl ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Crawling target...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Initiate Crawler Test</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Server metrics */}
              <div className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/5 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">CRAWLER STATUS</span>
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Active OK</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono block">REACTION COOLDOWN</span>
                  <span className="text-xs font-extrabold text-white mt-0.5 block">0.45s Speed</span>
                </div>
              </div>
            </div>

            {/* Right Box: Simulation logs */}
            <div className="lg:col-span-7 flex flex-col justify-between border border-white/10 bg-slate-950 rounded-2xl overflow-hidden min-h-[300px]">
              <div className="flex items-center justify-between bg-slate-900 border-b border-white/5 px-4.5 py-3">
                <span className="text-[11px] font-mono text-purple-400 flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 animate-pulse" />
                  <span>CRAWLER CONSOLE RECORDS</span>
                </span>
                <span className="text-[9px] font-mono text-slate-500 uppercase">Live streams</span>
              </div>

              {/* Logs board */}
              <div className="p-4.5 font-mono text-xs text-slate-400 space-y-1.5 flex-1 max-h-[320px] overflow-y-auto">
                {simulatedConsoleOutput.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-center py-10 antialiased italic">
                    console offline. Click "Initiate Crawler Test" to fetch live streams.
                  </div>
                ) : (
                  simulatedConsoleOutput.map((log, idx) => {
                    const isSuccess = log.includes('SUCCESS');
                    const isCmd = log.includes('[CMD]');
                    return (
                      <div 
                        key={idx} 
                        className={`text-[11px] leading-relaxed ${
                          isSuccess ? 'text-emerald-400' : isCmd ? 'text-purple-300' : 'text-slate-300'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Crawler Index Table list */}
              <div className="border-t border-white/5 bg-slate-950/80 p-4 space-y-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">LATEST INDEXED LOG:</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {indexingHistory.map((hist, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2 border border-white/5 text-[10px] font-mono">
                      <span className="text-slate-300 truncate max-w-[280px] sm:max-w-[350px]">{hist.path}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-500">{hist.timestamp}</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wide bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          Indexed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
