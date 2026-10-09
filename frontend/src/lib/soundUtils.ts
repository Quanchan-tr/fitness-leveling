/**
 * Web Audio API Beep Notification for Rest Timer Completion
 * Plays a clean, crisp notification tone (880Hz / 440Hz dual chime)
 * Resilient to browser autoplay policies: silently catches and ignores errors without interrupting workout flow.
 */
export function playRestTimerBeep(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtxClass) return;

    const ctx = new AudioCtxClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Friendly pleasant chime: 880Hz -> 1046.5Hz (A5 to C6)
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);

    osc.onended = () => {
      try {
        ctx.close();
      } catch {
        // ignore
      }
    };
  } catch (error) {
    // Autoplay restrictions or unavailable audio device should never break the workout flow
    console.warn('Audio playback not permitted or unavailable:', error);
  }
}
