import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./sections/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "var(--color-bg-base)",
          "surface-1": "var(--color-bg-surface-1)",
          "surface-2": "var(--color-bg-surface-2)",
          "surface-3": "var(--color-bg-surface-3)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          muted: "var(--color-accent-muted)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          DEFAULT: "var(--color-border-default)",
          strong: "var(--color-border-strong)",
        },
        success: "var(--color-success)",
        error: "var(--color-error)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        // [fontSize, { lineHeight, letterSpacing }] — matches the approved type scale
        "display-1": ["96px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-1-mobile": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-2": ["64px", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        "display-2-mobile": ["40px", { lineHeight: "1.12", letterSpacing: "-0.01em" }],
        "heading-1": ["48px", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "heading-1-mobile": ["32px", { lineHeight: "1.15" }],
        "heading-2": ["32px", { lineHeight: "1.22", letterSpacing: "-0.012em" }],
        "heading-2-mobile": ["24px", { lineHeight: "1.28", letterSpacing: "-0.01em" }],
        "heading-3": ["24px", { lineHeight: "1.3", letterSpacing: "-0.008em" }],
        "heading-3-mobile": ["20px", { lineHeight: "1.35" }],
        "heading-4": ["20px", { lineHeight: "1.35", letterSpacing: "-0.006em" }],
        "body-lg": ["20px", { lineHeight: "1.7" }],
        body: ["17px", { lineHeight: "1.75" }],
        "body-sm": ["15px", { lineHeight: "1.6" }],
        label: ["13px", { lineHeight: "1.4", letterSpacing: "0.04em" }],
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        9: "var(--space-9)",
        10: "var(--space-10)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "glow-accent": "var(--shadow-glow-accent)",
      },
      maxWidth: {
        reading: "var(--content-width-reading)",
        wide: "var(--content-width-wide)",
        page: "var(--content-width-page)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "450ms",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "ambient-drift": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(3%, -4%) scale(1.05)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "blur-in-up": {
          "0%": { opacity: "0", filter: "blur(8px)", transform: "translateY(14px)" },
          "100%": { opacity: "1", filter: "blur(0px)", transform: "translateY(0)" },
        },
        "particle-pulse": {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.3)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "60%": { opacity: "1", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(5px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(3px)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "glow-in": {
          "0%": { opacity: "0", boxShadow: "0 0 0 rgba(76,125,255,0)" },
          "100%": { opacity: "1", boxShadow: "var(--shadow-glow-accent)" },
        },
        "fill-width": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        "fade-up": "fade-up 500ms var(--ease-out) forwards",
        "ambient-drift": "ambient-drift 60s var(--ease-in-out) infinite alternate",
        marquee: "marquee 32s linear infinite",
        "blur-in-up": "blur-in-up 700ms var(--ease-out) forwards",
        "particle-pulse": "particle-pulse 4s var(--ease-in-out) infinite",
        "pop-in": "pop-in 500ms var(--ease-out) forwards",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        shake: "shake 450ms var(--ease-out)",
        "shake-alt": "shake 450ms var(--ease-out)",
        "scale-in": "scale-in 350ms var(--ease-out) forwards",
        "glow-in": "glow-in 600ms var(--ease-out) forwards",
        "quiz-auto-advance": "fill-width 3200ms linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
