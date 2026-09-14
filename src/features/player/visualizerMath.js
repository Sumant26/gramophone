/**
 * Downsamples a Uint8Array of frequency-domain bytes (0-255) into
 * `barCount` normalized bar heights (0-1). Pulled out as a pure function
 * (and its own module, separate from the Visualizer component, so React
 * Fast Refresh only ever sees component exports there) so the downsampling
 * math is unit-testable without a canvas or real AnalyserNode.
 */
export function computeBarHeights(byteFrequencyData, barCount) {
  if (!byteFrequencyData || byteFrequencyData.length === 0) {
    return new Array(barCount).fill(0)
  }
  const bucketSize = Math.max(1, Math.floor(byteFrequencyData.length / barCount))
  const bars = []
  for (let i = 0; i < barCount; i++) {
    let sum = 0
    const start = i * bucketSize
    const end = Math.min(start + bucketSize, byteFrequencyData.length)
    for (let j = start; j < end; j++) sum += byteFrequencyData[j]
    bars.push(sum / (end - start) / 255)
  }
  return bars
}
