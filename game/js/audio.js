// All sounds are synthesized with the WebAudio API — no audio files.
// A single shared AudioContext is created lazily on the first user gesture
// (browsers block audio before interaction).

let ctx = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq, startAt, duration, type = "sine", volume = 0.22) {
  const c = ac();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, c.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(volume, c.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startAt + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + startAt);
  osc.stop(c.currentTime + startAt + duration + 0.05);
}

// Pleasant two-note chime when a difference is found.
export function playChime() {
  tone(659.25, 0, 0.35); // E5
  tone(987.77, 0.09, 0.5); // B5
}

// Dull thud when a click misses.
export function playThud() {
  tone(110, 0, 0.22, "sine", 0.3);
  tone(65, 0, 0.28, "triangle", 0.2);
}

// Short blip for buttons.
export function playClick() {
  tone(880, 0, 0.08, "sine", 0.12);
}

// Rising arpeggio for level complete / win.
export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.45));
}

// Soft tick when the timer drops under ten seconds.
export function playTick() {
  tone(1200, 0, 0.05, "square", 0.05);
}
