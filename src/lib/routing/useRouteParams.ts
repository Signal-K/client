"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { matchRouteParams } from "./staticParams";

/**
 * The current dynamic route params, read from the browser URL. Null during the
 * static prerender and the first client render (so hydration matches), and
 * when the URL does not fit `pattern`.
 */
export function useRouteParams<K extends string = string>(pattern: string): Partial<Record<K, string>> | null {
  const pathname = usePathname();
  const [params, setParams] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const next = matchRouteParams(pattern, window.location.pathname);
    setParams((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [pattern, pathname]);

  return params as Partial<Record<K, string>> | null;
}
