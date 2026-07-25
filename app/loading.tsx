import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <Section className="flex min-h-[70vh] items-center">
      <Container>
        <div className="mx-auto flex max-w-reading flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="mt-2 h-6 w-3/5" />
          <Skeleton className="mt-4 h-12 w-40" />
        </div>
      </Container>
    </Section>
  );
}
