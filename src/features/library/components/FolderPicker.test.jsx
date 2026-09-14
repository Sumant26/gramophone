import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FolderPicker } from './FolderPicker'

describe('FolderPicker (fallback input, no File System Access API)', () => {
  it('calls onFilesSelected when files are chosen via the hidden input', () => {
    const onFilesSelected = vi.fn()
    const { container } = render(
      <FolderPicker
        onFilesSelected={onFilesSelected}
        onDirectorySelected={vi.fn()}
        isScanning={false}
      />,
    )
    const input = container.querySelector('input[type="file"]')
    const files = [new File(['a'], 'song.mp3', { type: 'audio/mpeg' })]
    fireEvent.change(input, { target: { files } })
    expect(onFilesSelected).toHaveBeenCalledWith(files)
  })

  it('shows a scanning status message while isScanning is true', () => {
    render(
      <FolderPicker
        onFilesSelected={vi.fn()}
        onDirectorySelected={vi.fn()}
        isScanning
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Scanning your music')
  })
})
