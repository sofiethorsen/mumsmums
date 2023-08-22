import '@testing-library/jest-dom/extend-expect'

import generateHexColor from './colorGenerator'

describe('generateHexColor', () => {
    it('should generate a hex color', () => {
        const id = 0
        const hex = generateHexColor(id)

        expect(hex).toBe('#000000')
    })

    it('should generate different hex colors for different ids', () => {
        const idOne = 1
        const idTwo = 2
        const hexOne = generateHexColor(idOne)
        const hexTwo = generateHexColor(idTwo)

        expect(hexOne).not.toBe(hexTwo)
    })

    it('should generate the same hex colors for the same id', () => {
        const idOne = 1
        const hexOne = generateHexColor(idOne)
        const hexTwo = generateHexColor(idOne)

        expect(hexOne).toBe(hexTwo)
    })
})
