// soundUtils.ts — استبدل الملف كله

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  // ✅ resume لو الـ browser عمل suspend (browser autoplay policy)
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

function playSound(type: 'success' | 'error' | 'warning') {
  try {
    const ctx = getAudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
    } else if (type === 'error') {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.2);
    } else {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
    }

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    // ✅ مش بنعمل close — بنستخدم نفس الـ context في كل مرة
  } catch {}
}

export { playSound };