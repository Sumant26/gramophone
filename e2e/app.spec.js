import { test, expect } from '@playwright/test'

test.describe('Gramophone shell', () => {
  test('loads and shows the cozy home state with an empty library', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Gramophone/)
    await expect(page.getByRole('heading', { name: 'Gramophone' })).toBeVisible()
    await expect(page.getByText('Nothing spinning yet')).toBeVisible()
    await expect(page.getByText(/No songs here yet/)).toBeVisible()
  })

  test('the "All Songs" category tab is selected by default', async ({ page }) => {
    await page.goto('/')
    const allSongsTab = page.getByRole('tab', { name: /All Songs/ })
    await expect(allSongsTab).toBeVisible()
    await expect(allSongsTab).toHaveAttribute('aria-selected', 'true')
  })

  test('transport controls are disabled until a track is loaded', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Play' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Next track' })).toBeDisabled()
  })

  test('single unified search input accepts typed text and searches both local records and YouTube', async ({
    page,
  }) => {
    await page.goto('/')
    const search = page.getByRole('searchbox')
    await expect(search).toBeVisible()
    await search.fill('lofi beats')
    await expect(search).toHaveValue('lofi beats')
    await expect(page.getByText(/^Added Records \(/)).toBeVisible()
    await expect(page.getByText(/^YouTube Recommendations \(/)).toBeVisible()
  })

  test('volume knob is keyboard operable', async ({ page }) => {
    await page.goto('/')
    const knob = page.getByRole('slider', { name: 'Volume' })
    await knob.focus()
    const before = await knob.getAttribute('aria-valuenow')
    await page.keyboard.press('ArrowUp')
    const after = await knob.getAttribute('aria-valuenow')
    expect(Number(after)).toBeGreaterThan(Number(before))
  })

  test('the YouTube player stays attached in the DOM', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('youtube-mount')).toBeAttached()
  })

  test('the app renders correctly on a phone-width viewport without horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Gramophone' })).toBeVisible()
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // +1 for sub-pixel rounding
  })
})
