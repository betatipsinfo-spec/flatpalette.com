import { Palette, SiteConfig, Lead } from './types';

export const INITIAL_PALETTES: Palette[] = [
  {
    id: 'p1',
    title: 'Tokyo Midnight',
    colors: ['#0d0e15', '#241244', '#f10b7f', '#00FFD1', '#fbfbfb'],
    tags: ['Cyberpunk', 'Neon', 'Vibrant', 'Dark'],
    likes: 1242,
    bookmarks: false,
    createdAt: '2026-05-15',
    approved: true,
    isStaffPick: true,
    views: 4892
  },
  {
    id: 'p2',
    title: 'Sunset Cyber',
    colors: ['#140226', '#4e1261', '#92106d', '#ff5a00', '#ffc600'],
    tags: ['Neon', 'Vibrant', 'Retro'],
    likes: 954,
    bookmarks: false,
    createdAt: '2026-05-18',
    approved: true,
    isStaffPick: true,
    views: 3105
  },
  {
    id: 'p3',
    title: 'Pastel Matcha',
    colors: ['#f4f9f4', '#d6ebd9', '#a2d2a9', '#6eaf7a', '#3f7c4e'],
    tags: ['Pastel', 'Minimal', 'Nature', 'Vintage'],
    likes: 812,
    bookmarks: false,
    createdAt: '2026-05-20',
    approved: true,
    isStaffPick: false,
    views: 2011
  },
  {
    id: 'p4',
    title: 'Retro Arcade',
    colors: ['#050810', '#182bfd', '#f52233', '#ffd700', '#00ffd0'],
    tags: ['Cyberpunk', 'Retro', 'Vibrant'],
    likes: 1104,
    bookmarks: false,
    createdAt: '2026-05-21',
    approved: true,
    isStaffPick: false,
    views: 4500
  },
  {
    id: 'p5',
    title: 'Bubblegum Wave',
    colors: ['#fbebf2', '#f69ec4', '#ea5d9f', '#ff00aa', '#1a0033'],
    tags: ['Vibrant', 'Pastel', 'Playful'],
    likes: 673,
    bookmarks: false,
    createdAt: '2026-05-22',
    approved: true,
    isStaffPick: true,
    views: 1820
  },
  {
    id: 'p6',
    title: 'Nordic Forest',
    colors: ['#2e403d', '#1d2d2a', '#6f8b80', '#c8d4cd', '#f0f5f2'],
    tags: ['Minimal', 'Nature', 'Muted'],
    likes: 541,
    bookmarks: false,
    createdAt: '2026-05-23',
    approved: true,
    isStaffPick: false,
    views: 1402
  },
  {
    id: 'p7',
    title: 'Artisanal Espresso',
    colors: ['#24140e', '#3a2010', '#634735', '#b68e71', '#f0e6df'],
    tags: ['Minimal', 'Vintage', 'Muted', 'Warm'],
    likes: 729,
    bookmarks: false,
    createdAt: '2026-05-24',
    approved: true,
    isStaffPick: true,
    views: 2901
  },
  {
    id: 'p8',
    title: 'Teal Mirage',
    colors: ['#072227', '#35858b', '#4fbdba', '#aefdec', '#f4feff'],
    tags: ['Vibrant', 'Aqua', 'Modern'],
    likes: 492,
    bookmarks: false,
    createdAt: '2026-05-25',
    approved: true,
    isStaffPick: false,
    views: 1118
  },
  {
    id: 'p9',
    title: 'Lava Ignite',
    colors: ['#1e0000', '#741108', '#c4280a', '#fd7111', '#fedf12'],
    tags: ['Vibrant', 'Neon', 'Warm'],
    likes: 830,
    bookmarks: false,
    createdAt: '2026-05-26',
    approved: true,
    isStaffPick: false,
    views: 1980
  },
  {
    id: 'p10',
    title: 'Electric Meadow',
    colors: ['#0d2105', '#245a11', '#17a224', '#7fff00', '#ebff80'],
    tags: ['Vibrant', 'Green', 'Nature'],
    likes: 510,
    bookmarks: false,
    createdAt: '2026-05-26',
    approved: true,
    isStaffPick: false,
    views: 1040
  },
  {
    id: 'p11',
    title: 'Imperial Royalty',
    colors: ['#080210', '#2e0a4e', '#591696', '#9c2efe', '#ffd700'],
    tags: ['Vibrant', 'Luxury', 'Dark'],
    likes: 622,
    bookmarks: false,
    createdAt: '2026-05-27',
    approved: true,
    isStaffPick: true,
    views: 1845
  },
  {
    id: 'p12',
    title: 'Desert Sage',
    colors: ['#4d4c38', '#868367', '#c2bca0', '#e9e4d5', '#f5f4f0'],
    tags: ['Muted', 'Minimal', 'Vintage', 'Pastel'],
    likes: 389,
    bookmarks: false,
    createdAt: '2026-05-27',
    approved: true,
    isStaffPick: false,
    views: 890
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'l1',
    email: 'designer.pro@example.com',
    type: 'newsletter',
    submittedAt: '2026-05-20T10:30:00Z'
  },
  {
    id: 'l2',
    email: 'dev_guy@example.com',
    type: 'feature_request',
    message: 'Could you support exporting directly to Figma Tokens Format?',
    submittedAt: '2026-05-22T08:15:00Z'
  },
  {
    id: 'l3',
    email: 'brand.director@lux.io',
    type: 'newsletter',
    submittedAt: '2026-05-26T14:40:00Z'
  }
];

export const INITIAL_SITE_CONFIG: SiteConfig = {
  primaryNeonAccent: '#00FFD1', // Vivid cyan glow
  homepageCarouselEnabled: true,
  siteTitle: 'flatpalette',
  siteDescription: 'Color Architecture at Supercharged Speeds for Modern Designs.',
  activeAnnouncement: '⚡ NEW: Spring Glow update with extended CSS variables export is now live!',
  facebookUrl: 'https://facebook.com/flatpalette',
  instagramUrl: 'https://instagram.com/flatpalette',
  pinterestUrl: 'https://pinterest.com/flatpalette',
  linkedinUrl: 'https://linkedin.com/company/flatpalette'
};

/**
 * Advanced Search Indexer Mapping:
 * An index mapping common search keyword categories or natural color names to help search filters.
 */
export const COLOR_NOMECLATURE_MAP: { [key: string]: string[] } = {
  blue: ['#00FFD1', '#182bfd', '#35858b', '#4fbdba', '#aefdec', '#f4feff'],
  pink: ['#f10b7f', '#fbebf2', '#f69ec4', '#ea5d9f', '#ff00aa'],
  red: ['#f10b7f', '#f52233', '#1e0000', '#741108', '#c4280a'],
  yellow: ['#ffc600', '#ffd700', '#fedf12'],
  orange: ['#ff5a00', '#fd7111'],
  purple: ['#241244', '#4e1261', '#92106d', '#1a0033', '#2e0a4e', '#591696', '#9c2efe'],
  green: ['#a2d2a9', '#6eaf7a', '#3f7c4e', '#0d2105', '#245a11', '#17a224', '#7fff00', '#ebff80', '#2e403d', '#1d2d2a', '#6f8b80', '#c8d4cd'],
  dark: ['#0d0e15', '#241244', '#140226', '#050810', '#1a0033', '#24140e', '#072227', '#1e0000', '#0d2105', '#080210'],
  light: ['#fbfbfb', '#f4f9f4', '#d6ebd9', '#fbebf2', '#f0f5f2', '#f0e6df', '#f4feff', '#f5f4f0', '#e9e4d5', '#ebff80'],
  brown: ['#24140e', '#3a2010', '#634735', '#b68e71', '#f0e6df'],
};
