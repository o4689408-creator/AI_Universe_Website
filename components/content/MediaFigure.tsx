import Image from "next/image";
import { cn } from "@/lib/utils";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

interface MediaFigureProps {
  src: string;
  alt: string;
  caption?: string;
  /** Breaks out of the reading column to the wider content width — used for major diagrams. */
  fullBleed?: boolean;
  aspectRatio?: string;
  className?: string;
}

export function MediaFigure({
  src,
  alt,
  caption,
  fullBleed = false,
  aspectRatio = "16/9",
  className,
}: MediaFigureProps) {
  return (
    <AnimatedReveal
      className={cn("my-6", fullBleed && "mx-auto w-full max-w-wide md:-mx-[10%]", className)}
    >
      <figure>
        <ImageLightbox src={src} alt={alt}>
          <div
            className="relative w-full overflow-hidden rounded-lg bg-bg-surface-1"
            style={{ aspectRatio }}
          >
            <Image src={src} alt={alt} fill className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]" />
          </div>
        </ImageLightbox>
        {caption && (
          <figcaption className="mt-3 text-body-sm text-text-secondary">
            {caption}
          </figcaption>
        )}
      </figure>
    </AnimatedReveal>
  );
}
