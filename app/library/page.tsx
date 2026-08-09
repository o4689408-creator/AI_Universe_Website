import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { LibraryContent } from "@/components/engagement/LibraryContent";
import { getAllTopics } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Your Library",
  description: "Your saved articles and recently viewed reading history.",
  path: "/library",
  noIndex: true,
});

// This page was never a real candidate for static generation — its
// entire content is a lookup against bookmarks/history stored on the
// visitor's own device (see LibraryContent), so there's nothing
// meaningful to pre-build; every visitor needs their own live render
// anyway. Marking it dynamic moves its getAllTopics() call (which
// includes a MongoDB query for CMS-authored articles) to real request
// time on a live server, instead of Vercel's build step — the same
// underlying issue, and the same fix, as app/topics/[slug]/page.tsx's
// generateStaticParams change; see that file for the full
// explanation. Confirmed necessary by reproducing the failure: with
// MongoDB deliberately unreachable, the build failed here immediately
// after the /topics/[slug] fix was applied.
export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const topics = await getAllTopics();

  return (
    <Section className="pt-9">
      <Container>
        <div className="mb-8 flex flex-col gap-2">
          <span className="text-label uppercase text-accent">Your Library</span>
          <h1 className="text-heading-1-mobile font-semibold text-text-primary md:text-heading-1">
            Saved for later.
          </h1>
          <p className="text-body text-text-secondary">
            Stored on this device only — no account needed.
          </p>
        </div>

        <LibraryContent topics={topics} />
      </Container>
    </Section>
  );
}
