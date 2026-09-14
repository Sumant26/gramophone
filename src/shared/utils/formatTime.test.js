import { describe, it, expect } from 'vitest'
import { formatTime } from './formatTime'

describe('formatTime', () => {
  it('formats seconds under a minute', () => {
    expect(formatTime(5)).toBe('0:05')
    expect(formatTime(59)).toBe('0:59')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(600)).toBe('10:00')
  })

  it('formats hours once past 3600 seconds', () => {
    expect(formatTime(3661)).toBe('1:01:01')
  })

  it('handles invalid input gracefully', () => {
    expect(formatTime(NaN)).toBe('0:00')
    expect(formatTime(-5)).toBe('0:00')
    expect(formatTime(Infinity)).toBe('0:00')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(65.9)).toBe('1:05')
  })
})
