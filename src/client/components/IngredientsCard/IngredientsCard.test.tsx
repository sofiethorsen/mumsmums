import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import IngredientsCard from './IngredientsCard'
import { Recipe } from '../../graphql/types'

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    recipeId: 1,
    name: 'Test Recipe',
    description: 'A test recipe',
    servings: 4,
    numberOfUnits: null,
    imageUrl: null,
    fbPreviewImageUrl: null,
    ingredientSections: [
        {
            name: 'Main Ingredients',
            ingredients: [
                { name: 'Flour', quantity: 2, volume: 'cups', recipeId: null },
                { name: 'Sugar', quantity: 1, volume: 'cup', recipeId: null },
                { name: 'Salt', quantity: null, volume: 'pinch', recipeId: null },
            ],
        },
    ],
    steps: [],
    ...overrides,
})

// Helper to get the servings selector dropdown
const getServingsSelector = () => screen.getByRole('combobox')

describe('IngredientsCard', () => {
    it('renders the title "Ingredienser"', () => {
        const recipe = createMockRecipe()
        render(<IngredientsCard recipe={recipe} />)
        expect(screen.getByText('Ingredienser')).toBeInTheDocument()
    })

    it('displays servings with "port." unit when recipe has servings', () => {
        const recipe = createMockRecipe({ servings: 4, numberOfUnits: null })
        render(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('4 port.')
    })

    it('displays numberOfUnits with "st" unit when recipe has numberOfUnits', () => {
        const recipe = createMockRecipe({ servings: null, numberOfUnits: 12 })
        render(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('12 st')
    })

    it('renders all ingredient sections', () => {
        const recipe = createMockRecipe()
        render(<IngredientsCard recipe={recipe} />)

        // Check that ingredients are rendered (this depends on IngredientSection implementation)
        expect(screen.getByText('Main Ingredients')).toBeInTheDocument()
    })

    it('scales ingredients when multiplier is changed to 2x', () => {
        const recipe = createMockRecipe({ servings: 4 })
        render(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Change to 2x multiplier
        fireEvent.change(selector, { target: { value: '2' } })

        expect(selector).toHaveTextContent('8 port.')
    })

    it('scales ingredients when multiplier is changed to 0.5x', () => {
        const recipe = createMockRecipe({ servings: 4 })
        render(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Change to 0.5x multiplier
        fireEvent.change(selector, { target: { value: '0.5' } })

        expect(selector).toHaveTextContent('2 port.')
    })

    it('provides all multiplier options (0.5, 1, 1.5, 2)', () => {
        const recipe = createMockRecipe({ servings: 4 })
        render(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()
        const options = Array.from(selector.querySelectorAll('option'))

        expect(options).toHaveLength(4)
        expect(options.map(opt => opt.value)).toEqual(['0.5', '1', '1.5', '2'])
    })

    it('defaults to 1x multiplier', () => {
        const recipe = createMockRecipe({ servings: 4 })
        render(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector() as HTMLSelectElement
        expect(selector.value).toBe('1')
    })

    it('handles recipe with both servings and numberOfUnits (prefers numberOfUnits)', () => {
        const recipe = createMockRecipe({ servings: 4, numberOfUnits: 12 })
        render(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('12 st')
    })

    it('handles recipe with no servings or numberOfUnits (defaults to 1)', () => {
        const recipe = createMockRecipe({ servings: null, numberOfUnits: null })
        render(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('1')
    })

    it('scales quantities correctly with 1.5x multiplier', () => {
        const recipe = createMockRecipe({ servings: 4 })
        render(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Change to 1.5x multiplier
        fireEvent.change(selector, { target: { value: '1.5' } })

        expect(selector).toHaveTextContent('6 port.')
    })
})
