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
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "sans-serif",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f87171" }}>
            Application error
          </h2>
          <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#94a3b8" }}>
            A critical error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: "0.375rem",
              background: "#2563eb",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              color: "white",
              border: "none",
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
