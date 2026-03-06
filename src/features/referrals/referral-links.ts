const DEFAULT_SAILY_URL = "https://thedailysail.starsailors.space";

export function buildClientReferralUrl(referralCode: string, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return "";
  const url = new URL("/auth", base);
  url.searchParams.set("ref", referralCode);
  return url.toString();
}

export function buildSailyReferralUrl(referralCode: string): string {
  const base = process.env.NEXT_PUBLIC_SAILY_URL || DEFAULT_SAILY_URL;
  const url = new URL(base);
  url.searchParams.set("ref", referralCode);
  return url.toString();
}

export function buildReferralShareText(referralCode: string, origin?: string): string {
  const clientUrl = buildClientReferralUrl(referralCode, origin);
  const sailyUrl = buildSailyReferralUrl(referralCode);
  return `Join me in Star Sailors. Use my referral code: ${referralCode}${clientUrl ? ` (Web: ${clientUrl})` : ""} (Saily: ${sailyUrl})`;
}
