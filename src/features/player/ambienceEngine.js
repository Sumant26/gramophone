/**
 * AmbienceEngine
 *
 * Procedural audio synthesis for ambient soundscapes using the Web Audio API.
 * Synthesizes Rain, Fireplace, Coffee Shop murmur, and Needle Drop sound effects
 * entirely in-browser without requiring external sample downloads.
 */

const FADE_TIME = 0.1

export class AmbienceEngine {
  /**
   * @param {AudioContext} [context]
   */
  constructor(context = null) {
    this.context = context
    this.masterGain = null

    // Layers: rain, fire, cafe
    this.layers = {
      rain: { gainNode: null, sources: [], volume: 0 },
      fire: { gainNode: null, sources: [], volume: 0 },
      cafe: { gainNode: null, sources: [], volume: 0 },
    }
  }

  ensureContext() {
    if (this.context) return this.context
    const Ctx = window.AudioContext || window.webkitAudioContext
    this.context = new Ctx()
    return this.context
  }

  initNodes() {
    if (this.masterGain) return
    const ctx = this.ensureContext()
    this.masterGain = ctx.createGain()
    this.masterGain.connect(ctx.destination)

    for (const key of Object.keys(this.layers)) {
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.connect(this.masterGain)
      this.layers[key].gainNode = gain
    }
  }

  setLayerVolume(layerName, volume) {
    const layer = this.layers[layerName]
    if (!layer) return
    const safeVolume = Math.min(Math.max(volume, 0), 1)
    layer.volume = safeVolume

    const ctx = this.ensureContext()
    if (ctx.state === 'suspended' && safeVolume > 0) {
      ctx.resume()
    }
    this.initNodes()

    const now = ctx.currentTime
    layer.gainNode.gain.cancelScheduledValues(now)
    layer.gainNode.gain.linearRampToValueAtTime(safeVolume * 0.4, now + FADE_TIME)

    if (safeVolume > 0 && layer.sources.length === 0) {
      this._startLayer(layerName)
    } else if (safeVolume === 0 && layer.sources.length > 0) {
      this._stopLayer(layerName)
    }
  }

  /**
   * Synthesizes and plays a realistic needle drop thump and micro-scratch
   */
  playNeedleDrop(volume = 0.5) {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') ctx.resume()
    this.initNodes()

    const now = ctx.currentTime
    const duration = 0.25

    // Low-frequency thump
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(90, now)
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12)

    oscGain.gain.setValueAtTime(0, now)
    oscGain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.01)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(oscGain)
    oscGain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + duration)

    // Needle scratch pop
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015))
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 3

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(volume * 0.4, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.masterGain)

    noise.start(now)
  }

  _startLayer(name) {
    const ctx = this.context
    const layer = this.layers[name]
    if (!ctx || !layer) return

    if (name === 'rain') {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.969 * b2 + white * 0.153852
        b3 = 0.8665 * b3 + white * 0.3104856
        b4 = 0.55 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.016898
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05
        b6 = white * 0.115926
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 1200

      source.connect(filter)
      filter.connect(layer.gainNode)
      source.start(0)
      layer.sources.push(source)
    } else if (name === 'fire') {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        const pop = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.7 : 0
        const lowRumble = (Math.random() * 2 - 1) * 0.03
        data[i] = pop + lowRumble
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 800
      filter.Q.value = 1.2

      source.connect(filter)
      filter.connect(layer.gainNode)
      source.start(0)
      layer.sources.push(source)
    } else if (name === 'cafe') {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter1 = ctx.createBiquadFilter()
      filter1.type = 'bandpass'
      filter1.frequency.value = 450
      filter1.Q.value = 2.5

      source.connect(filter1)
      filter1.connect(layer.gainNode)
      source.start(0)
      layer.sources.push(source)
    }
  }

  _stopLayer(name) {
    const layer = this.layers[name]
    if (!layer) return
    layer.sources.forEach((src) => {
      try {
        src.stop()
        src.disconnect()
      } catch {
        // already stopped
      }
    })
    layer.sources = []
  }

  dispose() {
    for (const key of Object.keys(this.layers)) {
      this._stopLayer(key)
    }
    this.masterGain?.disconnect()
    this.masterGain = null
  }
}
