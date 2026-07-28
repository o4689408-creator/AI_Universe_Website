"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: "#0A0A0C",
          color: "#F2F2F0",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center", padding: 24 }}>
          <p style={{ fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", color: "#F87171" }}>
            Critical Error
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600, marginTop: 16 }}>
            AI Universe hit a snag.
          </h1>
          <p style={{ color: "#A8A8AE", marginTop: 12 }}>
            Please try reloading the page.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              backgroundColor: "#4C7DFF",
              color: "#0A0A0C",
              border: "none",
              borderRadius: 12,
              padding: "12px 20px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
