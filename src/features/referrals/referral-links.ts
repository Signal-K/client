const DEFAULT_SAILY_URL = "https://thedailysail.starsailors.space";

export function getSailyUrl(referralCode?: string | null): string {
  const base = process.env.NEXT_PUBLIC_SAILY_URL || DEFAULT_SAILY_URL;
  const url = new URL(base);
  if (referralCode) {
    url.searchParams.set("ref", referralCode);
  }
  return url.toString();
}

export function buildClientReferralUrl(referralCode: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return "";
  const url = new URL("/auth", base);
  url.searchParams.set("ref", referralCode);
  return url.toString();
}

export function buildReferralShareText(referralCode: string, origin?: string): string {
  const clientUrl = buildClientReferralUrl(referralCode, origin);
  const sailyUrl = getSailyUrl(referralCode);
  return `Join me in Star Sailors. Use my referral code: ${referralCode}${clientUrl ? ` (Web: ${clientUrl})` : ""} (Saily: ${sailyUrl})`;
}
