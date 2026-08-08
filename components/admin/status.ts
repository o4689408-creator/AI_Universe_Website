import type { ArticleStatus } from "@/types/admin";

type BadgeTone = "success" | "neutral" | "accent" | "warning";

export function statusTone(status: ArticleStatus): BadgeTone {
  switch (status) {
    case "published":
      return "success";
    case "scheduled":
      return "accent";
    case "ready":
      return "warning";
    default:
      return "neutral";
  }
}

export function statusLabel(status: ArticleStatus): string {
  switch (status) {
    case "published":
      return "Published";
    case "scheduled":
      return "Scheduled";
    case "ready":
      return "Ready";
    default:
      return "Draft";
  }
}
