"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AnimatedReveal } from "@/components/ui/AnimatedReveal";
import { Button } from "@/components/ui/Button";
import { InterestPicker } from "@/components/discovery/InterestPicker";
import { RecommendationResults } from "@/components/discovery/RecommendationResults";
import { ProfileReveal } from "@/components/discovery/ProfileReveal";
import { interests, recommendTopics, getTopArchetype } from "@/lib/recommendations";
import type { TopicMeta } from "@/types/content";

interface DiscoverySectionProps {
  topics: TopicMeta[];
}

type Phase = "select" | "reveal";

/**
 * "Explore Your AI Journey" — a two-phase quiz:
 *
 * 1. select  — pick a few interests (existing InterestPicker)
 * 2. reveal  — a small moment of anticipation on submit, then an
 *    animated "Your AI Profile" card plus matching recommendations
 *
 * The profile itself isn't decorative copy — getTopArchetype derives it
 * from which selected interest actually has the strongest match in the
 * real content (lib/recommendations.ts), so it stays honest as the
 * article library grows instead of becoming stale flavor text.
 */
export function DiscoverySection({ topics }: DiscoverySectionProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("select");
  const [revealKey, setRevealKey] = useState(0);

  const results = useMemo(
    () => recommendTopics(topics, selectedIds),
    [topics, selectedIds]
  );

  const archetype = useMemo(
    () => getTopArchetype(topics, selectedIds),
    [topics, selectedIds]
  );

  const selectedLabels = useMemo(
    () => interests.filter((interest) => selectedIds.includes(interest.id)).map((i) => i.label),
    [selectedIds]
  );

  function toggleInterest(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function reveal() {
    setRevealKey((key) => key + 1);
    setPhase("reveal");
  }

  function retake() {
    setPhase("select");
  }

  return (
    <Section
      background="surface-1"
      id="explore-your-ai-journey"
      className="relative overflow-hidden"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[340px] w-[600px] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "hsla(42, 65%, 60%, 0.05)" }}
        aria-hidden="true"
      />
      <Container>
        <AnimatedReveal className="mx-auto mb-8 flex max-w-reading flex-col items-center gap-3 text-center">
          <span className="text-label uppercase text-accent">
            Explore Your AI Journey
          </span>
          <h2 className="text-heading-2-mobile font-semibold text-text-primary md:text-heading-1">
            {phase === "select" ? "Tell us what you're curious about." : "Here's your AI Journey."}
          </h2>
          {phase === "select" && (
            <p className="text-body text-text-secondary">
              Select a few interests and we&apos;ll build your AI profile —
              instantly.
            </p>
          )}
        </AnimatedReveal>

        {phase === "select" ? (
          <div key="select" className="animate-fade-up">
            <div className="mx-auto max-w-3xl">
              <InterestPicker
                interests={interests}
                selectedIds={selectedIds}
                onToggle={toggleInterest}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={reveal}
                disabled={selectedIds.length === 0}
                size="lg"
              >
                Reveal My AI Profile
              </Button>
            </div>
          </div>
        ) : (
          <div key={revealKey} className="animate-fade-up">
            {archetype && (
              <div className="mx-auto max-w-xl">
                <ProfileReveal archetype={archetype} selectedLabels={selectedLabels} />
              </div>
            )}

            <div className="mt-10">
              <RecommendationResults results={results} hasSelection />
            </div>

            <div className="mt-8 flex justify-center">
              <Button onClick={retake} variant="ghost">
                Retake the quiz
              </Button>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
