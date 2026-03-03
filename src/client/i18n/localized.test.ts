import { localized } from './localized'

describe('localized', () => {
    it('returns Swedish value for sv locale', () => {
        expect(localized('Svenska', 'English', 'sv')).toBe('Svenska')
    })

    it('returns English value for en locale when English is available', () => {
        expect(localized('Svenska', 'English', 'en')).toBe('English')
    })

    it('falls back to Swedish for en locale when English is null', () => {
        expect(localized('Svenska', null, 'en')).toBe('Svenska')
    })

    it('falls back to Swedish for en locale when English is undefined', () => {
        expect(localized('Svenska', undefined, 'en')).toBe('Svenska')
    })

    it('falls back to Swedish for en locale when English is empty string', () => {
        expect(localized('Svenska', '', 'en')).toBe('Svenska')
    })

    it('returns Swedish for unknown locale', () => {
        expect(localized('Svenska', 'English', 'de')).toBe('Svenska')
    })
})
