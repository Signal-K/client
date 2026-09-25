// Per-request state for code written against Next.js request APIs (auth(),
// currentUser()). AsyncLocalStorage keeps concurrent requests in one isolate
// apart; a module-level variable would leak identity between them.
import { AsyncLocalStorage } from "node:async_hooks";

export type RequestContext = {
  userId: string | null;
  sessionId: string | null;
  claims: Record<string, unknown> | null;
  /** Why userId is null, for logs only. */
  authError: string | null;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function currentRequestContext(): RequestContext {
  const store = requestContext.getStore();
  if (!store) throw new Error("Auth context unavailable");
  return store;
}
