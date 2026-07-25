import Image from "next/image";
import { Container } from "@/components/ui/Container";
import type { Author } from "@/types/content";

interface ArticleHeroProps {
  category: string;
  title: string;
  subtitle: string;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  heroImageUrl: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleHero({
  category,
  title,
  subtitle,
  author,
  publishedAt,
  updatedAt,
  readTimeMinutes,
  heroImageUrl,
}: ArticleHeroProps) {
  const wasUpdated = updatedAt !== publishedAt;

  return (
    <div className="pt-8 md:pt-9">
      <Container>
        <div className="mx-auto max-w-reading">
          <span className="text-label uppercase text-accent">{category}</span>
          <h1 className="mt-4 text-display-2-mobile font-semibold tracking-tight text-text-primary md:text-display-2">
            {title}
          </h1>
          <p className="mt-4 text-body-lg text-text-secondary">{subtitle}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-text-tertiary">
            <span>{author.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            {wasUpdated && (
              <>
                <span aria-hidden="true">·</span>
                <span>Updated {formatDate(updatedAt)}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{readTimeMinutes} min read</span>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-wide">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-bg-surface-1">
            <Image
              src={heroImageUrl}
              alt=""
              fill
              priority
              sizes="(min-width: 1100px) 1100px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
