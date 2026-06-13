import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, Shield, FileText, Wrench, Moon, Sun } from 'lucide-react';
import { SiteConfig } from '../types';

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ElementType;
}

export interface FAQSectionProps {
  theme?: string;
  siteConfig?: Partial<SiteConfig>;
  customItems?: FAQItem[];
  title?: string;
  subtitle?: string;
}

export default function FAQSection({ 
  theme = 'dark', 
  siteConfig, 
  customItems, 
  title = 'Frequently Asked Questions', 
  subtitle = 'Browse answers regarding color harmonies, CC0 licenses, data coordinates, and system accessibility.'
}: FAQSectionProps) {
  const accentColor = siteConfig?.primaryNeonAccent || '#00FFD1';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const defaultFaqData: FAQItem[] = [
    {
      id: 'what-is-flatpalette',
      category: 'general',
      question: 'What is flatpalette and how does it speed up design workflows?',
      answer: 'flatpalette is a professional color architecture tool optimized for elite screens, developers, and designers. Unlike heavy or bloated platforms, we replace slow transition sequences with raw inputs, zero-latency micro-interactions, copy states, and direct exports (CSS, JSON, and Tailwind configs) to speed up front-end pipelines.',
      icon: Sparkles
    },
    {
      id: 'are-palettes-really-free',
      category: 'licensing',
      question: 'Are published color systems really free to use under CC0?',
      answer: 'Yes, 100%. Every single palette generated, formatted, or published on flatpalette is released directly into the Public Domain under Creative Commons (CC0 1.0 Universal). You can use these palettes in personal, commercial, or enterprise projects with zero royalties, attribution requirements, or copyright restrictions.',
      icon: FileText
    },
    {
      id: 'how-data-protected',
      category: 'privacy',
      question: 'How is my personal color data and account preference handled?',
      answer: 'flatpalette utilizes an offline-first primacy model. All your locked collections, drafts, and visual bookmarks are processed locally and saved in your device’s LocalStorage coordinates. Our proxy API routes securely handle Gemini titles server-side, protecting your details from trace scripts.',
      icon: Shield
    },
    {
      id: 'accessibility-check',
      category: 'guidelines',
      question: 'What are the basic guidelines for typography and contrast accessibility?',
      answer: 'To pass default WCAG AA levels, body text pairs should maintain relative luminance scores exceeding 4.5:1 against chosen canvas backgrounds. Large headlines or status cards can operate at 3.0:1. We integrate a live contrast ratio computation tool to let you analyze your ratios instantly inside the dashboard viewer.',
      icon: Wrench
    },
    {
      id: 'ai-naming',
      category: 'general',
      question: 'How does the Gemini AI palette namer work?',
      answer: 'Our neural color analysis scans the numeric proportions of your 5-tone hex selections. It securely proxies requests to Gemini models server-side, returning premium names based on design theories, color systems, and psychological moods (e.g., "Muted Cyberpunk", "Nordic Slate") in under a second.',
      icon: Sparkles
    },
    {
      id: 'how-submit-palettes',
      category: 'guidelines',
      question: 'How can I submit my own color structures to the live community feed?',
      answer: 'You can register your own layouts through our "Guidelines" dashboard tab. Simply select your 5 hex values, enter a descriptive title, specify comma-separated style tag credentials, and click "Submit". Our automated system verifies integrity targets to ensure your palette enhances the universal directory layout.',
      icon: FileText
    }
  ];

  const faqData = customItems || defaultFaqData;

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaqs = faqData.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  // Dynamically compute unique categories
  const categories = ['all', ...Array.from(new Set(faqData.map(item => item.category)))];

  return (
    <section className="space-y-6 pt-10 border-t border-white/5" id="faq-interactive-section">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#00FFD1]" style={{ color: accentColor }} />
            <span>{title}</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {subtitle}
          </p>
        </div>

        {/* Filter Badges - Only render filter badges if we have multiple categories */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-1.5" id="faq-category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedId(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all border cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white/10 text-white border-white/20'
                    : theme === 'light'
                    ? 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-950 hover:bg-slate-100'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                }`}
                style={activeCategory === cat ? { borderColor: accentColor, color: accentColor } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Accordion List */}
      <div className="space-y-3" id="faq-accordions-list">
        {filteredFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          const ItemIcon = faq.icon;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? theme === 'light'
                    ? 'border-slate-300 bg-slate-50/50 shadow-sm'
                    : 'border-white/15 bg-white/5 shadow-lg'
                  : theme === 'light'
                  ? 'border-slate-200 hover:border-slate-300 bg-white'
                  : 'border-white/5 hover:border-white/10 bg-[#090d16]/30'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(faq.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-sans cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-3.5 pr-4">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    isExpanded 
                      ? theme === 'light' ? 'bg-slate-200 text-slate-900' : 'bg-white/10 text-[#00FFD1]'
                      : theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'
                  }`}
                  style={isExpanded ? { color: accentColor } : {}}
                  >
                    <ItemIcon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs sm:text-sm font-extrabold tracking-tight transition-colors duration-150 ${
                    isExpanded
                      ? 'text-white'
                      : theme === 'light' ? 'text-slate-800' : 'text-slate-200 hover:text-white'
                  }`}>
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isExpanded ? 'transform rotate-180 text-[#00FFD1]' : ''
                  }`}
                  style={isExpanded ? { color: accentColor } : {}}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isExpanded ? 'max-h-[300px] border-t border-white/5' : 'max-h-0'
                }`}
              >
                <div className={`p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed font-normal ${
                  theme === 'light' ? 'text-slate-600 bg-white' : 'text-slate-300 bg-black/10'
                }`}>
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
