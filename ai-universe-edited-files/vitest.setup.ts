import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom has no real image loading or layout engine, and no Web Audio API.
// next/image renders a real <img> under the hood already — the only
// thing worth stubbing here is Web Audio, which doesn't exist in jsdom
// at all and would otherwise make every quiz test throw the moment an
// answer is selected.
class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  createOscillator() {
    return {
      type: "sine",
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  resume() {
    return Promise.resolve();
  }
}

// @ts-expect-error — jsdom doesn't implement AudioContext at all.
window.AudioContext = MockAudioContext;

// jsdom implements neither matchMedia nor IntersectionObserver, and both
// sit between the quiz and the DOM: usePrefersReducedMotion reads
// matchMedia, AnimatedReveal (the entrance-animation wrapper the quiz
// renders through) observes intersection. Real content rendering never
// depends on either firing a real callback — AnimatedReveal always
// renders its children regardless of visibility state, it only toggles
// a CSS class for the fade-in — so simple no-throw stubs are enough.
window.matchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(), // deprecated API some libraries still call
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
