"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

function ConfirmSubmit() {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!armed) {
          event.preventDefault();
          setArmed(true);
          timeoutRef.current = setTimeout(() => setArmed(false), 3000);
        }
      }}
      className={cn(
        "rounded-md border px-3 py-1.5 text-body-sm font-medium transition-all duration-fast ease-out disabled:opacity-50",
        armed
          ? "border-error/40 bg-error/10 text-error"
          : "border-border-subtle text-text-tertiary hover:border-error/30 hover:text-error"
      )}
    >
      {pending ? "Deleting…" : armed ? "Confirm delete" : "Delete"}
    </button>
  );
}

export function DeleteArticleForm({
  id,
  action,
}: {
  id: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit />
    </form>
  );
}
