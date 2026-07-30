"use client";

import Link from "next/link";
import Image from "next/image";
import { useRipple } from "@/lib/hooks/useRipple";
import { useScaleIntoView } from "@/lib/hooks/useScaleIntoView";

interface VideoThumbnailProps {
  href: string;
  title: string;
  thumbnailUrl: string;
}

export function VideoThumbnail({ href, title, thumbnailUrl }: VideoThumbnailProps) {
  const handleRipple = useRipple();
  const { ref, scale } = useScaleIntoView<HTMLAnchorElement>(0.95);

  return (
    <Link
      ref={ref}
      href={href}
      onPointerDown={handleRipple}
      style={{ transform: `scale(${scale})` }}
      className="group relative block w-64 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-2 shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-base ease-out will-change-transform hover:-translate-y-1 hover:border-accent/30 hover:shadow-glow-accent active:scale-[0.98] md:w-72"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          sizes="288px"
          className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100">
          <PlayIcon />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-body-sm font-medium text-text-primary line-clamp-2">
          {title}
        </h3>
      </div>
    </Link>
  );
}

function PlayIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-transform duration-base ease-out group-hover:scale-110">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="white" />
      </svg>
    </div>
  );
}
