/**
 * Short, synthesized feedback tones via the Web Audio API — no audio
 * files, no library. A correct-answer chime is two quick ascending
 * sine tones; an incorrect-answer tone is one short, gentle low tone.
 * Deliberately tiny and non-jarring, not a real "sound effect asset."
 *
 * Browsers block audio until a user gesture has occurred on the page;
 * since this only ever fires in response to the user's own click on a
 * quiz answer, that gesture requirement is already satisfied — but
 * this still wraps everything in try/catch and never throws or blocks
 * the quiz if audio fails for any reason (unsupported browser, a
 * blocked AudioContext, etc.).
 */

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) sharedContext = new AudioContextClass();
  return sharedContext;
}

function playTone(frequency: number, startOffset: number, duration: number, volume: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    const startTime = ctx.currentTime + startOffset;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  } catch {
    // Autoplay policy, unsupported browser, or a suspended context —
    // sound is a nice-to-have, never a requirement, so just skip it.
  }
}

export function playCorrectSound(): void {
  playTone(660, 0, 0.12, 0.06);
  playTone(880, 0.09, 0.16, 0.06);
}

export function playIncorrectSound(): void {
  playTone(220, 0, 0.18, 0.045);
}
