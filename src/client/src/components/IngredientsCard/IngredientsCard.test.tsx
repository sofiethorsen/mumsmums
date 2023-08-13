import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import IngredientsCard from './IngredientsCard'

describe('IngredientsCard', () => {
    it('should render an image with the expected properties', async () => {
        const section = {
            name: "Section",
            ingredients: [

            ]
        }
        const steps = [
            "step one",
            "step two",
            "step three",
        ]
        const recipe = {
            recipeId: 1,
            name: "Foo",
            numberOfUnits: 12,
            servings: 6,
            steps,
            ingredientSections: [section],
            imageUrl: "foo",
        }

        render(<IngredientsCard recipe={recipe} />)
    })
})
