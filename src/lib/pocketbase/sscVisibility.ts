/** Additive hide flag for the garden overhaul. Hidden rows stay in PocketBase for later reconcile. */
export const SSC_HIDDEN_FIELD = "sscHidden";
export const VISIBLE_RECORD_FILTER = `${SSC_HIDDEN_FIELD} = false`;

export function withVisibleRecords(filter: string): string {
  if (!filter.trim()) return VISIBLE_RECORD_FILTER;
  return `${filter} && ${VISIBLE_RECORD_FILTER}`;
}
