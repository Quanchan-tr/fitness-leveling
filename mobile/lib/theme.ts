// Tokens from DESIGN.md. Blue is reserved for CTAs and active states.
export const colors = {
  bg: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#111111',
  muted: '#6B7280',
  primary: '#2563EB',
  primarySoft: '#EFF6FF',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#DC2626',
};

export const formatDuration = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
