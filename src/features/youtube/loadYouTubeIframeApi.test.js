import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  loadYouTubeIframeApi,
  __resetYouTubeIframeApiLoaderForTests,
} from './loadYouTubeIframeApi'

describe('loadYouTubeIframeApi', () => {
  beforeEach(() => {
    __resetYouTubeIframeApiLoaderForTests()
    document.head.innerHTML = ''
    delete window.YT
    delete window.onYouTubeIframeAPIReady
  })

  it('resolves immediately if window.YT.Player already exists', async () => {
    window.YT = { Player: vi.fn() }
    const result = await loadYouTubeIframeApi()
    expect(result).toBe(window.YT)
    expect(document.querySelector('script[src*="iframe_api"]')).toBeNull()
  })

  it('injects the IFrame API script tag when not already present', () => {
    loadYouTubeIframeApi()
    const script = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    )
    expect(script).not.toBeNull()
    expect(script.async).toBe(true)
  })

  it('resolves once the global onYouTubeIframeAPIReady callback fires', async () => {
    const promise = loadYouTubeIframeApi()
    window.YT = { Player: vi.fn() }
    window.onYouTubeIframeAPIReady()
    await expect(promise).resolves.toBe(window.YT)
  })

  it('chains a pre-existing onYouTubeIframeAPIReady callback rather than clobbering it', async () => {
    const existing = vi.fn()
    window.onYouTubeIframeAPIReady = existing
    const promise = loadYouTubeIframeApi()
    window.YT = { Player: vi.fn() }
    window.onYouTubeIframeAPIReady()
    await promise
    expect(existing).toHaveBeenCalledTimes(1)
  })

  it('only injects one script tag across repeated calls (singleton)', () => {
    loadYouTubeIframeApi()
    loadYouTubeIframeApi()
    loadYouTubeIframeApi()
    const scripts = document.querySelectorAll(
      'script[src="https://www.youtube.com/iframe_api"]',
    )
    expect(scripts).toHaveLength(1)
  })

  it('returns the same promise instance across repeated calls', () => {
    const first = loadYouTubeIframeApi()
    const second = loadYouTubeIframeApi()
    expect(first).toBe(second)
  })
})
