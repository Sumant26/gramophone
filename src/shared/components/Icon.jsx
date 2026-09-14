/**
 * Small hand-written icon set (no external icon package) so the bundle
 * stays light. Each icon is a plain 24x24 stroke-based SVG.
 */
const paths = {
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h4v14H7zM13 5h4v14h-4z',
  stop: 'M6 6h12v12H6z',
  next: 'M6 6l8 6-8 6V6zM16 6h2v12h-2z',
  previous: 'M18 6l-8 6 8 6V6zM8 6H6v12h2z',
  skipForward: 'M13 6l7 6-7 6V6zM4 6l7 6-7 6V6z',
  skipBackward: 'M11 6l-7 6 7 6V6zM20 6l-7 6 7 6V6z',
  shuffle:
    'M4 6h3l8 12h5M4 18h3l3-4.5M16 6h5v0M16 6l3-3M16 6l3 3M21 18l-3 3M21 18l-3-3',
  repeat: 'M4 7h13a3 3 0 0 1 3 3v1M20 17H7a3 3 0 0 1-3-3v-1M8 4L4 7l4 3M16 20l4-3-4-3',
  repeatOne:
    'M4 7h13a3 3 0 0 1 3 3v1M20 17H7a3 3 0 0 1-3-3v-1M8 4L4 7l4 3M16 20l4-3-4-3M12 11v4M11 12h1',
  heart:
    'M12 21s-7.5-4.6-10-9C.5 8.5 2 5 5.5 5 8 5 10 7 12 9c2-2 4-4 6.5-4C22 5 23.5 8.5 22 12c-2.5 4.4-10 9-10 9z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35',
  volume: 'M4 9v6h4l5 5V4L8 9H4zM16.5 8.5a5 5 0 0 1 0 7',
  volumeMute: 'M4 9v6h4l5 5V4L8 9H4zM18 9l-4 4m0-4l4 4',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',
  vinylDrop:
    'M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
  queue: 'M4 6h16M4 12h16M4 18h10',
  close: 'M6 6l12 12M18 6L6 18',
  disc: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  broadcast:
    'M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7.8 8.8a6 6 0 0 0 0 8.4M16.2 8.8a6 6 0 0 1 0 8.4M4.9 5.9a10 10 0 0 0 0 14.2M19.1 5.9a10 10 0 0 1 0 14.2',
}

export function Icon({ name, size = 20, filled = false, className = '', ...rest }) {
  const d = paths[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  )
}
