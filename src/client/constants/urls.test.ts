import { getBaseUrl, toAbsoluteUrl } from './urls'

declare const jsdom: {
  reconfigure(options: { url: string }): void
}

describe('getBaseUrl', () => {
  afterEach(() => {
    // Reset to default URL
    jsdom.reconfigure({ url: 'http://localhost' })
  })

  it('returns window.location.origin in browser context', () => {
    jsdom.reconfigure({ url: 'http://192.111.0.222' })
    expect(getBaseUrl()).toBe('http://192.111.0.222')
  })

  it('returns window.location.origin from localhost', () => {
    jsdom.reconfigure({ url: 'http://localhost:3000' })
    expect(getBaseUrl()).toBe('http://localhost:3000')
  })
})

describe('toAbsoluteUrl', () => {
  beforeEach(() => {
    jsdom.reconfigure({ url: 'http://192.111.0.222' })
  })

  it('returns undefined for null input', () => {
    expect(toAbsoluteUrl(null)).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    expect(toAbsoluteUrl(undefined)).toBeUndefined()
  })

  it('returns absolute URL unchanged if already absolute (http)', () => {
    const url = 'http://example.com/image.jpg'
    expect(toAbsoluteUrl(url)).toBe(url)
  })

  it('returns absolute URL unchanged if already absolute (https)', () => {
    const url = 'https://example.com/image.jpg'
    expect(toAbsoluteUrl(url)).toBe(url)
  })

  it('converts relative URL with leading slash to absolute URL', () => {
    expect(toAbsoluteUrl('/images/recipes/123.webp')).toBe(
      'http://192.111.0.222/images/recipes/123.webp'
    )
  })

  it('converts relative URL without leading slash to absolute URL', () => {
    expect(toAbsoluteUrl('images/recipes/123.webp')).toBe(
      'http://192.111.0.222/images/recipes/123.webp'
    )
  })
})
