import clsx from 'clsx'
import { Icon } from '@/shared/components/Icon'

export function QueuePanel({ queue, queueIndex, onSelect, onClose }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-serif-display text-lg text-cozy-ink">Up Next</h3>
        <button
          type="button"
          aria-label="Close queue"
          onClick={onClose}
          className="rounded-full p-1 text-cozy-ink-muted hover:text-cozy-accent"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
      {queue.length === 0 ? (
        <p className="text-sm text-cozy-ink-muted">Queue is empty.</p>
      ) : (
        <ul className="flex-1 space-y-1 overflow-y-auto" aria-label="Queue">
          {queue.map((track, index) => (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(index)
                  onClose?.()
                }}
                className={clsx(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-cozy-brass/10',
                  index === queueIndex &&
                    'bg-cozy-brass/15 font-semibold text-cozy-accent',
                )}
              >
                <span className="w-5 shrink-0 text-center text-xs text-cozy-ink-muted">
                  {index + 1}
                </span>
                <span className="truncate">{track.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
