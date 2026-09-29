import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the shell and an empty-library state on first load', async () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Gramophone' })).toBeInTheDocument()
    expect(await screen.findByText(/No songs here yet/)).toBeInTheDocument()
    expect(screen.getByText('Nothing spinning yet')).toBeInTheDocument()
  })

  it('shows the All Songs category by default', async () => {
    render(<App />)
    expect(await screen.findByRole('tab', { name: /All Songs/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('play/pause and other transport buttons are disabled with no track loaded', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
  })

  it('renders the single unified search bar and shows added records and YouTube recommendations sections when searching', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<App />)
    const searchInput = screen.getByRole('searchbox', {
      name: /Search records and YouTube/i,
    })
    expect(searchInput).toBeInTheDocument()

    await userEvent.type(searchInput, 'vintage jazz')
    expect(await screen.findByText(/^Added Records \(/)).toBeInTheDocument()
    expect(await screen.findByText(/^YouTube Recommendations \(/)).toBeInTheDocument()
  })

  it('renders the Gramophone Sound mode toggle on the turntable deck', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /Gramophone Sound/i }),
    ).toBeInTheDocument()
  })
})
