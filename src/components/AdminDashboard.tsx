import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings2, Layers, Sliders, Database, MailCheck, ShieldCheck, 
  Trash2, Check, Edit2, Save, Sparkles, SlidersHorizontal, Eye, Globe,
  X, Search, Filter
} from 'lucide-react';
import { Palette, SiteConfig, Lead } from '../types';
import { COLOR_NOMECLATURE_MAP } from '../data';
import { supabase } from '../supabaseClient';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
}

interface AdminDashboardProps {
  palettes: Palette[];
  setPalettes: React.Dispatch<React.SetStateAction<Palette[]>>;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  leads: Lead[];
  onDeleteLead: (id: string) => void;
}

export default function AdminDashboard({
  palettes,
  setPalettes,
  siteConfig,
  setSiteConfig,
  leads,
  onDeleteLead,
}: AdminDashboardProps) {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'manager' | 'customizer' | 'leads' | 'indexer' | 'seo'>('manager');
  
  // States for search and filter in Live Palette Moderation
  const [managerSearch, setManagerSearch] = useState('');
  const [managerFilter, setManagerFilter] = useState<'all' | 'approved' | 'pending' | 'staff'>('all');

  // Computed/filtered palettes for moderation (capped at 1000)
  const filteredManagerPalettes = React.useMemo(() => {
    const list = palettes.filter((p) => {
      // 1. Status Filter
      if (managerFilter === 'approved' && !p.approved) return false;
      if (managerFilter === 'pending' && p.approved) return false;
      if (managerFilter === 'staff' && !p.isStaffPick) return false;

      // 2. Search query matching
      if (managerSearch.trim() !== '') {
        const query = managerSearch.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesId = p.id.toLowerCase().includes(query);
        const matchesHex = p.colors.some(col => col.toLowerCase().includes(query));
        return matchesTitle || matchesTags || matchesId || matchesHex;
      }

      return true;
    });
    return list;
  }, [palettes, managerFilter, managerSearch]);
  
  // Custom dialog confirmation modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmLabel: 'Delete'
  });

  // States for palette editing
  const [editingPaletteId, setEditingPaletteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');

  // States for SEO panel
  const [seoSlugs, setSeoSlugs] = useState<{ [key: string]: string }>({
    'p1': 'tokyo-midnight-neon-pink-cyberpunk',
    'p2': 'sunset-cyber-amber-glow',
    'p3': 'pastel-matcha-soft-green'
  });

  // CMS configuration submit
  const handleConfigChange = (field: keyof SiteConfig, val: any) => {
    setSiteConfig((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  // Approval/Toggle states inside the matrix
  const handleToggleApprove = async (id: string) => {
    let targetVal = false;
    setPalettes((prev) => 
      prev.map((p) => {
        if (p.id === id) {
          targetVal = !p.approved;
          return { ...p, approved: targetVal };
        }
        return p;
      })
    );
    try {
      await supabase.from('palettes').update({ approved: targetVal }).eq('id', id);
    } catch (err) {
      console.error('Error updating approval status in Supabase:', err);
    }
  };

  const handleToggleStaffPick = async (id: string) => {
    let targetVal = false;
    setPalettes((prev) => 
      prev.map((p) => {
        if (p.id === id) {
          targetVal = !p.isStaffPick;
          return { ...p, isStaffPick: targetVal };
        }
        return p;
      })
    );
    try {
      await supabase.from('palettes').update({ is_staff_pick: targetVal }).eq('id', id);
    } catch (err) {
      console.error('Error updating staff pick status in Supabase:', err);
    }
  };

  const handleDeletePalette = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Palette Permanent',
      message: 'Are you sure you want to delete this color palette permanently from flatpalette archive? This action cannot be undone.',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setPalettes((prev) => prev.filter((p) => p.id !== id));
        try {
          await supabase.from('palettes').delete().eq('id', id);
        } catch (err) {
          console.error('Error deleting palette from Supabase:', err);
        }
      }
    });
  };

  const handleDeletePaletteTag = (paletteId: string, tagToDelete: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category Tag',
      message: `Are you sure you want to delete the category tag "#${tagToDelete}" from this palette?`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        let updatedTags: string[] = [];
        setPalettes((prev) =>
          prev.map((p) => {
            if (p.id === paletteId) {
              updatedTags = p.tags.filter((t) => t !== tagToDelete);
              return {
                ...p,
                tags: updatedTags,
              };
            }
            return p;
          })
        );
        try {
          await supabase.from('palettes').update({ tags: updatedTags }).eq('id', paletteId);
        } catch (err) {
          console.error('Error deleting tag in Supabase:', err);
        }
      }
    });
  };

  const handleDeleteTagInEdit = (tagToDelete: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category Tag',
      message: `Are you sure you want to delete the category tag "#${tagToDelete}" from the active editing state?`,
      confirmLabel: 'Delete',
      onConfirm: () => {
        const updated = editTags.split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .filter((t) => t !== tagToDelete);
        setEditTags(updated.join(', '));
      }
    });
  };

  const handleStartEdit = (p: Palette) => {
    setEditingPaletteId(p.id);
    setEditTitle(p.title);
    setEditTags(p.tags.join(', '));
  };

  const handleSaveEdit = async (id: string) => {
    const updatedTags = editTags.split(',').map((t) => t.trim()).filter(Boolean);
    setPalettes((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            title: editTitle,
            tags: updatedTags,
          };
        }
        return p;
      })
    );
    setEditingPaletteId(null);
    try {
      await supabase.from('palettes').update({
        title: editTitle,
        tags: updatedTags,
      }).eq('id', id);
    } catch (err) {
      console.error('Error saving edited palette in Supabase:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="admin-dashboard-root">
      
      {/* Security alert header banner */}
      <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 p-4.5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-purple-400 shrink-0" />
          <div>
            <span className="text-white text-sm font-bold block">Developer System Simulation State</span>
            <span className="text-slate-400 text-xs">You are logged in as Root Architect. Changes sync to index states directly.</span>
          </div>
        </div>
        <div className="text-[10px] uppercase font-mono tracking-widest bg-purple-900/30 text-purple-300 px-3 py-1 rounded border border-purple-500/20">
          SYS_SECURE_AUTH: OK
        </div>
      </div>

      {/* Admin control matrix tabs header */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-white/5 scrollbar-thin overflow-x-auto gap-1 mb-8">
        {[
          { id: 'manager', label: 'Palette Manager Ledger', icon: Layers },
          { id: 'customizer', label: 'Site Customizer Panel', icon: Sliders },
          { id: 'leads', label: 'Lead & Email Manager', icon: MailCheck },
          { id: 'indexer', label: 'Hex Index Search Map', icon: Database },
          { id: 'seo', label: 'SEO Slug Optimizer', icon: Globe },
        ].map((sub) => {
          const Icon = sub.icon;
          const isSelected = activeAdminSubTab === sub.id;
          return (
            <button
              key={sub.id}
              id={`admin-tab-${sub.id}`}
              onClick={() => setActiveAdminSubTab(sub.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isSelected 
                  ? 'bg-purple-900/60 text-white shadow-md border border-purple-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render selected admin workspace page */}
      <div className="bg-slate-900/10 border border-white/5 p-6 rounded-2xl" id="admin-content-shell">
        
        {/* Workspace 1: Palette Manager CRUD ledger */}
        {activeAdminSubTab === 'manager' && (
          <div className="space-y-6" id="admin-palette-manager">
            <div className="border-b border-white/5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Live Palette Moderation</h3>
                <p className="text-xs text-slate-400">Moderate custom submission flows, tag coordinates, and highlights.</p>
              </div>
            </div>

            {/* Search and Filter Control Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl bg-slate-950/40 border border-white/5 items-center">
              {/* Search text input */}
              <div className="relative md:col-span-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  placeholder="Filter by title, tag, ID, color hex..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:border-purple-500 outline-hidden transition-colors"
                />
                {managerSearch && (
                  <button
                    onClick={() => setManagerSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter tabs list */}
              <div className="md:col-span-7 flex flex-wrap items-center justify-start md:justify-end gap-1.5 text-xs">
                <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mr-1 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>Status:</span>
                </span>
                {[
                  { id: 'all', label: 'All', count: palettes.length },
                  { id: 'pending', label: 'Pending', count: palettes.filter(p => !p.approved).length },
                  { id: 'approved', label: 'Approved', count: palettes.filter(p => p.approved).length },
                  { id: 'staff', label: 'Staff Pick', count: palettes.filter(p => p.isStaffPick).length },
                ].map((item) => {
                  const isSelected = managerFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setManagerFilter(item.id as any)}
                      className={`px-3 py-1.5 rounded-lg border text-[10.5px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-purple-900/60 border-purple-500/40 text-purple-350 font-black'
                          : 'bg-white/2 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`text-[9px] font-mono px-1 rounded-xs ${
                        isSelected ? 'bg-purple-500/20 text-purple-200' : 'bg-white/5 text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match statistic and clear action */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-bold">
              <div>
                SHOWING {filteredManagerPalettes.length} OF {palettes.length} SPECTRAL ARCHIVE ENTRIES
              </div>
              {(managerSearch || managerFilter !== 'all') && (
                <button
                  onClick={() => {
                    setManagerSearch('');
                    setManagerFilter('all');
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors uppercase text-[10px] cursor-pointer"
                >
                  Clear filter configurations
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300 border-collapse">
                <thead className="text-[10px] font-mono tracking-widest uppercase bg-slate-900 p-2.5 text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="py-3 px-4">Palette info</th>
                    <th className="py-3 px-4">Color array map</th>
                    <th className="py-3 px-4 text-center">Approved</th>
                    <th className="py-3 px-4 text-center">Staff Pick</th>
                    <th className="py-3 px-4 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredManagerPalettes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500 font-medium italic">
                        No color configurations match the active search query or selected status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredManagerPalettes.map((p) => {
                      const isEditing = editingPaletteId === p.id;
                      return (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors" id={`admin-row-${p.id}`}>
                        
                        <td className="py-3.5 px-4 max-w-xs">
                          {isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full text-xs bg-slate-950 rounded border border-white/15 px-2 py-1 text-white text-left font-semibold outline-hidden"
                              />
                              <div className="flex flex-wrap gap-1 my-1 overflow-hidden">
                                <AnimatePresence mode="popLayout">
                                  {editTags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                                    <motion.span 
                                      key={t}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                      layout
                                      className="bg-purple-900/40 border border-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1"
                                    >
                                      <span>#{t}</span>
                                      <button
                                        type="button"
                                        className="text-purple-400 hover:text-red-400 font-extrabold ml-0.5 text-xs cursor-pointer"
                                        onClick={() => handleDeleteTagInEdit(t)}
                                        title={`Delete category tag ${t}`}
                                      >
                                        &times;
                                      </button>
                                    </motion.span>
                                  ))}
                                </AnimatePresence>
                              </div>
                              <input
                                type="text"
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                                className="w-full text-xs bg-slate-950 rounded border border-white/15 px-2 py-1 text-slate-300 font-mono text-left outline-hidden"
                                placeholder="Comma separated tags..."
                              />
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-white text-sm block">{p.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {p.id} • {p.likes} likes</span>
                              <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden">
                                <AnimatePresence mode="popLayout">
                                  {p.tags.map(t => (
                                    <motion.span 
                                      key={t}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                      layout
                                      className="bg-slate-800 hover:bg-slate-700/80 text-[9.5px] px-2 py-0.5 rounded-md text-slate-300 flex items-center gap-1 group/tag transition-all"
                                    >
                                      <span>#{t}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePaletteTag(p.id, t)}
                                        className="text-slate-400 hover:text-red-400 font-extrabold ml-0.5 text-xs transition-colors cursor-pointer"
                                        title={`Delete category tag #${t}`}
                                      >
                                        &times;
                                      </button>
                                    </motion.span>
                                  ))}
                                </AnimatePresence>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex h-6.5 w-28 rounded overflow-hidden">
                            {p.colors.map((hex, i) => (
                              <div 
                                key={i} 
                                className="flex-1" 
                                style={{ backgroundColor: hex }} 
                                title={hex.toUpperCase()}
                              />
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            id={`approve-toggle-${p.id}`}
                            onClick={() => handleToggleApprove(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                              p.approved 
                                ? 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-amber-950/60 border border-amber-500/20 text-amber-500'
                            }`}
                          >
                            {p.approved ? 'APPROVED' : 'PENDING'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            id={`staff-toggle-${p.id}`}
                            onClick={() => handleToggleStaffPick(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold select-none ${
                              p.isStaffPick 
                                ? 'bg-pink-950/60 border border-pink-500/20 text-pink-400' 
                                : 'bg-slate-950 text-slate-450 border border-white/5'
                            }`}
                          >
                            {p.isStaffPick ? '★ STAFF' : 'REGULAR'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          {isEditing ? (
                            <button
                              id={`save-edit-${p.id}`}
                              onClick={() => handleSaveEdit(p.id)}
                              className="p-1 px-2.5 bg-emerald-700 hover:bg-emerald-600 font-bold rounded text-white text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="h-3 w-3" />
                              <span>Save</span>
                            </button>
                          ) : (
                            <button
                              id={`start-edit-${p.id}`}
                              onClick={() => handleStartEdit(p)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5"
                              title="Edit Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            id={`delete-palette-${p.id}`}
                            onClick={() => handleDeletePalette(p.id)}
                            className="p-1 text-red-400 hover:text-red-500 hover:bg-red-550/10 rounded"
                            title="Delete Palette"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Workspace 2: System System Theme & Customizer */}
        {activeAdminSubTab === 'customizer' && (
          <div className="space-y-6" id="admin-customizer">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Design System Configuration (CMS)</h3>
              <p className="text-xs text-slate-400">Modify global color settings, neon brand guidelines, and real-time banner announcements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Primary Neon Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={siteConfig.primaryNeonAccent}
                      onChange={(e) => handleConfigChange('primaryNeonAccent', e.target.value)}
                      className="h-10 w-12 rounded bg-slate-950 border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={siteConfig.primaryNeonAccent}
                      onChange={(e) => handleConfigChange('primaryNeonAccent', e.target.value)}
                      className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-white uppercase text-left outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Announcement Banner text</label>
                  <input
                    type="text"
                    value={siteConfig.activeAnnouncement}
                    onChange={(e) => handleConfigChange('activeAnnouncement', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none"
                    placeholder="Enter active announcement banner text..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Site Header Logo name</label>
                  <input
                    type="text"
                    value={siteConfig.siteTitle}
                    onChange={(e) => handleConfigChange('siteTitle', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Hero Lead Description</label>
                  <textarea
                    rows={3}
                    value={siteConfig.siteDescription}
                    onChange={(e) => handleConfigChange('siteDescription', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none leading-relaxed"
                  />
                </div>
              </div>

            </div>

            <div className="border-t border-white/5 pt-4 mt-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono mb-3">Social Media Coordinate Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Facebook Link</label>
                  <input
                    type="text"
                    value={siteConfig.facebookUrl || ''}
                    onChange={(e) => handleConfigChange('facebookUrl', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none focus:border-[#00FFD1]/40 transition-colors"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Instagram Link</label>
                  <input
                    type="text"
                    value={siteConfig.instagramUrl || ''}
                    onChange={(e) => handleConfigChange('instagramUrl', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none focus:border-[#00FFD1]/40 transition-colors"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Pinterest Link</label>
                  <input
                    type="text"
                    value={siteConfig.pinterestUrl || ''}
                    onChange={(e) => handleConfigChange('pinterestUrl', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none focus:border-[#00FFD1]/40 transition-colors"
                    placeholder="https://pinterest.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest font-mono mb-1.5">LinkedIn Link</label>
                  <input
                    type="text"
                    value={siteConfig.linkedinUrl || ''}
                    onChange={(e) => handleConfigChange('linkedinUrl', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white text-left outline-none focus:border-[#00FFD1]/40 transition-colors"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workspace 3: Lead & Form Manager */}
        {activeAdminSubTab === 'leads' && (
          <div className="space-y-6" id="admin-leads-manager">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Lead Database registries</h3>
              <p className="text-xs text-slate-400">View emails captured from active marketing structures and custom features requests.</p>
            </div>

            <div className="overflow-x-auto">
              {leads.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 bg-slate-950/45 rounded-lg text-center font-mono">NO LEADS REGISTERED IN DATABASE</p>
              ) : (
                <table className="w-full text-xs text-left text-slate-300 border-collapse">
                  <thead className="bg-slate-900 border-b border-white/5 uppercase font-mono tracking-widest text-[9.5px] text-slate-400">
                    <tr>
                      <th className="py-2.5 px-4">Contact Email</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Message / Feature Details</th>
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((l) => (
                      <tr key={l.id} id={`lead-row-${l.id}`} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-bold text-white max-w-xs truncate">{l.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            l.type === 'newsletter' 
                              ? 'bg-blue-950/50 text-blue-400 border border-blue-500/10' 
                              : 'bg-purple-950/50 text-purple-400 border border-purple-500/10'
                          }`}>
                            {l.type === 'newsletter' ? 'NEWSLETTER capture' : 'FEATURE request'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{l.message || 'No extra guidelines supplied.'}</td>
                        <td className="py-3 px-4 font-mono text-[10.5px]">{l.submittedAt}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            id={`delete-lead-btn-${l.id}`}
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Delete Lead Registry',
                                message: `Are you sure you want to delete the lead registry for "${l.email}" permanently?`,
                                confirmLabel: 'Delete',
                                onConfirm: () => {
                                  onDeleteLead(l.id);
                                }
                              });
                            }}
                            className="text-red-400 hover:text-red-500 p-1 rounded"
                            title="Delete Registry"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Workspace 4: Hex Index Search map */}
        {activeAdminSubTab === 'indexer' && (
          <div className="space-y-6" id="admin-search-indexer">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-slate-100">Simulated Search Index mapping grid</h3>
              <p className="text-xs text-slate-400">Maps natural nomenclature strings to specific dynamic color arrays.</p>
            </div>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              To support hyper-efficient search execution, flatpalette indexes colors into semantic labels. Search queries for colors like "cyan" or "pink" look up metadata coordinates dynamically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="indexer-mapping-details">
              {Object.keys(COLOR_NOMECLATURE_MAP).map((key) => {
                const hexes = COLOR_NOMECLATURE_MAP[key];
                return (
                  <div key={key} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                      <span className="font-bold text-white uppercase font-mono tracking-wider">#{key} Keyword Group</span>
                      <span className="text-[10px] font-mono text-[#00FFD1]">{hexes.length} mapped hexes</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {hexes.map((hex) => (
                        <div key={hex} className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9.5px]">
                          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: hex }} />
                          <span className="font-mono text-slate-350">{hex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Workspace 5: SEO slug details helper */}
        {activeAdminSubTab === 'seo' && (
          <div className="space-y-6" id="admin-seo-meta">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-slate-100">SEO & Metadata Control Center</h3>
              <p className="text-xs text-slate-400">Manage descriptions, page titles, and indexable URL slug properties per palette entry.</p>
            </div>

            <div className="space-y-3.5">
              {palettes.slice(0, 5).map((p) => {
                const currentSlug = seoSlugs[p.id] || p.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                return (
                  <div key={p.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/40 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    <div className="md:col-span-3">
                      <span className="font-bold text-white text-xs block">{p.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {p.id}</span>
                    </div>

                    <div className="md:col-span-6">
                      <label className="text-[10px] font-mono text-pink-400 block mb-1">CRAWLER SLUG PATH:</label>
                      <input
                        type="text"
                        value={currentSlug}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSeoSlugs(prev => ({ ...prev, [p.id]: val }));
                        }}
                        className="w-full bg-slate-950 rounded border border-white/10 px-2.5 py-1.5 text-xs font-mono text-slate-300 text-left outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="md:col-span-3 text-right">
                      <span className="text-[10px] bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded inline-flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span>Sitemap Indexed</span>
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Custom Confirmation Dialog Modal for Deletions */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl space-y-4 z-10 text-left animate-in fade-in zoom-in-95 duration-155">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest">{confirmModal.title}</span>
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-medium">{confirmModal.message}</p>
            
            <div className="flex items-center justify-end gap-3.5 pt-1.5">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4.5 py-2 rounded-lg border border-white/10 text-slate-350 hover:text-white hover:bg-white/5 text-[11px] font-bold tracking-wide uppercase transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }}
                className="px-4.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold tracking-wide uppercase transition-all shadow-md cursor-pointer"
              >
                {confirmModal.confirmLabel || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
