/* ============================================================
   Readily: small synthesized sound effects.
   No audio files; everything is generated with WebAudio so the
   project stays fully self-contained. Muted state persists.
   ============================================================ */

const Sound = (() => {
  const MUTE_KEY = "readily:muted";
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  }

  function isMuted() {
    const saved = localStorage.getItem(MUTE_KEY);
    return saved === "1";
  }

  function setMuted(v) {
    localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  }

  let lastChimeTime = 0;
  function chime(f, gain = 0.045) {
    if (isMuted()) return;
    const now = performance.now();
    if (now - lastChimeTime < 45) return;
    lastChimeTime = now;

    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();

    const t0 = c.currentTime;
    const dur = 0.28;

    const osc1 = c.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(f, t0);

    const osc2 = c.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(f * 2.756, t0);

    const g1 = c.createGain();
    const g2 = c.createGain();

    g1.gain.setValueAtTime(0.0001, t0);
    g1.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g1.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    g2.gain.setValueAtTime(0.0001, t0);
    g2.gain.linearRampToValueAtTime(gain * 0.22, t0 + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.55);

    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, t0);

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(filter);
    g2.connect(filter);
    filter.connect(c.destination);

    osc1.start(t0);
    osc2.start(t0);
    osc1.stop(t0 + dur + 0.05);
    osc2.stop(t0 + dur + 0.05);
  }

  function tone({ f, f2, type = "sine", dur = 0.2, gain = 0.12, attack = 0.01, lp }) {
    if (isMuted()) return;
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();

    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, t0);
    if (f2) osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);

    let last = osc;
    if (lp) {
      const filt = c.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.setValueAtTime(lp, t0);
      osc.connect(filt);
      last = filt;
    }

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    last.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    isMuted,
    setMuted,
    toggle() {
      setMuted(!isMuted());
      return isMuted();
    },
    initAudio() {
      const c = getCtx();
      if (c && c.state === "suspended") c.resume().catch(() => {});
    },
    pageTurn() {
      tone({ f: 900, f2: 300, type: "triangle", dur: 0.18, gain: 0.05, attack: 0.002, lp: 3200 });
    },
    open() {
      tone({ f: 300, f2: 620, type: "sine", dur: 0.3, gain: 0.06, attack: 0.02, lp: 2000 });
    },
    close() {
      tone({ f: 500, f2: 220, type: "sine", dur: 0.22, gain: 0.06, attack: 0.01, lp: 1800 });
    },
    stamp() {
      tone({ f: 180, f2: 90, type: "sine", dur: 0.22, gain: 0.28, attack: 0.002 });
      setTimeout(() => tone({ f: 1400, type: "triangle", dur: 0.12, gain: 0.09, attack: 0.001 }), 90);
    },
    click() {
      tone({ f: 700, type: "sine", dur: 0.06, gain: 0.05, attack: 0.001 });
    },
    bookHover(index = 0) {
      const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      const freq = scale[Math.abs(index) % scale.length];
      chime(freq, 0.045);
    },
    chipHover(index = 0) {
      const scale = [392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 783.99];
      const freq = scale[Math.abs(index) % scale.length];
      chime(freq, 0.035);
    },
    success() {
      tone({ f: 523.25, dur: 0.12, gain: 0.08, attack: 0.008, lp: 2600 });
      setTimeout(() => tone({ f: 659.25, dur: 0.22, gain: 0.09, attack: 0.008, lp: 2600 }), 90);
    }
  };
})();

if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => {
    try {
      if (typeof Sound !== "undefined" && Sound.initAudio) {
        Sound.initAudio();
      }
    } catch (_) {}
  }, { passive: true, once: true });
}
