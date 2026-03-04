import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import IngredientsCard from './IngredientsCard'
import type { GetRecipeByIdQuery } from '../../graphql/generated'
import { renderWithIntl } from '../../test-utils/renderWithIntl'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    recipeId: 1,
    nameSv: 'Testrecept',
    nameEn: null,
    descriptionSv: 'Ett testrecept',
    descriptionEn: null,
    servings: 4,
    numberOfUnits: null,
    imageUrl: null,
    ingredientSections: [
        {
            nameSv: 'Huvudingredienser',
            nameEn: null,
            ingredients: [
                { name: 'Mjöl', quantity: 2, volume: 'dl', recipeId: null },
                { name: 'Socker', quantity: 1, volume: 'dl', recipeId: null },
                { name: 'Salt', quantity: null, volume: 'nypa', recipeId: null },
            ],
        },
    ],
    stepsSv: [],
    stepsEn: [],
    usedIn: [],
    categories: [],
    ...overrides,
})

// Helper to get the servings selector dropdown
const getServingsSelector = () => screen.getByRole('combobox')

describe('IngredientsCard', () => {
    it('renders the title "Ingredienser"', () => {
        const recipe = createMockRecipe()
        renderWithIntl(<IngredientsCard recipe={recipe} />)
        expect(screen.getByText('Ingredienser')).toBeInTheDocument()
    })

    it('displays servings with "port." unit when recipe has servings', () => {
        const recipe = createMockRecipe({ servings: 4, numberOfUnits: null })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('4 port.')
    })

    it('displays numberOfUnits with "st" unit when recipe has numberOfUnits', () => {
        const recipe = createMockRecipe({ servings: null, numberOfUnits: 12 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('12 st')
    })

    it('renders all ingredient sections', () => {
        const recipe = createMockRecipe()
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        // Check that ingredients are rendered (this depends on IngredientSection implementation)
        expect(screen.getByText('Huvudingredienser')).toBeInTheDocument()
    })

    it('scales ingredients when multiplier is changed to 2x', () => {
        const recipe = createMockRecipe({ servings: 4 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Change to 2x multiplier
        fireEvent.change(selector, { target: { value: '2' } })

        expect(selector).toHaveTextContent('8 port.')
    })

    it('scales ingredients when multiplier is changed to 0.5x', () => {
        const recipe = createMockRecipe({ servings: 4 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Change to 0.5x multiplier
        fireEvent.change(selector, { target: { value: '0.5' } })

        expect(selector).toHaveTextContent('2 port.')
    })

    it('provides all multiplier options (0.5, 1, 1.5, 2)', () => {
        const recipe = createMockRecipe({ servings: 4 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()
        const options = Array.from(selector.querySelectorAll('option'))

        expect(options).toHaveLength(4)
        expect(options.map(opt => opt.value)).toEqual(['0.5', '1', '1.5', '2'])
    })

    it('defaults to 1x multiplier', () => {
        const recipe = createMockRecipe({ servings: 4 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector() as HTMLSelectElement
        expect(selector.value).toBe('1')
    })

    it('handles recipe with both servings and numberOfUnits (prefers numberOfUnits)', () => {
        const recipe = createMockRecipe({ servings: 4, numberOfUnits: 12 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('12 st')
    })

    it('handles recipe with no servings or numberOfUnits (defaults to 1)', () => {
        const recipe = createMockRecipe({ servings: null, numberOfUnits: null })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        expect(getServingsSelector()).toHaveTextContent('1')
    })

    it('scales quantities correctly with 1.5x multiplier', () => {
        const recipe = createMockRecipe({ servings: 4 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Change to 1.5x multiplier
        fireEvent.change(selector, { target: { value: '1.5' } })

        expect(selector).toHaveTextContent('6 port.')
    })

    it('displays correct options when user selects a new multiplier', () => {
        const recipe = createMockRecipe({ numberOfUnits: 30 })
        renderWithIntl(<IngredientsCard recipe={recipe} />)

        const selector = getServingsSelector()

        // Initially should show: 15, 30, 45, 60
        const initialOptions = Array.from(selector.querySelectorAll('option')).map(opt => opt.textContent)
        expect(initialOptions).toEqual(['15 st', '30 st', '45 st', '60 st'])

        // User selects 60 (multiplier 2)
        fireEvent.change(selector, { target: { value: '2' } })

        // Options should still show: 15, 30, 45, 60
        const optionsAfterChange = Array.from(selector.querySelectorAll('option')).map(opt => opt.textContent)
        expect(optionsAfterChange).toEqual(['15 st', '30 st', '45 st', '60 st'])

        // Selected value should be 60
        expect(selector).toHaveTextContent('60 st')
    })

    describe('Controlled multiplier behavior', () => {
        it('uses external multiplier prop when provided', () => {
            const recipe = createMockRecipe({ servings: 4 })
            renderWithIntl(<IngredientsCard recipe={recipe} multiplier={2} />)

            const selector = getServingsSelector() as HTMLSelectElement
            expect(selector.value).toBe('2')
            expect(selector).toHaveTextContent('8 port.')
        })

        it('calls onMultiplierChange when user changes selection', () => {
            const recipe = createMockRecipe({ servings: 4 })
            const handleChange = jest.fn()
            renderWithIntl(<IngredientsCard recipe={recipe} multiplier={1} onMultiplierChange={handleChange} />)

            const selector = getServingsSelector()
            fireEvent.change(selector, { target: { value: '2' } })

            expect(handleChange).toHaveBeenCalledWith(2)
        })

        it('does not call onMultiplierChange when used in uncontrolled mode', () => {
            const recipe = createMockRecipe({ servings: 4 })
            renderWithIntl(<IngredientsCard recipe={recipe} />)

            const selector = getServingsSelector()
            // This should work fine with internal state, no callback needed
            fireEvent.change(selector, { target: { value: '2' } })

            expect(selector).toHaveTextContent('8 port.')
        })

        it('maintains backwards compatibility when no multiplier props provided', () => {
            const recipe = createMockRecipe({ servings: 4 })
            renderWithIntl(<IngredientsCard recipe={recipe} />)

            const selector = getServingsSelector() as HTMLSelectElement

            // Starts at 1x
            expect(selector.value).toBe('1')

            // Can change internally
            fireEvent.change(selector, { target: { value: '1.5' } })
            expect(selector.value).toBe('1.5')
            expect(selector).toHaveTextContent('6 port.')
        })
    })

    describe('Quantity formatting', () => {
        it('displays clean decimal numbers without floating point errors', () => {
            const recipe = createMockRecipe({
                servings: 3,
                ingredientSections: [
                    {
                        nameSv: 'Test',
                        nameEn: null,
                        ingredients: [
                            { name: 'Testingrediens', quantity: 1.5, volume: 'dl', recipeId: null },
                        ],
                    },
                ],
            })
            renderWithIntl(<IngredientsCard recipe={recipe} />)

            // 1.5 cups should display as "1.5" not "1.5000000002"
            expect(screen.getByText(/1\.5\s+dl/)).toBeInTheDocument()
        })

        it('removes trailing zeros after decimal point', () => {
            const recipe = createMockRecipe({
                servings: 2,
                ingredientSections: [
                    {
                        nameSv: 'Test',
                        nameEn: null,
                        ingredients: [
                            { name: 'Testingrediens', quantity: 2.0, volume: 'dl', recipeId: null },
                        ],
                    },
                ],
            })
            renderWithIntl(<IngredientsCard recipe={recipe} />)

            // 2.0 should display as "2" not "2.0"
            expect(screen.getByText(/^2\s+dl/)).toBeInTheDocument()
        })
    })
})
