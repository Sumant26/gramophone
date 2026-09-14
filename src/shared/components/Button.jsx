import clsx from 'clsx'

const sizes = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

/**
 * A round, tactile "physical button" used for transport controls. Presses
 * scale down slightly to feel pressable rather than flat/web-like.
 */
export function Button({
  size = 'md',
  active = false,
  variant = 'default',
  className,
  children,
  ...rest
}) {
  return (
    <button
      type="button"
      className={clsx(
        'flex items-center justify-center rounded-full border transition-transform duration-100 active:scale-90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cozy-brass-light',
        sizes[size],
        variant === 'primary'
          ? 'border-cozy-brass-light bg-cozy-accent text-cozy-on-accent shadow-cozy hover:brightness-110'
          : 'border-cozy-brass/40 bg-cozy-surface-2 text-cozy-ink shadow-sm hover:bg-cozy-brass/10',
        active && 'ring-2 ring-cozy-brass text-cozy-accent',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
