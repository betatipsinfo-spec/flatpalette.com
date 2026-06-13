import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Bookmark, Sparkles, Sliders, Search, Send, Mail, Globe, 
  HelpCircle, ShieldCheck, X, Plus, Layers, ArrowRight, Laptop, Trash2, CheckCircle2,
  ChevronDown, Facebook, Instagram, Linkedin, Grid, Image, Smile, Type, ExternalLink
} from 'lucide-react';

import { Palette, SiteConfig, Lead, ToastMessage } from './types';
import { INITIAL_PALETTES, INITIAL_LEADS, INITIAL_SITE_CONFIG } from './data';
import Header from './components/Header';
import Hero from './components/Hero';
import PaletteCard from './components/PaletteCard';
import ExploreArchives from './components/ExploreArchives';
import PaletteDetail from './components/PaletteDetail';
import GeneratorHub from './components/GeneratorHub';
import AdminDashboard from './components/AdminDashboard';
import LegalContact from './components/LegalContact';
import AboutAndPolicies from './components/AboutAndPolicies';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ColorNames from './components/ColorNames';
import ColorWheel from './components/ColorWheel';
import WebSafeColors from './components/WebSafeColors';
import TailwindColors from './components/TailwindColors';
import MaterialColors from './components/MaterialColors';
import FlatColors from './components/FlatColors';
import ColorPicker from './components/ColorPicker';
import DesignUtilities from './components/DesignUtilities';
import { supabase } from './supabaseClient';

export default function App() {
  // Sync state models from localStorage with custom fallback initialization
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    const local = localStorage.getItem('flatpalette_palettes_v1');
    return local ? JSON.parse(local) : INITIAL_PALETTES;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const local = localStorage.getItem('flatpalette_leads_v1');
    return local ? JSON.parse(local) : INITIAL_LEADS;
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const local = localStorage.getItem('flatpalette_config_v1');
    return local ? JSON.parse(local) : INITIAL_SITE_CONFIG;
  });

  // Navigation and UI layout filters
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [submitModalOpen, setSubmitModalOpen] = useState<boolean>(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [generatorSeedColors, setGeneratorSeedColors] = useState<string[] | undefined>(undefined);

  // Theme support (light/dark state)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const local = localStorage.getItem('flatpalette_theme_v1');
    return local === 'light' ? 'light' : 'dark';
  });

  // Dynamic system toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    localStorage.setItem('flatpalette_theme_v1', theme);
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }, [theme]);

  // Monitor Supabase authentication session state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Home Page Sub-Filters: 'all' | 'staff' | 'bookmarked'
  const [homeFeedFilter, setHomeFeedFilter] = useState<'all' | 'staff' | 'bookmarked'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Synchronize dynamic feed pagination limit when filter or query alterations occur
  useEffect(() => {
    setVisibleCount(24);
  }, [homeFeedFilter, searchQuery]);

  // Archive Specific Filters
  const [exploreSelectedHue, setExploreSelectedHue] = useState<string>('all');
  const [exploreSelectedSort, setExploreSelectedSort] = useState<'likes' | 'views' | 'latest'>('likes');

  // Lead Newsletter Footer Captures
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSuccess, setFooterSuccess] = useState(false);

  // Load initial dataset from Supabase if tables exist, while maintaining offline local storage fallback
  useEffect(() => {
    async function initSupabaseData() {
      try {
        // 1. Fetch site settings configurations
        const { data: dbConfig } = await supabase
          .from('site_config')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (dbConfig) {
          setSiteConfig({
            primaryNeonAccent: dbConfig.primary_neon_accent || INITIAL_SITE_CONFIG.primaryNeonAccent,
            homepageCarouselEnabled: dbConfig.homepage_carousel_enabled ?? INITIAL_SITE_CONFIG.homepageCarouselEnabled,
            siteTitle: dbConfig.site_title || INITIAL_SITE_CONFIG.siteTitle,
            siteDescription: dbConfig.site_description || INITIAL_SITE_CONFIG.siteDescription,
            activeAnnouncement: dbConfig.active_announcement || INITIAL_SITE_CONFIG.activeAnnouncement,
            facebookUrl: dbConfig.facebook_url || '',
            instagramUrl: dbConfig.instagram_url || '',
            pinterestUrl: dbConfig.pinterest_url || '',
            linkedinUrl: dbConfig.linkedin_url || '',
          });
        }

        // 2. Fetch Leads registries
        const { data: dbLeads } = await supabase
          .from('leads')
          .select('*')
          .order('submitted_at', { ascending: false });

        if (dbLeads && dbLeads.length > 0) {
          setLeads(dbLeads.map((l: any) => ({
            id: l.id,
            email: l.email,
            type: l.type,
            message: l.message || '',
            submittedAt: l.submitted_at || '',
          })));
        }

        // 3. Fetch Palettes - Support fetching unlimited items (>1000) from Supabase in batches
        let dbPalettes: any[] = [];
        let page = 0;
        const limitSize = 1000;
        let hasMore = true;
        let fetchPalettesError = null;

        while (hasMore) {
          const { data, error } = await supabase
            .from('palettes')
            .select('*')
            .order('likes', { ascending: false })
            .range(page * limitSize, (page + 1) * limitSize - 1);

          if (error) {
            fetchPalettesError = error;
            break;
          }

          if (data && data.length > 0) {
            dbPalettes = [...dbPalettes, ...data];
            if (data.length < limitSize) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }

        if (fetchPalettesError) {
          console.error("Failed to fetch initial palettes from Supabase:", fetchPalettesError);
          showToast(`Supabase Connection warning: ${fetchPalettesError.message}`, 'info');
        } else if (dbPalettes && dbPalettes.length > 0) {
          const mappedPalettes: Palette[] = dbPalettes.map((p: any) => ({
            id: String(p.id),
            title: p.title,
            colors: p.colors || [],
            tags: p.tags || [],
            likes: p.likes || 0,
            bookmarks: false,
            createdAt: p.created_at ? p.created_at.split('T')[0] : '',
            approved: p.approved !== undefined ? p.approved : true,
            isStaffPick: p.is_staff_pick || false,
            views: p.views || 0,
          }));

          // Fetch user-specific bookmarks or check localStorage
          if (sessionUser) {
            const { data: dbBookmarks } = await supabase
              .from('bookmarks')
              .select('palette_id')
              .eq('user_id', sessionUser.id);

            if (dbBookmarks && dbBookmarks.length > 0) {
              const bookmarkedIds = new Set(dbBookmarks.map((b: any) => b.palette_id));
              mappedPalettes.forEach((p) => {
                if (bookmarkedIds.has(p.id)) {
                  p.bookmarks = true;
                }
              });
            }
          } else {
            const localSaved = localStorage.getItem('flatpalette_bookmarks_v1');
            if (localSaved) {
              const bookmarkedIds = new Set(JSON.parse(localSaved));
              mappedPalettes.forEach((p) => {
                if (bookmarkedIds.has(p.id)) {
                  p.bookmarks = true;
                }
              });
            }
          }

          setPalettes(mappedPalettes);
        } else if (dbPalettes && dbPalettes.length === 0) {
          // Database is connected but the palettes table is empty! Let's seed it automatically
          console.log("Supabase palettes table is empty. Auto-seeding initial palettes list...");
          showToast("Syncing your empty Supabase database with default palettes...", "info");
          
          const itemsToInsert = INITIAL_PALETTES.map((p) => ({
            title: p.title,
            colors: p.colors,
            tags: p.tags,
            likes: p.likes,
            views: p.views || 10,
            approved: p.approved,
            is_staff_pick: p.isStaffPick || false
          }));

          const { data: seeded, error: seedError } = await supabase
            .from('palettes')
            .insert(itemsToInsert)
            .select();

          if (seedError) {
            console.warn("Seeding without ID failed, retrying with explicit IDs:", seedError.message);
            // Retry with explicit client string IDs if the schema defines ID as varchar/text without default
            const itemsWithClientIds = INITIAL_PALETTES.map((p) => ({
              id: p.id,
              title: p.title,
              colors: p.colors,
              tags: p.tags,
              likes: p.likes,
              views: p.views || 10,
              approved: p.approved,
              is_staff_pick: p.isStaffPick || false
            }));

            const { data: seededWithId, error: seedWithIdError } = await supabase
              .from('palettes')
              .insert(itemsWithClientIds)
              .select();

            if (seedWithIdError) {
              console.error("Critical: Both auto and client-ID seed attempts failed.", seedWithIdError);
              showToast(`Supabase Seeding Error: ${seedWithIdError.message}`, "error");
            } else if (seededWithId) {
              showToast("Seeded default palettes into Supabase successfully!", "success");
              setPalettes(seededWithId.map((p: any) => ({
                id: String(p.id),
                title: p.title,
                colors: p.colors || [],
                tags: p.tags || [],
                likes: p.likes || 0,
                bookmarks: false,
                createdAt: p.created_at ? p.created_at.split('T')[0] : '',
                approved: p.approved !== undefined ? p.approved : true,
                isStaffPick: p.is_staff_pick || false,
                views: p.views || 0,
              })));
            }
          } else if (seeded) {
            showToast("Successfully seeded palettes into Supabase!", "success");
            setPalettes(seeded.map((p: any) => ({
              id: String(p.id),
              title: p.title,
              colors: p.colors || [],
              tags: p.tags || [],
              likes: p.likes || 0,
              bookmarks: false,
              createdAt: p.created_at ? p.created_at.split('T')[0] : '',
              approved: p.approved !== undefined ? p.approved : true,
              isStaffPick: p.is_staff_pick || false,
              views: p.views || 0,
            })));
          }
        }
      } catch (err) {
        console.warn('Silent local fallback triggered. Register tables in Supabase dashboard to persist remote records:', err);
      }
    }

    initSupabaseData();
  }, [sessionUser]);

  // Sync state into LocalStorage
  useEffect(() => {
    localStorage.setItem('flatpalette_palettes_v1', JSON.stringify(palettes));
  }, [palettes]);

  useEffect(() => {
    localStorage.setItem('flatpalette_leads_v1', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('flatpalette_config_v1', JSON.stringify(siteConfig));
    // Persist configurations dynamically to site_config table in Supabase
    const syncConfigToDB = async () => {
      try {
        await supabase.from('site_config').upsert({
          id: 1,
          primary_neon_accent: siteConfig.primaryNeonAccent,
          homepage_carousel_enabled: siteConfig.homepageCarouselEnabled,
          site_title: siteConfig.siteTitle,
          site_description: siteConfig.siteDescription,
          active_announcement: siteConfig.activeAnnouncement,
          facebook_url: siteConfig.facebookUrl || null,
          instagram_url: siteConfig.instagramUrl || null,
          pinterest_url: siteConfig.pinterestUrl || null,
          linkedin_url: siteConfig.linkedinUrl || null,
        });
      } catch (err) {
        // Fail silently if table does not exist yet
      }
    };
    syncConfigToDB();
  }, [siteConfig]);

  // Adjust neon dynamic parameters globally across the page document root if customized by administrator
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-neon', siteConfig.primaryNeonAccent);
  }, [siteConfig.primaryNeonAccent]);

  // Redirect back to home if user is already authenticated but lands on signin/signup
  useEffect(() => {
    if (sessionUser && (activeTab === 'signin' || activeTab === 'signup')) {
      setActiveTab('home');
    }
  }, [sessionUser, activeTab]);

  // Handle Shared Deep-Linked parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paletteParam = params.get('palette');
    const colorsParam = params.get('colors');
    const titleParam = params.get('title');

    if (paletteParam) {
      const target = palettes.find(p => p.id === paletteParam);
      if (target) {
        setSelectedPalette(target);
      }
    } else if (colorsParam) {
      const parsedColors = colorsParam.split(',').map(c => c.trim().startsWith('#') ? c.trim() : `#${c.trim()}`);
      if (parsedColors.length >= 2 && parsedColors.every(c => /^#[0-9A-Fa-f]{6}$/.test(c))) {
        const sharedPalette: Palette = {
          id: `shared-${Date.now()}`,
          title: titleParam || 'Shared Custom Spectrum',
          colors: parsedColors,
          tags: ['shared', 'hues'],
          likes: 42,
          bookmarks: false,
          createdAt: new Date().toISOString().split('T')[0],
          approved: true,
          isStaffPick: false,
          views: 310
        };
        setSelectedPalette(sharedPalette);
      }
    }
  }, []);

  // Global search filtering for Simple feed on Home Tab (capped at 1000)
  const homeFilteredPalettes = useMemo(() => {
    let result = palettes.filter((p) => p.approved);

    // Filter by quick sub-tabs (Staff Picks vs Bookmarked Saves)
    if (homeFeedFilter === 'staff') {
      result = result.filter((p) => p.isStaffPick);
    } else if (homeFeedFilter === 'bookmarked') {
      result = result.filter((p) => p.bookmarks);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.colors.some((hex) => hex.toLowerCase().includes(q))
      );
    }

    return result;
  }, [palettes, homeFeedFilter, searchQuery]);

  // Handle Incremental Social Like feedback
  const handleLikePalette = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedLikes = 0;
    setPalettes((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedLikes = p.likes + 1;
          return { ...p, likes: updatedLikes };
        }
        return p;
      })
    );
    // If the active viewed detail is the liked one, sync details context too
    setSelectedPalette((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, likes: prev.likes + 1 };
      }
      return prev;
    });

    try {
      await supabase
        .from('palettes')
        .update({ likes: updatedLikes })
        .eq('id', id);
    } catch (err) {
      console.error('Error updating likes in Supabase:', err);
    }
  };

  // Handle Bookmark Quick toggle state
  const handleBookmarkPalette = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let targetBookmarkState = false;
    setPalettes((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          targetBookmarkState = !p.bookmarks;
          return { ...p, bookmarks: targetBookmarkState };
        }
        return p;
      })
    );
    // Sync viewed details state context
    setSelectedPalette((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, bookmarks: !prev.bookmarks };
      }
      return prev;
    });

    if (sessionUser) {
      try {
        if (targetBookmarkState) {
          await supabase.from('bookmarks').insert({
            user_id: sessionUser.id,
            palette_id: id,
          });
        } else {
          await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', sessionUser.id)
            .eq('palette_id', id);
        }
      } catch (err) {
        console.error('Error toggling bookmark in Supabase:', err);
      }
    } else {
      // Save guest bookmark locally
      const localSaved = localStorage.getItem('flatpalette_bookmarks_v1');
      let bookmarkedIds: string[] = localSaved ? JSON.parse(localSaved) : [];
      if (targetBookmarkState) {
        if (!bookmarkedIds.includes(id)) bookmarkedIds.push(id);
      } else {
        bookmarkedIds = bookmarkedIds.filter((bid) => bid !== id);
      }
      localStorage.setItem('flatpalette_bookmarks_v1', JSON.stringify(bookmarkedIds));
    }
  };

  // Add a newly submitted or newly generated custom palette item
  const handleAddNewPalette = async (title: string, colors: string[], tags: string[]) => {
    const paletteId = `p-${Date.now()}`;
    const newPal: Palette = {
      id: paletteId,
      title: title,
      colors: colors,
      tags: tags,
      likes: 1,
      bookmarks: false,
      createdAt: new Date().toISOString().split('T')[0],
      approved: true, // Auto-approve simulation
      isStaffPick: false,
      views: 12,
    };

    setPalettes((prev) => [newPal, ...prev]);
    showToast('Saving palette to Supabase...', 'info');

    // Strategy 1: Insert WITHOUT specifying 'id' or 'created_at'.
    // If the DB id is of type UUID or auto-incrementing serial/identity, this will succeed.
    const { data: dbInserted, error: insertWithoutIdError } = await supabase
      .from('palettes')
      .insert({
        title: title,
        colors: colors,
        tags: tags,
        likes: 1,
        views: 12,
        approved: true,
        is_staff_pick: false,
        user_id: sessionUser?.id || null,
      })
      .select()
      .maybeSingle();

    if (!insertWithoutIdError) {
      showToast('Palette saved successfully in Supabase!', 'success');
      if (dbInserted && dbInserted.id) {
        setPalettes((prev) =>
          prev.map((p) => p.id === paletteId ? { ...p, id: String(dbInserted.id) } : p)
        );
      }
      return;
    }

    // Strategy 2: If inserting without ID failed (e.g. 'null value in column "id" violates not-null' or 'id' doesn't auto-generate because it is a manual varchar/text primary key),
    // then retry inserting with the generated string client-side ID ('paletteId').
    console.warn('Auto-ID insert failed, retrying with client-side text ID:', insertWithoutIdError.message);
    const { data: dbInsertedWithId, error: insertWithIdError } = await supabase
      .from('palettes')
      .insert({
        id: paletteId,
        title: title,
        colors: colors,
        tags: tags,
        likes: 1,
        views: 12,
        approved: true,
        is_staff_pick: false,
        user_id: sessionUser?.id || null,
      })
      .select()
      .maybeSingle();

    if (!insertWithIdError) {
      showToast('Palette saved successfully in Supabase with client identifier!', 'success');
      return;
    }

    // If both failed, log the actual SQL constraint violation clearly
    console.error('All Supabase palette insertion attempts failed:', insertWithIdError);
    showToast(`Supabase Insert Error: ${insertWithIdError.message}`, 'error');
  };

  // Add lead emails registry
  const handleAddLeadRegistry = async (email: string, type: 'newsletter' | 'feature_request', message?: string) => {
    const leadId = `l-${Date.now()}`;
    const newLead: Lead = {
      id: leadId,
      email: email,
      type: type,
      message: message,
      submittedAt: new Date().toISOString()
    };
    setLeads((prev) => [newLead, ...prev]);

    // Strategy 1: Insert without ID to let Supabase auto-generate
    const { data: dbLeadInserted, error: leadWithoutIdError } = await supabase
      .from('leads')
      .insert({
        email: email,
        type: type,
        message: message || '',
        user_id: sessionUser?.id || null,
      })
      .select()
      .maybeSingle();

    if (!leadWithoutIdError) {
      if (dbLeadInserted && dbLeadInserted.id) {
        setLeads((prev) =>
          prev.map((l) => l.id === leadId ? { ...l, id: String(dbLeadInserted.id) } : l)
        );
      }
      return;
    }

    // Strategy 2: Retry with client string ID
    console.warn('Lead Auto-ID insert failed, retrying with client-side text ID:', leadWithoutIdError.message);
    const { error: leadWithIdError } = await supabase
      .from('leads')
      .insert({
        id: leadId,
        email: email,
        type: type,
        message: message || '',
        user_id: sessionUser?.id || null,
      });

    if (leadWithIdError) {
      console.error('All Supabase lead registration attempts failed:', leadWithIdError);
      showToast(`Supabase Lead Registry Error: ${leadWithIdError.message}`, 'error');
    }
  };

  const handleDeleteLeadRegistry = async (id: string) => {
    setLeads((prev) => prev.filter(l => l.id !== id));

    try {
      await supabase.from('leads').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting lead from Supabase:', err);
    }
  };

  const handleFooterNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail.trim()) return;

    handleAddLeadRegistry(footerEmail.trim(), 'newsletter');
    setFooterEmail('');
    setFooterSuccess(true);
    setTimeout(() => setFooterSuccess(false), 3000);
  };

  const handleOpenDetailedPalette = async (palette: Palette) => {
    const updatedViews = (palette.views || 0) + 1;
    setPalettes((prev) =>
      prev.map((p) => (p.id === palette.id ? { ...p, views: updatedViews } : p))
    );
    setSelectedPalette({ ...palette, views: updatedViews });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      await supabase
        .from('palettes')
        .update({ views: updatedViews })
        .eq('id', palette.id);
    } catch (err) {
      console.error('Error incrementing palette views in Supabase:', err);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#020617] text-slate-100'} flex flex-col selection:bg-[#00FFD1] selection:text-black font-sans relative overflow-x-hidden`}>
      {/* Decorative frosted-glass gradient glow blobs bound within clipped wrapper to prevent trailing footer space */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[-5%] w-[35%] h-[35%] bg-purple-600/15 rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-2%] right-[-10%] w-[50%] h-[50%] bg-[#00FFD1]/5 rounded-full blur-[160px]"></div>
      </div>
      
      {/* Mounted Sticky Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPalette(null); // Clear active detail view when switching core tabs
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        siteConfig={siteConfig}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        openSubmitForm={() => setSubmitModalOpen(true)}
        sessionUser={sessionUser}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Primary Orchestration Container */}
      <main className="flex-grow">
        
        {/* Render Root Admin Dashboard Toggle Panel */}
        {isAdmin && sessionUser ? (
          <div className="bg-slate-900/20" id="rendered-admin-workspace">
            {/* Header toolbar within admin */}
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 flex justify-between items-center border-b border-purple-500/20 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
                <span>flatpalette Administrator Control Matrix</span>
              </h2>
              <button
                onClick={() => setIsAdmin(false)}
                className="px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition-colors"
              >
                Return to Live Feed
              </button>
            </div>

            <AdminDashboard
              palettes={palettes}
              setPalettes={setPalettes}
              siteConfig={siteConfig}
              setSiteConfig={setSiteConfig}
              leads={leads}
              onDeleteLead={handleDeleteLeadRegistry}
            />
          </div>
        ) : (
          /* Render Public Client-facing Views */
          <div id="rendered-public-workspace">
            
            {/* Detail Modal Overlay View acts as highest focal point if selected */}
            {selectedPalette ? (
              <PaletteDetail
                palette={selectedPalette}
                onClose={() => setSelectedPalette(null)}
                onLike={handleLikePalette}
                onBookmark={handleBookmarkPalette}
                siteConfig={siteConfig}
                allPalettes={palettes}
                onSelectPalette={(p) => { setSelectedPalette(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              />
            ) : (
              /* Fallback to Tab Matrix */
              <div>
                {/* Tab 1: HOME (Explore Feed of Trending arrays) */}
                {activeTab === 'home' && (
                  <div>
                    {/* Glowing Neo Cyber Hero Panel */}
                    <Hero
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      siteConfig={siteConfig}
                    />

                    {/* Home Grid Section */}
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8" id="home-discovery-matrix">
                      
                      {/* Discovery Feed controls block */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4.5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-pink-500 animate-pulse" />
                          <h3 className="font-extrabold text-slate-100 text-lg tracking-tight">Discover Visual Harmonies</h3>
                        </div>

                        {/* Quick filter sub-tabs: All, Staff picks, Bookmarked Saves */}
                        <div className="flex bg-white/5 p-1 rounded-full border border-white/10 text-xs font-bold gap-1 self-start sm:self-auto backdrop-blur-md">
                          {[
                            { id: 'all', label: 'All Trending' },
                            { id: 'staff', label: '★ Staff Picks' },
                            { id: 'bookmarked', label: 'Saved Bookmarks' }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              id={`feed-sub-tab-${tab.id}`}
                              onClick={() => setHomeFeedFilter(tab.id as any)}
                              className={`px-4 py-1.5 rounded-full transition-all text-xs font-bold ${
                                homeFeedFilter === tab.id
                                  ? 'bg-white/10 text-[#00FFD1] shadow-lg border border-white/10'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                              style={homeFeedFilter === tab.id ? { color: siteConfig.primaryNeonAccent || '#00FFD1' } : {}}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display warning if bookmarked is empty */}
                      {homeFeedFilter === 'bookmarked' && homeFilteredPalettes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-slate-950 max-w-lg mx-auto" id="bookmarks-empty-alert">
                          <p className="font-semibold text-slate-300 text-sm">No bookmarked color arrays</p>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                            Click the bookmark icon on any palette block across the Explore feed or Color Archives to holds reference coordinates instantly.
                          </p>
                          <button
                            onClick={() => setHomeFeedFilter('all')}
                            className="mt-5 px-4.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                          >
                            Explore All Palettes
                          </button>
                        </div>
                      ) : homeFilteredPalettes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center bg-slate-950/40" id="search-empty-alert">
                          <p className="font-semibold text-slate-300 text-sm">No color configurations matched search parameters</p>
                          <p className="text-xs text-slate-500 mt-1">Try keywords like 'Retro', 'Minimal', or hex colors like '#ffd700'.</p>
                        </div>
                      ) : (
                        <div 
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" 
                          id="home-palette-grid"
                        >
                          {homeFilteredPalettes.slice(0, visibleCount).map((p, idx) => (
                            <PaletteCard
                              key={p.id}
                              palette={p}
                              index={idx}
                              onSelect={handleOpenDetailedPalette}
                              onLike={handleLikePalette}
                              onBookmark={handleBookmarkPalette}
                            />
                          ))}
                        </div>
                      )}

                      {/* Dynamic load expansion trigger if there are more color harmony patterns */}
                      {homeFilteredPalettes.length > visibleCount && (
                        <div className="text-center pt-4" id="home-load-more-section">
                          <button
                            id="home-load-more-btn"
                            onClick={() => setVisibleCount((prev) => prev + 24)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 hover:border-[#00FFD1]/50 text-slate-200 hover:text-white bg-white/5 hover:bg-[#00FFD1]/10 text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-95 group cursor-pointer"
                          >
                            <ChevronDown className="h-4 w-4 text-[#00FFD1] group-hover:translate-y-0.5 transition-transform" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                            <span>Load More Harmonies</span>
                          </button>
                        </div>
                      )}

                      {/* Explore View All Call to action footer banner */}
                      <div className="text-center pt-6">
                        <button
                          id="home-view-all-archives-btn"
                          onClick={() => { setActiveTab('explore'); setExploreSelectedHue('all'); setSelectedPalette(null); }}
                          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white text-xs font-bold tracking-wider uppercase border border-white/10 hover:border-white/20 transition-all shadow-md group"
                        >
                          <span>Open Comprehensive Archives</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }} />
                        </button>
                      </div>

                      {/* Curated Creative Utilities above footer */}
                      <div className="mt-20 pt-10" id="curated-creative-toolkit-section">
                        <DesignUtilities theme={theme} siteConfig={siteConfig} />
                      </div>

                    </div>
                  </div>
                )}

                {/* Tab 2: EXPLORE (Comprehensive Filter Search Side-Rail Interface) */}
                {activeTab === 'explore' && (
                  <ExploreArchives
                    palettes={palettes}
                    onSelect={handleOpenDetailedPalette}
                    onLike={handleLikePalette}
                    onBookmark={handleBookmarkPalette}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedHue={exploreSelectedHue}
                    setSelectedHue={setExploreSelectedHue}
                    selectedSort={exploreSelectedSort}
                    setSelectedSort={setExploreSelectedSort}
                    theme={theme}
                    siteConfig={siteConfig}
                  />
                )}

                {/* Tab 3: GENERATOR (Interactive Space locked generators) */}
                {activeTab === 'generator' && (
                  sessionUser ? (
                    <GeneratorHub onAddSubittedPalette={handleAddNewPalette} initialColors={generatorSeedColors} />
                  ) : (
                    <div className="mx-auto max-w-xl py-16 px-6 text-center space-y-6" id="generator-locked-state">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2 shadow-inner">
                        <Sliders className="h-7 w-7 text-amber-400 animate-pulse" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Harmony Matrix Locked</h2>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                        To shift dynamic color frequencies, lock seeds, and export customized color palettes, you must establish an authorized session.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => setActiveTab('signin')}
                          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-600 to-[#00FFD1] text-white text-xs font-black uppercase tracking-wider rounded-lg shadow-lg hover:shadow-cyan-500/15 active:scale-95 transition-all cursor-pointer"
                        >
                          Sign In to Unlock
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Tab 4: DOCUMENTS Core design guidelines and guidelines */}
                {activeTab === 'guidelines' && (
                  <LegalContact 
                    onAddSubittedPalette={handleAddNewPalette}
                    onAddLead={handleAddLeadRegistry}
                    siteConfig={siteConfig}
                  />
                )}

                {/* Tab 5: COLOR NAMES (Redesigned interactive color names lookups) */}
                {activeTab === 'color-names' && (
                  <ColorNames
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#e11d48', '#4f46e5', '#16a34a', '#a3e635']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* Tab 6: COLOR WHEEL (Redesigned graphic interactive color wheel spectrum) */}
                {activeTab === 'color-wheel' && (
                  <ColorWheel
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#e11d48', '#4f46e5', '#16a34a', '#a3e635']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* Tab 7: 216 WEB SAFE COLORS */}
                {activeTab === 'web-safe-colors' && (
                  <WebSafeColors
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#e11d48', '#4f46e5', '#16a34a', '#a3e635']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* Tab 8: TAILWIND COLOR SPECIFICATION CHART */}
                {activeTab === 'tailwind-colors' && (
                  <TailwindColors
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#e11d48', '#4f46e5', '#16a34a', '#a3e635']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* Tab 9: MATERIAL DESIGN COLOR CHART */}
                {activeTab === 'material-colors' && (
                  <MaterialColors
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#ff8a80', '#e91e63', '#3f51b5', '#4caf50', '#ffeb3b']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* Tab 10: FLAT DESIGN COLOR CHART */}
                {activeTab === 'flat-colors' && (
                  <FlatColors
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#1abc9c', '#e67e22', '#9b59b6', '#34495e', '#ecf0f1']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* Tab 11: INTERACTIVE COHESIVE COLOR PICKER */}
                {activeTab === 'color-picker' && (
                  <ColorPicker
                    theme={theme}
                    siteConfig={siteConfig}
                    showToast={showToast}
                    onSendToGenerator={(hexColor) => {
                      setGeneratorSeedColors([hexColor, '#00ffd1', '#ff6b6b', '#a55eea', '#2f3542', '#ffffff']);
                      setActiveTab('generator');
                    }}
                  />
                )}

                {/* About application view */}
                {activeTab === 'about' && (
                  <AboutAndPolicies 
                    view="about" 
                    siteConfig={siteConfig} 
                    setActiveTab={setActiveTab} 
                    palettes={palettes}
                  />
                )}

                {/* Privacy policy view */}
                {activeTab === 'privacy' && (
                  <AboutAndPolicies 
                    view="privacy" 
                    siteConfig={siteConfig} 
                    setActiveTab={setActiveTab} 
                    palettes={palettes}
                  />
                )}

                {/* Terms of Service view */}
                {activeTab === 'terms' && (
                  <AboutAndPolicies 
                    view="terms" 
                    siteConfig={siteConfig} 
                    setActiveTab={setActiveTab} 
                    palettes={palettes}
                  />
                )}

                {/* Sitemap index view */}
                {activeTab === 'sitemap' && (
                  <AboutAndPolicies 
                    view="sitemap" 
                    siteConfig={siteConfig} 
                    setActiveTab={setActiveTab} 
                    palettes={palettes}
                  />
                )}

                {/* Tab 5: SIGNIN form section */}
                {activeTab === 'signin' && (
                  <SignIn 
                    onSuccess={() => setActiveTab('home')}
                    onNavigateToSignUp={() => setActiveTab('signup')}
                  />
                )}

                {/* Tab 6: SIGNUP form section */}
                {activeTab === 'signup' && (
                  <SignUp 
                    onSuccess={() => setActiveTab('home')}
                    onNavigateToSignIn={() => setActiveTab('signin')}
                  />
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Dynamic Multi-column Site Footer */}
      <footer className={`border-t ${theme === 'light' ? 'border-slate-200 bg-white/50 text-slate-600' : 'border-white/10 bg-[#020617]/50 text-slate-400'} backdrop-blur-md pt-16 pb-8 text-xs mt-20`} id="site-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            
            {/* Column 1: App descriptors (Col Span 4) */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#00FFD1] to-purple-600 p-0.5 shadow">
                  <div className={`h-full w-full rounded-[6px] ${theme === 'light' ? 'bg-[#f8fafc]' : 'bg-[#020617]'} flex items-center justify-center`}>
                    <span className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-black text-sm`}>FP</span>
                  </div>
                </div>
                <span className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} text-xl font-black`}>flat<span className="text-[#00FFD1]" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1' }}>palette</span></span>
              </div>
              
              <p className="text-slate-400 leading-relaxed text-xs max-w-xs font-medium">
                flatpalette is a high-utility systemic color architecture discoverer and lock generator. Discover Copy-to-clipboard formulas and instant React Tailwind variables.
              </p>

              {/* Social Media Coordinate Links */}
              <div className="flex items-center gap-2.5 pt-1 pb-2">
                {siteConfig.facebookUrl && (
                  <a 
                    href={siteConfig.facebookUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/50 text-slate-400 hover:text-[#00FFD1] transition-all transform hover:scale-115" 
                    title="Facebook"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                  </a>
                )}
                {siteConfig.instagramUrl && (
                  <a 
                    href={siteConfig.instagramUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/50 text-slate-400 hover:text-[#00FFD1] transition-all transform hover:scale-115" 
                    title="Instagram"
                  >
                    <Instagram className="h-3.5 w-3.5" />
                  </a>
                )}
                {siteConfig.pinterestUrl && (
                  <a 
                    href={siteConfig.pinterestUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/50 text-slate-400 hover:text-[#00FFD1] transition-all transform hover:scale-115 flex items-center justify-center" 
                    title="Pinterest"
                  >
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.372 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.013-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.372.372 0 01.085.35c-.092.383-.298 1.211-.338 1.378-.053.221-.176.268-.406.161-1.514-.704-2.461-2.918-2.461-4.697 0-3.824 2.78-7.334 8.01-7.334 4.205 0 7.471 2.997 7.471 7 0 4.18-2.628 7.545-6.275 7.545-1.225 0-2.379-.637-2.773-1.387l-.756 2.883c-.273 1.042-1.01 2.351-1.503 3.155C10.027 23.851 11.002 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                    </svg>
                  </a>
                )}
                {siteConfig.linkedinUrl && (
                  <a 
                    href={siteConfig.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-[#00FFD1]/10 hover:border-[#00FFD1]/50 text-slate-400 hover:text-[#00FFD1] transition-all transform hover:scale-115" 
                    title="LinkedIn"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center space-x-2.5">
                <span className="font-mono text-[9px] text-[#00FFD1] bg-[#00FFD1]/5 border border-[#00FFD1]/10 px-2 py-0.5 rounded" style={{ color: siteConfig.primaryNeonAccent || '#00FFD1', borderColor: `${siteConfig.primaryNeonAccent || '#00FFD1'}1a` }}>CC0 PUBLIC DOMAIN</span>
                <span className="font-mono text-[9px] text-pink-550 bg-pink-950/40 border border-pink-500/10 px-2 py-0.5 rounded">VITE + REACT 19</span>
              </div>
            </div>

            {/* Column 2: Quick Links (Col Span 2) */}
            <div className="md:col-span-2 space-y-3">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Platform Maps</h5>
              <div className="flex flex-col space-y-2">
                <button onClick={() => { setActiveTab('home'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer">Explore Feed</button>
                <button onClick={() => { setActiveTab('explore'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer">Color Archives</button>
                <button onClick={() => { setActiveTab('about'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer">About Us</button>
                <button onClick={() => { setActiveTab('privacy'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer">Privacy Policy</button>
                <button onClick={() => { setActiveTab('terms'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer">Terms of Service</button>
                <button onClick={() => { setActiveTab('guidelines'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-white transition-colors cursor-pointer">Guidelines Core</button>
                <button onClick={() => { setActiveTab('web-safe-colors'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer font-bold">216 Web Safe Colors</button>
                <button onClick={() => { setActiveTab('tailwind-colors'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer font-bold">Tailwind Color Chart</button>
                <button onClick={() => { setActiveTab('material-colors'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer font-bold">Material Design Color</button>
                <button onClick={() => { setActiveTab('flat-colors'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer font-bold">Flat Color Design</button>
                <button onClick={() => { setActiveTab('sitemap'); setIsAdmin(false); setSelectedPalette(null); }} className="text-left text-slate-400 hover:text-[#00FFD1] transition-colors cursor-pointer font-bold">Interactive Sitemap</button>
              </div>
            </div>

            {/* Column 3: Design systems helpers (Col Span-3) */}
            <div className="md:col-span-3 space-y-3">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">Design frameworks</h5>
              <div className="flex flex-col space-y-2 leading-relaxed">
                <span>Tailwind CSS Extends</span>
                <span>Figma Variables Mapping</span>
                <span>SASS Variables Variables</span>
                <span>JSON-LD Page Schemas</span>
              </div>
            </div>

            {/* Column 4: Newsletter capture (Col Span 3) */}
            <div className="md:col-span-3 space-y-3" id="newsletter-capture-block">
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5 flex-nowrap">
                <Mail className="h-3.5 w-3.5 text-pink-500" />
                <span>Join Speed Tier Feed</span>
              </h5>
              <p className="text-slate-400 text-xs text-slate-450">Get weekly updates on vibrant trending staff pick palettes.</p>
              
              <form onSubmit={handleFooterNewsletterSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  id="footer-email-input"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="designer@agency.io"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-450 outline-none focus:border-[#00FFD1]/40 transition-colors"
                />
                <button
                  type="submit"
                  id="footer-newsletter-submit-btn"
                  className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-[#00FFD1] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>Subscribe stream</span>
                </button>
              </form>
              {footerSuccess && (
                <p className="text-[10px] text-emerald-400 font-bold tracking-wide mt-1.5 animate-pulse flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Welcome to the Speed Tier!</span>
                </p>
              )}
            </div>

          </div>

          {/* Core Footer Bottom details */}
          <div className="border-t border-white/5 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <div>
              <span>© {new Date().getFullYear()} flatpalette Color Architecture. Operates under </span>
              <a href="#licence" onClick={() => { setActiveTab('terms'); setSelectedPalette(null); }} className="text-slate-400 hover:text-white font-mono uppercase text-[10px] tracking-wide underline ml-0.5">CC0 Creative License</a>
            </div>
            <div>
              <span>Designed and bundled for developers by senior system engineers.</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Structured Mock Submission Popup Drawer Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="submit-modal-overlay">
          {/* Backdrop screen */}
          <div 
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm cursor-pointer"
            onClick={() => setSubmitModalOpen(false)}
          />

          {/* Drawer Paper */}
          <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl z-10 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-pink-500" />
                <h3 className="font-extrabold text-white text-base">Submit Dynamic Color Array</h3>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                id="close-modal-btn"
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <LegalContact 
              onAddSubittedPalette={handleAddNewPalette}
              onAddLead={handleAddLeadRegistry}
              compactSubmissionOnly={true}
              onSubmitSuccess={() => setSubmitModalOpen(false)}
            />

          </div>
        </div>
      )}

      {/* Toast Notification HUD */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full" id="toast-hub">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className={`cursor-pointer flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-transform duration-300 hover:scale-[1.02] ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-200 shadow-red-500/5'
                : toast.type === 'success'
                ? 'bg-[#00FFD1]/10 border-[#00FFD1]/30 text-[#00FFD1] shadow-[#00FFD1]/5'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-200 shadow-blue-500/5'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'error' ? (
                <X className="h-4 w-4 text-red-400" />
              ) : toast.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-[#00FFD1]" />
              ) : (
                <Sparkles className="h-4 w-4 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold leading-relaxed">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
