import { formatIngredient, generateRecipeJsonLd } from './recipeJsonLd'
import type { GetRecipeByIdQuery } from '../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    recipeId: 1,
    name: 'Test Recipe',
    description: 'A delicious test recipe',
    servings: 4,
    numberOfUnits: null,
    imageUrl: '/images/recipes/test.webp',
    ingredientSections: [
        {
            name: 'Main',
            ingredients: [
                { name: 'flour', quantity: 2, volume: 'dl', recipeId: null },
                { name: 'salt', quantity: null, volume: 'pinch', recipeId: null },
                { name: 'water', quantity: 3, volume: null, recipeId: null },
            ],
        },
    ],
    steps: ['Mix ingredients', 'Bake for 20 minutes'],
    usedIn: [],
    ...overrides,
})

describe('formatIngredient', () => {
    it('formats ingredient with quantity and volume', () => {
        const result = formatIngredient({ name: 'flour', quantity: 2, volume: 'dl', recipeId: null })
        expect(result).toBe('2 dl flour')
    })

    it('formats ingredient with only volume', () => {
        const result = formatIngredient({ name: 'salt', quantity: null, volume: 'pinch', recipeId: null })
        expect(result).toBe('pinch salt')
    })

    it('formats ingredient with only quantity', () => {
        const result = formatIngredient({ name: 'eggs', quantity: 3, volume: null, recipeId: null })
        expect(result).toBe('3 eggs')
    })

    it('formats ingredient with only name', () => {
        const result = formatIngredient({ name: 'parsley', quantity: null, volume: null, recipeId: null })
        expect(result).toBe('parsley')
    })
})

describe('generateRecipeJsonLd', () => {
    it('generates valid JSON-LD structure', () => {
        const recipe = createMockRecipe()
        const result = generateRecipeJsonLd(recipe)

        expect(result['@context']).toBe('https://schema.org')
        expect(result['@type']).toBe('Recipe')
        expect(result.name).toBe('Test Recipe')
        expect(result.description).toBe('A delicious test recipe')
    })

    it('formats servings as portioner', () => {
        const recipe = createMockRecipe({ servings: 4, numberOfUnits: null })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeYield).toBe('4 portioner')
    })

    it('formats numberOfUnits as st when no servings', () => {
        const recipe = createMockRecipe({ servings: null, numberOfUnits: 12 })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeYield).toBe('12 st')
    })

    it('prefers servings over numberOfUnits', () => {
        const recipe = createMockRecipe({ servings: 4, numberOfUnits: 12 })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeYield).toBe('4 portioner')
    })

    it('handles missing yield', () => {
        const recipe = createMockRecipe({ servings: null, numberOfUnits: null })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeYield).toBeUndefined()
    })

    it('flattens ingredients from all sections', () => {
        const recipe = createMockRecipe({
            ingredientSections: [
                { name: 'Dough', ingredients: [{ name: 'flour', quantity: 2, volume: 'dl', recipeId: null }] },
                { name: 'Filling', ingredients: [{ name: 'sugar', quantity: 1, volume: 'dl', recipeId: null }] },
            ],
        })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeIngredient).toEqual(['2 dl flour', '1 dl sugar'])
    })

    it('generates instructions with positions', () => {
        const recipe = createMockRecipe({ steps: ['Step one', 'Step two', 'Step three'] })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeInstructions).toEqual([
            { '@type': 'HowToStep', position: 1, text: 'Step one' },
            { '@type': 'HowToStep', position: 2, text: 'Step two' },
            { '@type': 'HowToStep', position: 3, text: 'Step three' },
        ])
    })

    it('handles missing description', () => {
        const recipe = createMockRecipe({ description: null })
        const result = generateRecipeJsonLd(recipe)

        expect(result.description).toBeUndefined()
    })
})
