import { Icon } from '@/shared/components/Icon'

const OPTIONS = [
  { label: 'Off', minutes: 0 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '60 min', minutes: 60 },
]

/**
 * `sleepTimerMinutes` is the preset the user picked (tracked in the store
 * alongside the target timestamp) rather than something derived from
 * `Date.now()` here — reading the clock during render would make this
 * component impure and produce React purity-rule violations/unstable
 * output across re-renders.
 */
export function SleepTimer({ sleepTimerMinutes, onSetSleepTimer }) {
  return (
    <label className="flex items-center gap-2 text-sm text-cozy-ink-muted">
      <Icon name="moon" size={16} />
      <span className="sr-only">Sleep timer</span>
      <select
        aria-label="Sleep timer"
        className="rounded-md border border-cozy-brass/40 bg-cozy-surface-2 px-2 py-1 text-cozy-ink"
        value={sleepTimerMinutes}
        onChange={(e) => onSetSleepTimer(Number(e.target.value))}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.minutes} value={opt.minutes}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
