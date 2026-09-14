import { describe, it, expect } from 'vitest'
import { computeBarHeights } from './visualizerMath'

describe('computeBarHeights', () => {
  it('returns all zeros when there is no data', () => {
    expect(computeBarHeights(null, 8)).toEqual(new Array(8).fill(0))
    expect(computeBarHeights(new Uint8Array(0), 8)).toEqual(new Array(8).fill(0))
  })

  it('normalizes byte values (0-255) into a 0-1 range', () => {
    const data = new Uint8Array(8).fill(255)
    const bars = computeBarHeights(data, 4)
    bars.forEach((v) => expect(v).toBeCloseTo(1))
  })

  it('produces exactly barCount bars regardless of input length', () => {
    const data = new Uint8Array(1024).fill(128)
    expect(computeBarHeights(data, 32)).toHaveLength(32)
    expect(computeBarHeights(data, 10)).toHaveLength(10)
  })

  it('averages within each bucket', () => {
    const data = new Uint8Array([0, 255, 0, 255])
    const bars = computeBarHeights(data, 2)
    expect(bars[0]).toBeCloseTo(0.5)
    expect(bars[1]).toBeCloseTo(0.5)
  })
})
