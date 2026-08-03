import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import Image from "next/image";
import { slugify } from "@/lib/slugify";
import { getVideoById } from "@/lib/videos";
import { MediaFigure } from "@/components/content/MediaFigure";
import { CalloutBox } from "@/components/article/CalloutBox";
import { PullQuote } from "@/components/article/PullQuote";
import { VideoEmbed } from "@/components/article/VideoEmbed";
import { CodeBlock } from "@/components/article/CodeBlock";
import { InlineCode } from "@/components/article/InlineCode";
import { ColorText } from "@/components/article/ColorText";
import { Cite } from "@/components/article/Cite";
import { Underline } from "@/components/article/Underline";
import { Highlight } from "@/components/article/Highlight";
import { StatsGrid, Stat } from "@/components/article/StatsGrid";
import { Timeline, TimelineItem } from "@/components/article/Timeline";
import { FAQSection, FAQItem } from "@/components/article/FAQSection";
import { KeyTakeaways } from "@/components/article/KeyTakeaways";
import { Quiz, QuizOption } from "@/components/article/Quiz";
import { QuickSummary, DidYouKnow, ReaderChallenge, PredictionCard } from "@/components/article/EngagementBoxes";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (
    node &&
    typeof node === "object" &&
    "props" in node &&
    (node as { props?: { children?: ReactNode } }).props?.children
  ) {
    return getText((node as { props: { children: ReactNode } }).props.children);
  }
  return "";
}

/** Builds a heading component for a given level (h1/h4/h5/h6 — h2/h3 have
 * their own dedicated entries below since those are the ones the table
 * of contents actually tracks). Every heading still gets a slug id so
 * any heading can be deep-linked, even ones the TOC doesn't list. */
function makeHeading(Tag: "h1" | "h4" | "h5" | "h6", className: string) {
  return function Heading({ children }: { children?: ReactNode }) {
    const text = getText(children);
    return (
      <Tag id={slugify(text)} className={className}>
        {children}
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponents = {
  h1: makeHeading("h1", "mt-9 text-heading-1-mobile font-semibold text-text-primary md:text-heading-1"),
  h2: ({ children }) => {
    const text = getText(children);
    return (
      <AnimatedReveal variant="reading">
        <h2 id={slugify(text)} className="mt-9 text-heading-2 font-semibold text-text-primary">
          {children}
        </h2>
      </AnimatedReveal>
    );
  },
  h3: ({ children }) => {
    const text = getText(children);
    return (
      <AnimatedReveal variant="reading">
        <h3 id={slugify(text)} className="mt-7 text-heading-3 font-semibold text-text-primary">
          {children}
        </h3>
      </AnimatedReveal>
    );
  },
  h4: makeHeading("h4", "mt-6 text-heading-4 font-semibold text-text-primary"),
  h5: makeHeading("h5", "mt-6 text-body-lg font-semibold text-text-primary"),
  h6: makeHeading("h6", "mt-6 text-label uppercase text-text-tertiary"),

  p: ({ children }) => (
    <AnimatedReveal variant="reading">
      <p className="mt-5 text-body text-text-secondary">{children}</p>
    </AnimatedReveal>
  ),

  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 text-body text-text-secondary marker:text-text-tertiary [&_ul]:mt-2 [&_ol]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 text-body text-text-secondary marker:text-text-tertiary [&_ul]:mt-2 [&_ol]:mt-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,

  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent no-underline hover:underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-text-primary">{children}</em>,
  // Note: raw <u>/<mark> tags typed inline in prose do NOT reliably route
  // through component overrides — remark parses inline lowercase HTML
  // tags as literal HTML passthrough, not as JSX/MDX nodes (verified;
  // this is standard CommonMark behavior, not a bug). Use the
  // capitalized <Underline>/<Highlight> components below instead, which
  // MDX always treats as real components. del below works correctly
  // because remark-gfm's strikethrough (~~text~~) produces a proper
  // AST node rather than raw HTML.
  del: ({ children }) => <del className="text-text-tertiary">{children}</del>,

  hr: () => <hr className="my-9 border-border-subtle" />,

  // Default blockquote (plain quotation) — distinct from the more
  // editorial <PullQuote> component authors reach for deliberately.
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-border pl-5 text-body text-text-secondary [&>p]:mt-0">
      {children}
    </blockquote>
  ),

  table: ({ children }) => (
    <AnimatedReveal className="my-6 w-full overflow-x-auto rounded-lg border border-border-subtle">
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </AnimatedReveal>
  ),
  thead: ({ children }) => (
    <thead className="bg-bg-surface-2 text-left text-text-primary">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-border-subtle">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors duration-fast hover:bg-bg-surface-1">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-label uppercase text-text-tertiary">{children}</th>
  ),
  td: ({ children }) => <td className="px-4 py-3 text-text-secondary">{children}</td>,

  // Fenced code blocks arrive as <pre><code className="language-xxx">.
  // `pre` renders the full premium block (language label, copy button,
  // highlighting); `code` handles the inline case. See CodeBlock.tsx for
  // why overriding both doesn't cause double-rendering.
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  code: InlineCode,

  img: ({ src, alt }) =>
    typeof src === "string" ? (
      <span className="relative my-6 block aspect-video w-full overflow-hidden rounded-lg bg-bg-surface-1">
        <Image src={src} alt={alt ?? ""} fill className="object-cover" />
      </span>
    ) : null,

  Callout: CalloutBox,
  Note: (props: { title?: string; children?: ReactNode }) => (
    <CalloutBox {...props} variant="note" />
  ),
  Tip: (props: { title?: string; children?: ReactNode }) => (
    <CalloutBox {...props} variant="tip" />
  ),
  Warning: (props: { title?: string; children?: ReactNode }) => (
    <CalloutBox {...props} variant="warning" />
  ),
  Info: (props: { title?: string; children?: ReactNode }) => (
    <CalloutBox {...props} variant="info" />
  ),
  PullQuote,
  ColorText,
  Cite,
  Underline,
  Highlight,
  Figure: MediaFigure,
  StatsGrid,
  Stat,
  Timeline,
  TimelineItem,
  FAQSection,
  FAQItem,
  KeyTakeaways,
  Quiz,
  QuizOption,
  QuickSummary,
  DidYouKnow,
  ReaderChallenge,
  PredictionCard,
  // Authors write <VideoEmbed videoId="..." /> in MDX — this resolves
  // the real youtubeId/title/thumbnail from the canonical registry
  // (lib/videos.ts) at compile time, so there's exactly one place a
  // video's real data ever needs to be updated.
  VideoEmbed: ({ videoId, caption }: { videoId: string; caption?: string }) => {
    const video = getVideoById(videoId);
    if (!video) return null;
    return (
      <VideoEmbed
        youtubeId={video.youtubeId}
        title={video.title}
        thumbnailUrl={video.thumbnailUrl}
        caption={caption}
      />
    );
  },
};
