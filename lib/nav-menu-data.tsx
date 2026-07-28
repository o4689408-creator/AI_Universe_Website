import type { ReactNode } from "react";
import { YOUTUBE_CHANNEL_URL } from "@/lib/config";

export interface MegaMenuLink {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  icon: ReactNode;
}

export interface MegaMenuColumn {
  heading: string;
  links: MegaMenuLink[];
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 7 8 2.5 13.5 7v6.2a.5.5 0 0 1-.5.5H9.5V10h-3v3.7H3a.5.5 0 0 1-.5-.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.2 5.8 8.8 8.8 5.8 10.2 7.2 7.2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 4.5 8 9l5.5-4.5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5h8a.5.5 0 0 1 .5.5v10.3a.3.3 0 0 1-.46.25L8 10.8l-4.04 2.75a.3.3 0 0 1-.46-.25V3a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.7 5.8 10.2 8 6.7 10.2Z" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M14.5 4.8a2 2 0 0 0-1.4-1.4C11.9 3 8 3 8 3s-3.9 0-5.1.4A2 2 0 0 0 1.5 4.8 20 20 0 0 0 1 8a20 20 0 0 0 .5 3.2 2 2 0 0 0 1.4 1.4C4.1 13 8 13 8 13s3.9 0 5.1-.4a2 2 0 0 0 1.4-1.4A20 20 0 0 0 15 8a20 20 0 0 0-.5-3.2ZM6.5 10.3V5.7L10.5 8Z" />
    </svg>
  );
}

function SearchGlyphIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11 11 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 7.3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

export const homeMenu: MegaMenuColumn[] = [
  {
    heading: "Quick links",
    links: [
      { title: "Homepage", description: "Understand AI, deeply — start here", href: "/", icon: <HomeIcon /> },
      { title: "Explore Your AI Journey", description: "Get personalized recommendations", href: "/#explore-your-ai-journey", icon: <CompassIcon /> },
      { title: "Newsletter", description: "Get new deep-dives first", href: "/#newsletter", icon: <MailIcon /> },
    ],
  },
];

export const topicsMenu: MegaMenuColumn[] = [
  {
    heading: "Browse",
    links: [
      { title: "All Topics", description: "Every deep-dive, browsable and searchable", href: "/topics", icon: <GridIcon /> },
      { title: "Your Library", description: "Saved articles & reading history", href: "/library", icon: <BookmarkIcon /> },
    ],
  },
];

export const videosMenu: MegaMenuColumn[] = [
  {
    heading: "Watch",
    links: [
      { title: "All Videos", description: "Every companion breakdown", href: "/videos", icon: <PlayCircleIcon /> },
      { title: "Subscribe on YouTube", description: "Catch new videos first", href: YOUTUBE_CHANNEL_URL, external: true, icon: <YouTubeIcon /> },
    ],
  },
];

export const searchMenu: MegaMenuColumn[] = [
  {
    heading: "Search",
    links: [
      { title: "Quick Search", description: "Find any article instantly \u2014 press \u2318K anytime", icon: <SearchGlyphIcon /> },
      { title: "Browse All Topics", description: "Or browse everything at once", href: "/topics", icon: <GridIcon /> },
    ],
  },
];

export const exploreMenu: MegaMenuColumn[] = [
  {
    heading: "Discover",
    links: [
      { title: "Explore Your AI Journey", description: "Select your interests, get matched instantly", href: "/#explore-your-ai-journey", icon: <CompassIcon /> },
      { title: "Your Library", description: "Saved articles & continue reading", href: "/library", icon: <BookmarkIcon /> },
    ],
  },
];

export const aboutMenu: MegaMenuColumn[] = [
  {
    heading: "AI Universe",
    links: [
      { title: "About AI Universe", description: "Our mission and story", href: "/about", icon: <InfoIcon /> },
      { title: "Contact", description: "Get in touch with the team", href: "/contact", icon: <MailIcon /> },
    ],
  },
];
