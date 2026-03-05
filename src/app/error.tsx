"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
      <p className="max-w-md text-sm text-gray-400">
        An unexpected error occurred. If this keeps happening, please refresh the page.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
      >
        Try again
      </button>
    </div>
  );
}
