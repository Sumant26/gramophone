import { useEffect, useRef } from 'react'
import { computeBarHeights } from '../visualizerMath'

const BAR_COUNT = 32

export function Visualizer({ analyser, isPlaying, className = '' }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    // Environments without full canvas support (e.g. jsdom in tests) return
    // null here — skip drawing rather than throwing.
    if (!ctx) return
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null

    function draw() {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      let bars
      if (analyser && dataArray && isPlaying) {
        analyser.getByteFrequencyData(dataArray)
        bars = computeBarHeights(dataArray, BAR_COUNT)
      } else if (isPlaying) {
        // Organic simulated wave when playing streaming audio (e.g. YouTube stream)
        const t = performance.now() * 0.003
        bars = Array.from({ length: BAR_COUNT }, (_, i) => {
          const wave1 = Math.sin(t + i * 0.35) * 0.25
          const wave2 = Math.cos(t * 1.5 + i * 0.2) * 0.15
          const wave3 = Math.sin(t * 0.7 - i * 0.15) * 0.1
          const centerWeight = 1 - (Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)) * 0.3
          return Math.max(0.08, (wave1 + wave2 + wave3 + 0.45) * centerWeight)
        })
      } else {
        bars = new Array(BAR_COUNT).fill(0.04)
      }

      const barWidth = width / BAR_COUNT
      bars.forEach((value, i) => {
        const barHeight = Math.max(2, value * height)
        ctx.fillStyle = 'rgba(201, 154, 82, 0.85)' // --color-cozy-brass
        ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight)
      })

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [analyser, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={64}
      className={className}
      role="img"
      aria-label="Audio visualizer"
    />
  )
}
