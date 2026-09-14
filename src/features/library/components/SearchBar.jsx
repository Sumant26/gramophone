import { Icon } from '@/shared/components/Icon'

export function SearchBar({ value, onChange }) {
  return (
    <div className="flex min-w-[220px] items-center gap-2 rounded-full border border-cozy-brass/40 bg-cozy-surface-2 px-3 py-1.5 sm:min-w-[260px]">
      <Icon name="search" size={16} />
      <input
        type="search"
        aria-label="Search your library"
        placeholder="Search songs, artists, albums…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-cozy-ink placeholder:text-cozy-ink-muted focus:outline-none"
      />
    </div>
  )
}
