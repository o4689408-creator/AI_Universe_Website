import { cn } from "@/lib/utils";

type AmbientVariant = "topics" | "videos" | "about" | "contact";

interface PageAmbientBackgroundProps {
  variant: AmbientVariant;
}

/**
 * A single soft gradient glow positioned differently per page — enough
 * for each page to feel like it has its own quiet identity without
 * introducing new colors, animation, or a single extra dependency.
 * Deliberately much subtler than the homepage hero's ambient blobs,
 * since this runs behind reading/browsing content, not a hero moment.
 */
export function PageAmbientBackground({ variant }: PageAmbientBackgroundProps) {
  const position: Record<AmbientVariant, string> = {
    topics: "left-1/4 top-0",
    videos: "right-1/4 top-0",
    about: "left-1/3 top-10",
    contact: "right-1/3 top-10",
  };

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute h-[420px] w-[420px] rounded-full bg-accent/[0.06] blur-[110px]",
          position[variant]
        )}
      />
    </div>
  );
}
