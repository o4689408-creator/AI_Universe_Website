import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="pt-8 md:pt-9">
        <Container>
          <div className="mx-auto max-w-reading flex flex-col gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
          <div className="mx-auto mt-8 max-w-wide">
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          </div>
        </Container>
      </div>

      <Section>
        <Container wide>
          <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 lg:grid-cols-[200px_1fr] lg:gap-12">
            <div className="hidden flex-col gap-3 lg:flex">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="mx-auto flex w-full max-w-reading flex-col gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-11/12" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="mt-4 h-64 w-full rounded-lg" />
              <Skeleton className="mt-4 h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
