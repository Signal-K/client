"use client";

import Link from "next/link";

interface TelescopeBlockProps {
  visible: boolean;
}

export default function TelescopeBlock({ visible }: TelescopeBlockProps) {
  if (!visible) return null;

  return (
    <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔭</span>
            <p className="font-medium">Telescope Array</p>
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              Recommended
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Your most important tool! Enhances classification accuracy and unlocks the research skill tree.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              ✓ Better data quality
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              ✓ Unlocks research
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              ✓ Finds distant objects
            </span>
          </div>
        </div>
        <div className="ml-4">
          <Link
            href="/activity/deploy"
            className="text-sm font-medium rounded px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Deploy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
