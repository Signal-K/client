import { describe, it, expect } from 'vitest'
import { getDiscoveryTypeLabel, getDiscoveryDescription } from './discoveries'

describe('getDiscoveryTypeLabel', () => {
  it('maps planet to exoplanet label', () => {
    expect(getDiscoveryTypeLabel('planet')).toBe('New Exoplanet Discovered')
  })
  it('maps telescope-minorPlanet to asteroid label', () => {
    expect(getDiscoveryTypeLabel('telescope-minorPlanet')).toBe('New Asteroid Detected')
  })
  it('maps cloud to Mars cloud label', () => {
    expect(getDiscoveryTypeLabel('cloud')).toBe('New Cloud Formation on Mars')
  })
  it('returns default for unknown type', () => {
    expect(getDiscoveryTypeLabel('diskDetective')).toBe('New Discovery')
  })
  it('returns default for null', () => {
    expect(getDiscoveryTypeLabel(null)).toBe('New Discovery')
  })
})

describe('getDiscoveryDescription', () => {
  it('returns habitability description for planet', () => {
    expect(getDiscoveryDescription('planet', null)).toContain('habitable')
  })
  it('returns near-Earth description for minorPlanet', () => {
    expect(getDiscoveryDescription('telescope-minorPlanet', null)).toContain('Near-Earth')
  })
  it('returns atmospheric description for cloud', () => {
    expect(getDiscoveryDescription('cloud', null)).toContain('Atmospheric')
  })
  it('returns empty string for null type', () => {
    expect(getDiscoveryDescription(null, null)).toBe('')
  })
  it('returns empty string for unknown type', () => {
    expect(getDiscoveryDescription('unknown', null)).toBe('')
  })
})
