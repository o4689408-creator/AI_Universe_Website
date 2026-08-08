"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** Forwarded as the button's `name="intent"` value — lets one form offer several submit buttons (e.g. "Save Draft" vs "Publish") that a single Server Action tells apart via formData.get("intent"). */
  intentValue?: string;
}

export function SubmitButton({ children, variant = "primary", className, intentValue }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      name={intentValue ? "intent" : undefined}
      value={intentValue}
      variant={variant}
      isLoading={pending}
      disabled={pending}
      className={cn(className)}
    >
      {children}
    </Button>
  );
}
