export interface CrossGameNavigationPayload {
  destination: string;
  source_section: string;
  user_id?: string | null;
  hop_id?: string;
  bonus_cr?: number;
  direction?: "out" | "in";
}

export function captureCrossGameNavigation(
  posthog: { capture?: (event: string, properties?: Record<string, unknown>) => void } | null | undefined,
  payload: CrossGameNavigationPayload,
) {
  posthog?.capture?.("cross_game_navigation", { ...payload });
}
