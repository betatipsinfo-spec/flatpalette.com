export interface Palette {
  id: string;
  title: string;
  colors: string[]; // 5 Hex strings
  tags: string[];
  likes: number;
  bookmarks?: boolean;
  createdAt: string;
  approved: boolean;
  isStaffPick?: boolean;
  views?: number;
}

export interface Lead {
  id: string;
  email: string;
  type: 'newsletter' | 'feature_request';
  message?: string;
  submittedAt: string;
}

export interface PaletteSubmission {
  id: string;
  title: string;
  colors: string[];
  tags: string[];
  submittedBy: string;
  submittedAt: string;
}

export interface SiteConfig {
  primaryNeonAccent: string; // Hex color for highlights
  homepageCarouselEnabled: boolean;
  siteTitle: string;
  siteDescription: string;
  activeAnnouncement: string;
  facebookUrl?: string;
  instagramUrl?: string;
  pinterestUrl?: string;
  linkedinUrl?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}
