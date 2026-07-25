"use client";

import { useEffect, useRef } from "react";

interface Particle {
  /** 0 = far, 1 = near — drives size, opacity, and parallax strength. */
  depth: number;
  /** Resting position in CSS pixels, before drift/parallax/mouse offset. */
  baseX: number;
  baseY: number;
  /** Slow drift velocity, px/second. */
  vx: number;
  vy: number;
  radius: number;
  /** Per-particle phase offset so the twinkle/glow pulse isn't synchronized. */
  twinklePhase: number;
  /** Short trailing history for the subtle light-trail effect (near-layer particles only). */
  trail: { x: number; y: number }[];
}

interface Shape {
  depth: number;
  x: number;
  y: number;
  radius: number;
  sides: 3 | 6;
  rotation: number;
  rotationSpeed: number;
}

const ACCENT_HUE = 226; // matches --color-accent (#4C7DFF)

/**
 * An abstract, AI-inspired animated background: depth-layered glowing
 * particles connected by faint constellation lines, a few large slowly
 * rotating geometric outlines, and a softly drifting ambient light
 * wash — all Canvas 2D, no WebGL/3D library. See HeroSection.tsx for
 * the full rationale.
 *
 * Renders nothing (returns null) when the visitor prefers reduced
 * motion — HeroAmbientBackground's static/CSS layer underneath already
 * covers that case, so there's a real fallback, not just an empty gap.
 */
export function HeroSceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth < 768;
    const simplified = isCoarsePointer || isSmallScreen;

    const PARTICLE_COUNT = simplified ? 16 : 45;
    const SHAPE_COUNT = simplified ? 2 : 4;
    const CONNECTION_DISTANCE = simplified ? 90 : 130;
    const MAX_DPR = 2;

    // --- Pre-rendered glow sprite ---------------------------------
    // Drawing a radial gradient (or worse, shadowBlur) per particle
    // per frame is expensive. Instead, render one soft glow once onto
    // a small offscreen canvas and drawImage() it per particle per
    // frame — the standard technique for cheap "glowing point" effects.
    const glowSprite = document.createElement("canvas");
    const glowSize = 64;
    glowSprite.width = glowSize;
    glowSprite.height = glowSize;
    const glowCtx = glowSprite.getContext("2d");
    if (glowCtx) {
      const gradient = glowCtx.createRadialGradient(
        glowSize / 2,
        glowSize / 2,
        0,
        glowSize / 2,
        glowSize / 2,
        glowSize / 2
      );
      gradient.addColorStop(0, `hsla(${ACCENT_HUE}, 100%, 78%, 0.9)`);
      gradient.addColorStop(0.4, `hsla(${ACCENT_HUE}, 100%, 68%, 0.35)`);
      gradient.addColorStop(1, `hsla(${ACCENT_HUE}, 100%, 68%, 0)`);
      glowCtx.fillStyle = gradient;
      glowCtx.fillRect(0, 0, glowSize, glowSize);
    }

    // --- Scene setup ------------------------------------------------
    let width = 0;
    let height = 0;
    let dpr = 1;

    const particles: Particle[] = [];
    const shapes: Shape[] = [];

    function seedScene() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const depth = Math.random();
        particles.push({
          depth,
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          vx: (Math.random() - 0.5) * (4 + depth * 8),
          vy: (Math.random() - 0.5) * (4 + depth * 8),
          radius: 1 + depth * 2.2,
          twinklePhase: Math.random() * Math.PI * 2,
          trail: [],
        });
      }

      shapes.length = 0;
      for (let i = 0; i < SHAPE_COUNT; i++) {
        shapes.push({
          depth: Math.random() * 0.6,
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 60 + Math.random() * 90,
          sides: Math.random() > 0.5 ? 6 : 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        });
      }
    }

    function resize() {
      width = container!.clientWidth;
      height = container!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedScene();
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // --- Mouse + scroll parallax input (RAF-batched) ----------------
    // Mousemove/scroll can fire far more often than the display can
    // paint; the raw values are stored and only ever read inside the
    // render loop below (which already runs at most once per frame),
    // rather than triggering any work directly in the event handlers.
    const pointer = { x: 0, y: 0, active: false };
    let scrollOffset = 0;

    function handlePointerMove(event: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / width - 0.5;
      pointer.y = (event.clientY - rect.top) / height - 0.5;
      pointer.active = true;
    }

    function handleScroll() {
      scrollOffset = window.scrollY;
    }

    if (!simplified) {
      window.addEventListener("mousemove", handlePointerMove, { passive: true });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    // --- Pause when offscreen, tab hidden, or light theme is active --
    // The particle/glow colors here are tuned specifically for the
    // dark background; rather than maintaining a second color scheme
    // for a decorative effect, this scene simply doesn't run in light
    // theme — HeroAmbientBackground's CSS-variable-driven gradient
    // blobs (which already adapt automatically) remain as the light-
    // theme hero background.
    let running = document.documentElement.getAttribute("data-theme") !== "light";
    let rafId = 0;

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        running = (entries[0]?.isIntersecting ?? true) && !isLight;
        if (running && !rafId) {
          rafId = requestAnimationFrame(render);
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    function handleVisibilityChange() {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      running = document.visibilityState === "visible" && !isLight;
      if (running && !rafId) {
        rafId = requestAnimationFrame(render);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const themeObserver = new MutationObserver(() => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      running = !isLight && document.visibilityState === "visible";
      if (isLight) {
        ctx!.clearRect(0, 0, width, height);
      } else if (!rafId) {
        rafId = requestAnimationFrame(render);
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // --- Render loop --------------------------------------------------
    let lastTime = performance.now();
    let ambientAngle = 0;

    function render(now: number) {
      if (!running) {
        rafId = 0;
        return;
      }

      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ambientAngle += deltaSeconds * 0.05;

      ctx!.clearRect(0, 0, width, height);

      // Soft ambient light wash — a large radial gradient whose center
      // drifts slowly and whose hue shifts within a narrow, subtle
      // range (never a rainbow cycle, just a gentle living quality).
      const ambientX = width * (0.5 + Math.sin(ambientAngle) * 0.15);
      const ambientY = height * (0.4 + Math.cos(ambientAngle * 0.8) * 0.12);
      const hue = ACCENT_HUE + Math.sin(ambientAngle * 0.3) * 6;
      const ambientGradient = ctx!.createRadialGradient(
        ambientX,
        ambientY,
        0,
        ambientX,
        ambientY,
        Math.max(width, height) * 0.6
      );
      ambientGradient.addColorStop(0, `hsla(${hue}, 90%, 60%, 0.05)`);
      ambientGradient.addColorStop(1, "hsla(0, 0%, 0%, 0)");
      ctx!.fillStyle = ambientGradient;
      ctx!.fillRect(0, 0, width, height);

      // Floating geometric shapes — large, thin, very low opacity.
      for (const shape of shapes) {
        shape.rotation += shape.rotationSpeed * deltaSeconds;
        const parallaxX = pointer.active ? pointer.x * 14 * shape.depth : 0;
        const parallaxY = pointer.active ? pointer.y * 14 * shape.depth : 0;
        const scrollParallax = scrollOffset * 0.02 * shape.depth;

        ctx!.save();
        ctx!.translate(
          shape.x + parallaxX,
          shape.y + parallaxY - scrollParallax
        );
        ctx!.rotate(shape.rotation);
        ctx!.beginPath();
        for (let i = 0; i < shape.sides; i++) {
          const angle = (i / shape.sides) * Math.PI * 2;
          const px = Math.cos(angle) * shape.radius;
          const py = Math.sin(angle) * shape.radius;
          if (i === 0) ctx!.moveTo(px, py);
          else ctx!.lineTo(px, py);
        }
        ctx!.closePath();
        ctx!.strokeStyle = `hsla(${ACCENT_HUE}, 80%, 70%, 0.06)`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
        ctx!.restore();
      }

      // Update + position particles.
      const rendered: { x: number; y: number; particle: Particle }[] = [];

      for (const particle of particles) {
        particle.baseX += particle.vx * deltaSeconds;
        particle.baseY += particle.vy * deltaSeconds;

        // Wrap around edges so the field feels continuous/seamless.
        if (particle.baseX < -20) particle.baseX = width + 20;
        if (particle.baseX > width + 20) particle.baseX = -20;
        if (particle.baseY < -20) particle.baseY = height + 20;
        if (particle.baseY > height + 20) particle.baseY = -20;

        const parallaxX = pointer.active ? pointer.x * 30 * particle.depth : 0;
        const parallaxY = pointer.active ? pointer.y * 30 * particle.depth : 0;
        const scrollParallax = scrollOffset * 0.04 * particle.depth;

        const x = particle.baseX + parallaxX;
        const y = particle.baseY + parallaxY - scrollParallax;

        // Near-layer particles get a short fading light trail.
        if (particle.depth > 0.6) {
          particle.trail.push({ x, y });
          if (particle.trail.length > 6) particle.trail.shift();
        }

        rendered.push({ x, y, particle });
      }

      // Constellation connections — near/mid layers only, skipped
      // entirely on the simplified (mobile) pass to keep it cheap and
      // uncluttered on small screens.
      if (!simplified) {
        ctx!.lineWidth = 1;
        for (let i = 0; i < rendered.length; i++) {
          const a = rendered[i]!;
          if (a.particle.depth < 0.35) continue;
          for (let j = i + 1; j < rendered.length; j++) {
            const b = rendered[j]!;
            if (b.particle.depth < 0.35) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < CONNECTION_DISTANCE) {
              const alpha = (1 - distance / CONNECTION_DISTANCE) * 0.12;
              ctx!.strokeStyle = `hsla(${ACCENT_HUE}, 90%, 75%, ${alpha})`;
              ctx!.beginPath();
              ctx!.moveTo(a.x, a.y);
              ctx!.lineTo(b.x, b.y);
              ctx!.stroke();
            }
          }
        }
      }

      // Trails (drawn before nodes so glow sits on top).
      for (const { particle } of rendered) {
        if (particle.trail.length < 2) continue;
        ctx!.beginPath();
        for (let i = 0; i < particle.trail.length; i++) {
          const point = particle.trail[i]!;
          if (i === 0) ctx!.moveTo(point.x, point.y);
          else ctx!.lineTo(point.x, point.y);
        }
        ctx!.strokeStyle = `hsla(${ACCENT_HUE}, 100%, 78%, 0.08)`;
        ctx!.lineWidth = particle.radius * 0.6;
        ctx!.stroke();
      }

      // Glowing nodes — drawImage of the pre-rendered sprite, cheap.
      for (const { x, y, particle } of rendered) {
        const twinkle =
          0.75 + Math.sin(now * 0.001 + particle.twinklePhase) * 0.25;
        const baseOpacity = 0.25 + particle.depth * 0.55;
        const size = particle.radius * (6 + particle.depth * 6);

        ctx!.globalAlpha = baseOpacity * twinkle;
        ctx!.drawImage(glowSprite, x - size / 2, y - size / 2, size, size);
      }
      ctx!.globalAlpha = 1;

      rafId = requestAnimationFrame(render);
    }

    if (running) {
      rafId = requestAnimationFrame(render);
    }

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="pointer-events-none block" />
    </div>
  );
}
