import { describe, it, expect } from 'vitest'
import { getSailyUrl, buildClientReferralUrl, buildReferralShareText } from './referral-links'

describe('getSailyUrl', () => {
  it('returns a valid URL with no code', () => {
    const url = getSailyUrl()
    expect(() => new URL(url)).not.toThrow()
    expect(url).toContain('thedailysail.starsailors.space')
  })
  it('omits ref param when no code given', () => {
    expect(getSailyUrl()).not.toContain('ref=')
  })
  it('adds ref param with a code', () => {
    expect(getSailyUrl('ABC123')).toContain('ref=ABC123')
  })
  it('omits ref param when code is null', () => {
    expect(getSailyUrl(null)).not.toContain('ref=')
  })
  it('omits ref param when code is empty string', () => {
    expect(getSailyUrl('')).not.toContain('ref=')
  })
})

describe('buildClientReferralUrl', () => {
  it('builds a URL with ref param when origin is provided', () => {
    expect(buildClientReferralUrl('XYZ', 'https://example.com')).toBe('https://example.com/auth?ref=XYZ')
  })
  it('returns empty string when no origin and no window', () => {
    // In node (vitest), window is undefined so origin falls back to ""
    expect(buildClientReferralUrl('XYZ')).toBe('')
  })
  it('encodes special characters in code', () => {
    const url = buildClientReferralUrl('A B', 'https://example.com')
    expect(url).toContain('ref=A+B')
  })
})

describe('buildReferralShareText', () => {
  it('includes the referral code', () => {
    expect(buildReferralShareText('CODE42', 'https://example.com')).toContain('CODE42')
  })
  it('includes the saily URL section', () => {
    expect(buildReferralShareText('CODE42', 'https://example.com')).toContain('Saily:')
  })
  it('includes the web URL when origin provided', () => {
    const text = buildReferralShareText('CODE42', 'https://example.com')
    expect(text).toContain('Web: https://example.com/auth?ref=CODE42')
  })
  it('omits web URL when no origin in node env', () => {
    const text = buildReferralShareText('CODE42')
    expect(text).not.toContain('Web:')
    expect(text).toContain('Saily:')
  })
})
