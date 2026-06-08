import { describe, it, expect } from 'vitest'
import { recursiveSerialize } from './serialization'

describe('recursiveSerialize', () => {
  it('passes through null', () => expect(recursiveSerialize(null)).toBeNull())
  it('passes through undefined', () => expect(recursiveSerialize(undefined)).toBeUndefined())
  it('passes through strings', () => expect(recursiveSerialize('hello')).toBe('hello'))
  it('passes through numbers', () => expect(recursiveSerialize(123)).toBe(123))
  it('passes through booleans', () => expect(recursiveSerialize(true)).toBe(true))
  it('converts BigInt to string', () => expect(recursiveSerialize(BigInt(42))).toBe('42'))
  it('converts large BigInt to string', () => expect(recursiveSerialize(BigInt('9007199254740993'))).toBe('9007199254740993'))
  it('converts BigInt values in arrays', () => {
    expect(recursiveSerialize([BigInt(1), BigInt(2), BigInt(3)])).toEqual(['1', '2', '3'])
  })
  it('passes through non-BigInt values in arrays', () => {
    expect(recursiveSerialize([1, 'two', true, null])).toEqual([1, 'two', true, null])
  })
  it('converts BigInt in flat objects', () => {
    expect(recursiveSerialize({ a: BigInt(99), b: 'text', c: 42 })).toEqual({ a: '99', b: 'text', c: 42 })
  })
  it('handles deeply nested structures', () => {
    const input = { level1: { level2: { value: BigInt(7), other: 'keep' } } }
    expect(recursiveSerialize(input)).toEqual({ level1: { level2: { value: '7', other: 'keep' } } })
  })
  it('handles mixed arrays and objects', () => {
    const input = { ids: [BigInt(1), BigInt(2)], name: 'test' }
    expect(recursiveSerialize(input)).toEqual({ ids: ['1', '2'], name: 'test' })
  })
  it('handles empty object', () => expect(recursiveSerialize({})).toEqual({}))
  it('handles empty array', () => expect(recursiveSerialize([])).toEqual([]))
})
