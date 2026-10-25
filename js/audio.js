/**
 * Trait Quest - Web Audio Synthesizer
 * Generates cheerful, friendly sound effects 100% offline with zero external audio assets.
 */

window.TraitQuestAudio = (() => {
  let ctx = null;
  let muted = false;

  function init() {
    if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function setMuted(val) {
    muted = Boolean(val);
  }

  function isMuted() {
    return muted;
  }

  function playTone(freq, type = 'sine', duration = 0.15, delay = 0, gainVal = 0.12) {
    if (muted) return;
    try {
      init();
      if (!ctx) return;
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {
      // Ignore audio errors if user hasn't interacted yet
    }
  }

  function playClick() {
    playTone(520, 'triangle', 0.07, 0, 0.08);
  }

  function playPop() {
    playTone(440, 'sine', 0.08, 0, 0.1);
    playTone(660, 'sine', 0.1, 0.05, 0.1);
  }

  function playCollect() {
    playTone(523.25, 'triangle', 0.12, 0, 0.12);    // C5
    playTone(659.25, 'triangle', 0.12, 0.09, 0.12); // E5
    playTone(783.99, 'triangle', 0.14, 0.18, 0.12); // G5
    playTone(1046.5, 'sine', 0.28, 0.27, 0.14);     // C6
  }

  function playBreed() {
    const notes = [392, 493.88, 587.33, 783.99, 987.77, 1174.66];
    notes.forEach((n, idx) => {
      playTone(n, 'sine', 0.16, idx * 0.07, 0.1);
    });
  }

  function playCorrect() {
    playTone(587.33, 'triangle', 0.1, 0, 0.11);
    playTone(880, 'triangle', 0.2, 0.09, 0.12);
  }

  function playWrong() {
    playTone(260, 'sawtooth', 0.14, 0, 0.07);
    playTone(210, 'sawtooth', 0.2, 0.12, 0.07);
  }

  function playUnlock() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    chord.forEach((f, i) => {
      playTone(f, 'triangle', 0.35, i * 0.08, 0.13);
    });
  }

  return {
    playClick,
    playPop,
    playCollect,
    playBreed,
    playCorrect,
    playWrong,
    playUnlock,
    setMuted,
    isMuted
  };
})();
