"use client";

import Link from "next/link";
import Image from "next/image";
import { useRipple } from "@/lib/hooks/useRipple";

interface VideoThumbnailProps {
  href: string;
  title: string;
  thumbnailUrl: string;
}

export function VideoThumbnail({ href, title, thumbnailUrl }: VideoThumbnailProps) {
  const handleRipple = useRipple();

  return (
    <Link
      href={href}
      onPointerDown={handleRipple}
      className="group relative block w-64 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-surface-2 transition-all duration-base ease-out hover:-translate-y-1 hover:border-border hover:shadow-md active:scale-[0.98] md:w-72"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          sizes="288px"
          className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-base ease-out group-hover:opacity-100">
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
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 2.5L13 8L4 13.5V2.5Z" fill="white" />
      </svg>
    </div>
  );
}
