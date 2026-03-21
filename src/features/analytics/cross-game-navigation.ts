export interface CrossGameNavigationPayload {
  destination: string;
  source_section: string;
  user_id?: string | null;
}

export function captureCrossGameNavigation(
  posthog: { capture?: (event: string, properties?: Record<string, unknown>) => void } | null | undefined,
  payload: CrossGameNavigationPayload,
) {
  posthog?.capture?.("cross_game_navigation", { ...payload });
}
