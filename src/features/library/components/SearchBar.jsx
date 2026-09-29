import { Icon } from '@/shared/components/Icon'

export function SearchBar({ value, onChange }) {
  return (
    <div className="flex min-w-[220px] items-center gap-2 rounded-full border border-cozy-brass/40 bg-cozy-surface-2 px-3 py-1.5 sm:min-w-[260px] shadow-sm transition-all focus-within:border-cozy-brass focus-within:ring-2 focus-within:ring-cozy-brass/20">
      <Icon name="search" size={16} className="text-cozy-brass shrink-0" />
      <input
        type="search"
        aria-label="Search records and YouTube"
        placeholder="Search records & YouTube music…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-cozy-ink placeholder:text-cozy-ink-muted focus:outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="rounded-full p-0.5 text-cozy-ink-muted hover:text-cozy-ink transition-colors"
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  )
}
