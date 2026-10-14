// Design Tokens extracted from Figma "FitTrack AI - Mobile App Redesign"
export const colors = {
  bg: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  text: '#0F172A', // Slate 900
  textSecondary: '#475569', // Slate 600
  muted: '#64748B', // Slate 500
  subtle: '#94A3B8', // Slate 400
  border: '#E2E8F0', // Slate 200
  borderSubtle: '#F1F5F9', // Slate 100
  
  // Brand Orange Accent (Primary)
  primary: '#FF5722',
  primarySoft: '#FFF7ED', // Orange 50
  primaryBorder: '#FFEDD5', // Orange 100
  primaryText: '#EA580C', // Orange 600
  
  // Emerald / Success
  success: '#10B981',
  successSoft: '#ECFDF5',
  successBorder: '#A7F3D0',
  successText: '#059669',
  successDark: '#065F46',
  successDeep: '#064E3B',

  // Sky / Info
  info: '#0284C7',
  infoSoft: '#F0F9FF',
  infoBorder: '#BAE6FD',

  // Dark palette (for AI camera & active session)
  darkBg: '#0B0F19',
  darkCard: '#141C2E',
  darkSurface: '#1E293B',
  darkBorder: '#334155',

  // Danger
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
};

export const typography = {
  fontFamily: 'Inter',
};

export const formatDuration = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
