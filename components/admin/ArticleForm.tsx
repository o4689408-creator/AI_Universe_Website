"use client";

import { useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { saveArticleAction, setArticleStatusAction, type ArticleFormState } from "@/lib/admin/actions/article-actions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ArticleEditor } from "@/components/admin/editor/ArticleEditor";
import { ImageUrlField } from "@/components/admin/editor/ImageUrlField";
import { ImageListField } from "@/components/admin/editor/ImageListField";
import { QuizEditorField } from "@/components/admin/editor/QuizEditorField";
import { YouTubePreview } from "@/components/admin/editor/YouTubePreview";
import { PublishPreviewModal } from "@/components/admin/editor/PublishPreviewModal";
import { Badge } from "@/components/admin/Badge";
import { statusTone, statusLabel } from "@/components/admin/status";
import type { LinkableTopic } from "@/components/admin/editor/InternalLinkAssistant";
import type { ArticleImage, QuizQuestionData } from "@/types/content";

export interface ArticleFormValues {
  id?: string;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  heroImageUrl: string;
  featuredImageUrl: string;
  images: ArticleImage[];
  quiz: QuizQuestionData[];
  youtubeUrl: string;
  authorId: string;
  readTimeMinutes: number | "";
  featured: boolean;
  trending: boolean;
  status: "draft" | "ready" | "scheduled" | "published";
  scheduledFor: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterImageUrl: string;
}

const emptyValues: ArticleFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  summary: "",
  category: "",
  tags: [],
  content: "",
  heroImageUrl: "",
  featuredImageUrl: "",
  images: [],
  quiz: [],
  youtubeUrl: "",
  authorId: "founder",
  readTimeMinutes: "",
  featured: false,
  trending: false,
  status: "draft",
  scheduledFor: "",
  seoTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  twitterImageUrl: "",
};

const initialActionState: ArticleFormState = {};

const fieldClasses =
  "w-full rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent";
const labelClasses = "text-body-sm font-medium text-text-secondary";

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClasses}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-label text-text-tertiary">{hint}</p>}
      {error && <p className="text-label text-error">{error}</p>}
    </div>
  );
}

export function ArticleForm({
  initialValues,
  categories,
  tagSuggestions,
  authors,
  existingTopics,
}: {
  initialValues?: Partial<ArticleFormValues>;
  categories: string[];
  tagSuggestions: string[];
  authors: { id: string; name: string }[];
  existingTopics: LinkableTopic[];
}) {
  const values = { ...emptyValues, ...initialValues };
  const isEdit = Boolean(values.id);

  const [state, formAction] = useFormState(saveArticleAction, initialActionState);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [tagsInput, setTagsInput] = useState(values.tags.join(", "));
  const [summary, setSummary] = useState(values.summary);
  const [heroImageUrl, setHeroImageUrl] = useState(values.heroImageUrl);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(values.featuredImageUrl);
  const [images, setImages] = useState<ArticleImage[]>(values.images);
  const [quiz, setQuiz] = useState<QuizQuestionData[]>(values.quiz);
  const [youtubeUrl, setYoutubeUrl] = useState(values.youtubeUrl);
  const [ogImageUrl, setOgImageUrl] = useState(values.ogImageUrl);
  const [twitterImageUrl, setTwitterImageUrl] = useState(values.twitterImageUrl);
  const [seoTitle, setSeoTitle] = useState(values.seoTitle);
  const [metaDescription, setMetaDescription] = useState(values.metaDescription);
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(values.content);
  const [subtitleValue, setSubtitleValue] = useState(values.subtitle);

  const formRef = useRef<HTMLFormElement>(null);

  const derivedSlug = useMemo(() => slugify(title), [title]);
  const displaySlug = slugTouched ? slug : derivedSlug;

  function openPreview() {
    const content = formRef.current?.elements.namedItem("content");
    if (content instanceof HTMLTextAreaElement) setPreviewContent(content.value);
    setPreviewOpen(true);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="id" value={values.id ?? ""} />

      {isEdit && (
        <div>
          <Badge tone={statusTone(values.status)}>{statusLabel(values.status)}</Badge>
        </div>
      )}

      {state.error && (
        <p role="alert" className="rounded-md border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error">
          {state.error}
        </p>
      )}

      <section className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <h2 className="text-body-lg font-semibold text-text-primary">Content</h2>

        <Field label="Title" htmlFor="title" hint="The main headline of the article." error={state.fieldErrors?.title}>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClasses}
            placeholder="How Transformers Actually Work"
          />
        </Field>

        <Field
          label="Slug"
          htmlFor="slug"
          error={state.fieldErrors?.slug}
          hint={`Public URL: /topics/${displaySlug || "your-slug"}`}
        >
          <input
            id="slug"
            name="slug"
            value={displaySlug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className={fieldClasses}
            placeholder="auto-generated-from-title"
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Subtitle" htmlFor="subtitle" hint="One short sentence on what the reader will learn." error={state.fieldErrors?.subtitle}>
            <input
              id="subtitle"
              name="subtitle"
              required
              value={subtitleValue}
              onChange={(e) => setSubtitleValue(e.target.value)}
              className={fieldClasses}
              placeholder="A one-line hook for the hero section"
            />
          </Field>

          <Field label="Category" htmlFor="category" hint="The main AI topic this article belongs to." error={state.fieldErrors?.category}>
            <input
              id="category"
              name="category"
              required
              list="category-suggestions"
              defaultValue={values.category}
              className={fieldClasses}
              placeholder="Frontier AI"
            />
            <datalist id="category-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field
          label="Summary"
          htmlFor="summary"
          error={state.fieldErrors?.summary}
          hint={`${summary.length}/400 — shown on cards and used as the fallback meta description`}
        >
          <textarea
            id="summary"
            name="summary"
            required
            rows={3}
            maxLength={400}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={cn(fieldClasses, "resize-y")}
          />
        </Field>

        <Field label="Tags" htmlFor="tags" hint="Comma-separated keywords readers may search for. Example: AI, LLMs, GPT, Agents">
          <input
            id="tags"
            name="tags"
            list="tag-suggestions"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={fieldClasses}
            placeholder="LLMs, Transformers, Research"
          />
          <datalist id="tag-suggestions">
            {tagSuggestions.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className={labelClasses}>Article body</label>
            <button
              type="button"
              onClick={openPreview}
              className="text-body-sm font-medium text-accent transition-opacity duration-fast hover:opacity-80"
            >
              Preview publish
            </button>
          </div>
          <ArticleEditor id={values.id} initialContent={values.content} existingTopics={existingTopics} />
          {state.fieldErrors?.content && <p className="text-label text-error">{state.fieldErrors.content}</p>}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <h2 className="text-body-lg font-semibold text-text-primary">Media</h2>

        <ImageUrlField
          id="heroImageUrl"
          name="heroImageUrl"
          label="Hero image URL"
          required
          value={heroImageUrl}
          onChange={setHeroImageUrl}
          hint="Shown at the top of the article itself"
          placeholder="https://images.unsplash.com/..."
          error={state.fieldErrors?.heroImageUrl}
        />

        <ImageUrlField
          id="featuredImageUrl"
          name="featuredImageUrl"
          label="Featured image URL"
          value={featuredImageUrl}
          onChange={setFeaturedImageUrl}
          hint="Optional — used on cards and social previews instead of the hero image, when different"
          placeholder="Leave blank to reuse the hero image"
          error={state.fieldErrors?.featuredImageUrl}
        />

        <div className="border-t border-border-subtle pt-5">
          <ImageListField name="images" images={images} onChange={setImages} />
          {state.fieldErrors?.images && <p className="mt-2 text-label text-error">{state.fieldErrors.images}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Field
            label="YouTube URL"
            htmlFor="youtubeUrl"
            error={state.fieldErrors?.youtubeUrl}
            hint="Optional — any youtube.com or youtu.be link"
          >
            <input
              id="youtubeUrl"
              name="youtubeUrl"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className={fieldClasses}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </Field>
          <YouTubePreview url={youtubeUrl} />
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <h2 className="text-body-lg font-semibold text-text-primary">Quiz</h2>
        <QuizEditorField name="quiz" questions={quiz} onChange={setQuiz} />
        {state.fieldErrors?.quiz && <p className="text-label text-error">{state.fieldErrors.quiz}</p>}
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <h2 className="text-body-lg font-semibold text-text-primary">Metadata</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Author" htmlFor="authorId">
            <select id="authorId" name="authorId" defaultValue={values.authorId} className={fieldClasses}>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Reading time (minutes)"
            htmlFor="readTimeMinutes"
            error={state.fieldErrors?.readTimeMinutes}
            hint="Leave blank to auto-calculate from the article body"
          >
            <input
              id="readTimeMinutes"
              name="readTimeMinutes"
              type="number"
              min={1}
              max={999}
              defaultValue={values.readTimeMinutes}
              className={fieldClasses}
              placeholder="Auto"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-body-sm text-text-secondary">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={values.featured}
              className="h-4 w-4 rounded border-border-subtle text-accent focus:ring-accent"
            />
            Featured article
          </label>
          <label className="flex items-center gap-2.5 text-body-sm text-text-secondary">
            <input
              type="checkbox"
              name="trending"
              defaultChecked={values.trending}
              className="h-4 w-4 rounded border-border-subtle text-accent focus:ring-accent"
            />
            Trending
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setShowSeoPanel((v) => !v)}
          className="flex items-center justify-between text-left"
        >
          <div>
            <h2 className="text-body-lg font-semibold text-text-primary">SEO &amp; Social</h2>
            <p className="mt-0.5 text-body-sm text-text-tertiary">
              Optional — every field falls back to the title/subtitle/hero image above when left blank.
            </p>
          </div>
          <span className="text-body-sm font-medium text-accent">{showSeoPanel ? "Hide" : "Show"}</span>
        </button>

        {showSeoPanel && (
          <div className="flex flex-col gap-5 border-t border-border-subtle pt-5">
            <Field
              label="SEO title"
              htmlFor="seoTitle"
              error={state.fieldErrors?.seoTitle}
              hint={`${seoTitle.length}/70 — overrides the page <title>. Falls back to the article title.`}
            >
              <input
                id="seoTitle"
                name="seoTitle"
                maxLength={70}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className={fieldClasses}
              />
            </Field>

            <Field
              label="Meta description"
              htmlFor="metaDescription"
              error={state.fieldErrors?.metaDescription}
              hint={`${metaDescription.length}/160 — falls back to the subtitle.`}
            >
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={2}
                maxLength={160}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={cn(fieldClasses, "resize-y")}
              />
            </Field>

            <Field
              label="Canonical URL"
              htmlFor="canonicalUrl"
              error={state.fieldErrors?.canonicalUrl}
              hint="Only needed if this article is republished from elsewhere"
            >
              <input
                id="canonicalUrl"
                name="canonicalUrl"
                type="url"
                defaultValue={values.canonicalUrl}
                className={fieldClasses}
                placeholder="Falls back to this article's own URL"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="OpenGraph title" htmlFor="ogTitle" hint="Falls back to SEO title / title">
                <input id="ogTitle" name="ogTitle" defaultValue={values.ogTitle} className={fieldClasses} />
              </Field>
              <Field label="OpenGraph description" htmlFor="ogDescription" hint="Falls back to meta description">
                <input
                  id="ogDescription"
                  name="ogDescription"
                  defaultValue={values.ogDescription}
                  className={fieldClasses}
                />
              </Field>
            </div>

            <ImageUrlField
              id="ogImageUrl"
              name="ogImageUrl"
              label="OpenGraph image URL"
              value={ogImageUrl}
              onChange={setOgImageUrl}
              hint="Falls back to the auto-generated branded OG image"
              error={state.fieldErrors?.ogImageUrl}
            />

            <ImageUrlField
              id="twitterImageUrl"
              name="twitterImageUrl"
              label="Twitter card image URL"
              value={twitterImageUrl}
              onChange={setTwitterImageUrl}
              hint="Falls back to the OpenGraph image"
              error={state.fieldErrors?.twitterImageUrl}
            />
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-bg-surface-1/50 p-6 backdrop-blur-md">
        <h2 className="text-body-lg font-semibold text-text-primary">Publish</h2>
        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton intentValue="draft" variant="secondary">
            Save Draft
          </SubmitButton>
          <SubmitButton intentValue="ready" variant="secondary">
            Mark Ready
          </SubmitButton>
          <SubmitButton intentValue="published" variant="primary">
            {values.status === "published" ? "Save & Keep Published" : "Publish Now"}
          </SubmitButton>

          {isEdit && values.status === "published" && (
            <form action={setArticleStatusAction}>
              <input type="hidden" name="id" value={values.id} />
              <input type="hidden" name="status" value="draft" />
              <button
                type="submit"
                className="rounded-md border border-border-subtle px-4 py-2 text-body-sm font-medium text-text-secondary transition-colors duration-fast hover:border-border-strong hover:text-text-primary"
              >
                Unpublish
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-3 border-t border-border-subtle pt-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="scheduledFor" className={labelClasses}>
              Schedule for
            </label>
            <input
              id="scheduledFor"
              name="scheduledFor"
              type="datetime-local"
              defaultValue={values.scheduledFor ? values.scheduledFor.slice(0, 16) : ""}
              className={fieldClasses}
            />
          </div>
          <SubmitButton intentValue="scheduled" variant="secondary">
            Schedule
          </SubmitButton>
          {values.status === "scheduled" && values.scheduledFor && (
            <p className="text-body-sm text-text-tertiary">
              Currently scheduled for {new Date(values.scheduledFor).toLocaleString()}
            </p>
          )}
        </div>
        <p className="text-label text-text-tertiary">
          Scheduled articles go live the next time the site revalidates after that time — see the note in
          lib/admin/articles.ts if you need exact-time publishing via a cron job.
        </p>
      </div>

      <PublishPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        subtitle={subtitleValue}
        heroImageUrl={heroImageUrl}
        content={previewContent}
      />
    </form>
  );
}
