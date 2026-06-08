import { describe, it, expect } from 'vitest'
import { calculateLevel, getXPForLevel, getLevelProgress, getXPForNextChapter, getMaxUnlockedChapter } from './leveling'

describe('calculateLevel', () => {
  it('returns level 1 for 0 XP', () => expect(calculateLevel(0)).toBe(1))
  it('returns level 1 for negative XP', () => expect(calculateLevel(-10)).toBe(1))
  it('returns level 2 at exactly 5 XP', () => expect(calculateLevel(5)).toBe(2))
  it('returns level 2 just below 20 XP', () => expect(calculateLevel(19)).toBe(2))
  it('returns level 3 at exactly 20 XP', () => expect(calculateLevel(20)).toBe(3))
  it('returns level 4 at exactly 45 XP', () => expect(calculateLevel(45)).toBe(4))
  it('returns level 5 at exactly 80 XP', () => expect(calculateLevel(80)).toBe(5))
  it('returns level 6 at exactly 125 XP', () => expect(calculateLevel(125)).toBe(6))
  it('returns level 10 at exactly 405 XP', () => expect(calculateLevel(405)).toBe(10))
})

describe('getXPForLevel', () => {
  it('returns 0 for level 1', () => expect(getXPForLevel(1)).toBe(0))
  it('returns 0 for level <= 1', () => expect(getXPForLevel(0)).toBe(0))
  it('returns 5 for level 2', () => expect(getXPForLevel(2)).toBe(5))
  it('returns 20 for level 3', () => expect(getXPForLevel(3)).toBe(20))
  it('returns 45 for level 4', () => expect(getXPForLevel(4)).toBe(45))
  it('returns 80 for level 5', () => expect(getXPForLevel(5)).toBe(80))
  it('returns 125 for level 6', () => expect(getXPForLevel(6)).toBe(125))
  it('is consistent with calculateLevel', () => {
    for (let level = 1; level <= 10; level++) {
      const xp = getXPForLevel(level)
      expect(calculateLevel(xp)).toBe(level)
    }
  })
})

describe('getLevelProgress', () => {
  it('returns 0 at the start of level 1', () => expect(getLevelProgress(0)).toBe(0))
  it('returns 0 at the start of level 2 (5 XP)', () => expect(getLevelProgress(5)).toBe(0))
  it('returns 0 at the start of level 3 (20 XP)', () => expect(getLevelProgress(20)).toBe(0))
  it('returns between 0 and 100 mid-level', () => {
    const p = getLevelProgress(12)
    expect(p).toBeGreaterThan(0)
    expect(p).toBeLessThan(100)
  })
  it('clamps to 0 for negative XP', () => expect(getLevelProgress(-5)).toBe(0))
})

describe('getXPForNextChapter', () => {
  it('chapter 1 requires 20 XP for chapter 2 (level 3)', () => expect(getXPForNextChapter(1)).toBe(20))
  it('chapter 2 requires 80 XP for chapter 3 (level 5)', () => expect(getXPForNextChapter(2)).toBe(80))
  it('chapter 3 requires 180 XP for chapter 4 (level 7)', () => expect(getXPForNextChapter(3)).toBe(180))
})

describe('getMaxUnlockedChapter', () => {
  it('level 1 unlocks chapter 1', () => expect(getMaxUnlockedChapter(0)).toBe(1))
  it('level 2 (5 XP) still chapter 1', () => expect(getMaxUnlockedChapter(5)).toBe(1))
  it('level 3 (20 XP) unlocks chapter 2', () => expect(getMaxUnlockedChapter(20)).toBe(2))
  it('level 5 (80 XP) unlocks chapter 3', () => expect(getMaxUnlockedChapter(80)).toBe(3))
  it('level 7 (180 XP) unlocks chapter 4', () => expect(getMaxUnlockedChapter(180)).toBe(4))
})
