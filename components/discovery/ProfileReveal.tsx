import type { Archetype } from "@/lib/recommendations";

interface ProfileRevealProps {
  archetype: Archetype;
  selectedLabels: string[];
}

export function ProfileReveal({ archetype, selectedLabels }: ProfileRevealProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-bg-surface-1 px-6 py-8 text-center shadow-glow-accent sm:px-10 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(76,125,255,0.12), transparent 60%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <span className="text-label uppercase text-accent">Your AI Profile</span>
        <h3 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
          {archetype.title}
        </h3>
        <p className="max-w-md text-body text-text-secondary">{archetype.description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {selectedLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-border-subtle bg-bg-surface-2 px-3 py-1 text-body-sm text-text-tertiary"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
