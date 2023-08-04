import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import SquareRecipeImage from './SquareRecipeImage'

describe('SquareRecipeImage', () => {
    it('should render an image with the expected properties', async () => {
        const imageUrl = 'foo'
        const imageAltText = 'bar'


        const { getByAltText } = render(<SquareRecipeImage imageUrl={imageUrl} imageAltText={imageAltText} />)

        const imageElement = getByAltText(imageAltText)
        expect(imageElement).toBeInTheDocument()
        expect(imageElement).toHaveAttribute('src', imageUrl)
    })
})
