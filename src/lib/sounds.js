function getCtx() {
    return new (window.AudioContext || window.webkitAudioContext)();
  }
  
  function isSfxEnabled() {
    return localStorage.getItem("nudge_sfx") !== "false";
  }
  
  export function playTaskComplete() {
    if (!isSfxEnabled()) return;
    try {
      const ctx   = getCtx();
      const notes = [523.25, 659.25, 783.99];
  
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type            = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch (err) {
      console.warn("Sound playback failed:", err);
    }
  }
  
  export function playStreakMilestone() {
    if (!isSfxEnabled()) return;
    try {
      const ctx   = getCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50];
  
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type            = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t);
        osc.stop(t + 0.6);
      });
  
      const bass     = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bass.connect(bassGain);
      bassGain.connect(ctx.destination);
      bass.type            = "triangle";
      bass.frequency.value = 261.63;
      bassGain.gain.setValueAtTime(0, ctx.currentTime);
      bassGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      bass.start(ctx.currentTime);
      bass.stop(ctx.currentTime + 0.8);
    } catch (err) {
      console.warn("Sound playback failed:", err);
    }
  }