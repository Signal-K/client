// `next/cache` for the Worker bundle. Pages are static assets rendered in the
// browser, so there is no server render cache to invalidate.
export function revalidatePath(_path: string, _type?: "layout" | "page"): void {}
export function revalidateTag(_tag: string): void {}
export function unstable_noStore(): void {}
export function unstable_cache<T extends (...args: any[]) => Promise<unknown>>(fn: T): T {
  return fn;
}
