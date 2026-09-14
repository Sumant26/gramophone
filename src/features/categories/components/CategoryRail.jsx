import clsx from 'clsx'

export function CategoryRail({ categories, selectedCategoryId, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="Categories"
      className="flex gap-2 overflow-x-auto pb-2"
    >
      {categories.map((category) => {
        const isSelected = category.id === selectedCategoryId
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(category.id)}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              isSelected
                ? 'border-cozy-accent bg-cozy-accent text-cozy-on-accent'
                : 'border-cozy-brass/40 bg-cozy-surface-2 text-cozy-ink hover:bg-cozy-brass/10',
            )}
          >
            {category.label}
            <span className="text-xs opacity-70">{category.count}</span>
          </button>
        )
      })}
    </div>
  )
}
