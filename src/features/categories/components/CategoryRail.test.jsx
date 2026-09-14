import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryRail } from './CategoryRail'

const categories = [
  { id: 'smart:all', label: 'All Songs', count: 10 },
  { id: 'genre:Jazz', label: 'Jazz', count: 4 },
]

describe('CategoryRail', () => {
  it('renders a tab per category with its count', () => {
    render(
      <CategoryRail
        categories={categories}
        selectedCategoryId="smart:all"
        onSelect={vi.fn()}
      />,
    )
    expect(screen.getByRole('tab', { name: /All Songs/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked category id', async () => {
    const onSelect = vi.fn()
    render(
      <CategoryRail
        categories={categories}
        selectedCategoryId="smart:all"
        onSelect={onSelect}
      />,
    )
    await userEvent.click(screen.getByRole('tab', { name: /Jazz/ }))
    expect(onSelect).toHaveBeenCalledWith('genre:Jazz')
  })
})
