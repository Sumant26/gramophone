import { useRef } from 'react'
import { Icon } from '@/shared/components/Icon'
import { Button } from '@/shared/components/Button'

const supportsDirectoryPicker =
  typeof window !== 'undefined' && 'showDirectoryPicker' in window

/**
 * Lets the user bring music into the library. Prefers the File System
 * Access API (Chromium) so we can remember folder access across sessions;
 * falls back to a plain directory `<input>` (Firefox/Safari) which still
 * works for this session but won't persist file handles.
 */
export function FolderPicker({ onFilesSelected, onDirectorySelected, isScanning }) {
  const inputRef = useRef(null)

  async function handleDirectoryClick() {
    try {
      const dirHandle = await window.showDirectoryPicker()
      onDirectorySelected(dirHandle)
    } catch (err) {
      if (err?.name !== 'AbortError') throw err
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        aria-label="Add music from a folder"
        disabled={isScanning}
        onClick={
          supportsDirectoryPicker
            ? handleDirectoryClick
            : () => inputRef.current?.click()
        }
      >
        <Icon name="folder" size={16} />
      </Button>
      {!supportsDirectoryPicker && (
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          webkitdirectory=""
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      )}
      {isScanning && (
        <span className="text-xs text-cozy-ink-muted" role="status">
          Scanning your music…
        </span>
      )}
    </div>
  )
}
