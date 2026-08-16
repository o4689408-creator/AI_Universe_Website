"use client";

import { useState } from "react";
import { checkUrlAction } from "@/lib/admin/actions/preview-actions";
import { cn } from "@/lib/utils";

export function ImageUrlField({
  id,
  name,
  label,
  value,
  onChange,
  required,
  placeholder,
  hint,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
}) {
  const [imgState, setImgState] = useState<"idle" | "loaded" | "error">("idle");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<"ok" | "not-image" | "broken" | "blocked" | "timeout" | null>(null);

  async function validate() {
    if (!value.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await checkUrlAction(value.trim());
      if (result.status === "ok" && result.isImage === false) setCheckResult("not-image");
      else setCheckResult(result.status);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-body-sm font-medium text-text-secondary">
          {label}
        </label>
        {value.trim() && (
          <button
            type="button"
            onClick={validate}
            disabled={checking}
            className="text-label font-medium text-accent transition-opacity duration-fast hover:opacity-80 disabled:opacity-50"
          >
            {checking ? "Checking…" : "Validate"}
          </button>
        )}
      </div>

      <input
        id={id}
        name={name}
        type="url"
        required={required}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setImgState("idle");
          setCheckResult(null);
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-border-subtle bg-bg-surface-1 px-3.5 py-2.5 text-body text-text-primary outline-none transition-colors duration-fast placeholder:text-text-tertiary focus:border-accent"
      />

      {value.trim() && (
        <div className="flex items-center gap-3">
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-bg-surface-2">
            {/* Deliberately a plain <img>, not next/image — this is a live preview of an arbitrary admin-pasted URL that may or may not even resolve yet as they type, and next/image's optimizer adds overhead/friction that a raw preview doesn't need. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className="h-full w-full object-cover"
              onLoad={() => setImgState("loaded")}
              onError={() => setImgState("error")}
            />
          </div>
          <div className="text-label text-text-tertiary">
            {imgState === "error" && <span className="text-error">Image failed to load in-browser.</span>}
            {imgState === "loaded" && <span className="text-success">Loads correctly.</span>}
            {checkResult === "ok" && <p className="text-success">Confirmed a real image URL.</p>}
            {checkResult === "not-image" && <p className="text-warning">URL responds but isn&apos;t an image.</p>}
            {checkResult === "broken" && (
              <p className="text-error">The server responded with an error for this URL.</p>
            )}
            {checkResult === "timeout" && (
              <p className="text-warning">
                No response within 6 seconds — it may still work. The preview above (a real browser image load) is
                the more reliable signal than this check.
              </p>
            )}
            {checkResult === "blocked" && (
              <p className="text-error">That address isn&apos;t allowed (private/local, or an unsupported protocol).</p>
            )}
          </div>
        </div>
      )}

      {hint && !error && <p className="text-label text-text-tertiary">{hint}</p>}
      {error && <p className={cn("text-label text-error")}>{error}</p>}
    </div>
  );
}
