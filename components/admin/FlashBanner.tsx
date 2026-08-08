export function FlashBanner({ success, error }: { success?: string; error?: string }) {
  if (!success && !error) return null;

  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-md border px-4 py-3 text-body-sm ${
        error ? "border-error/30 bg-error/10 text-error" : "border-success/30 bg-success/10 text-success"
      }`}
    >
      {error ?? success}
    </p>
  );
}
