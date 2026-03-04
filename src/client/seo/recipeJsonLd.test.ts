import { formatIngredient, generateRecipeJsonLd } from './recipeJsonLd'
import type { GetRecipeByIdQuery } from '../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

const createMockRecipe = (overrides: Partial<Recipe> = {}): Recipe => ({
    recipeId: 1,
    nameSv: 'Testrecept',
    nameEn: null,
    descriptionSv: 'Ett utsökt testrecept',
    descriptionEn: null,
    servings: 4,
    numberOfUnits: null,
    imageUrl: '/images/recipes/test.webp',
    ingredientSections: [
        {
            nameSv: 'Huvudingredienser',
            nameEn: null,
            ingredients: [
                { name: 'flour', quantity: 2, volume: 'dl', recipeId: null },
                { name: 'salt', quantity: null, volume: 'pinch', recipeId: null },
                { name: 'water', quantity: 3, volume: null, recipeId: null },
            ],
        },
    ],
    stepsSv: ['Blanda ingredienserna', 'Grädda i 20 minuter'],
    stepsEn: [],
    usedIn: [],
    categories: [],
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
        expect(result.name).toBe('Testrecept')
        expect(result.description).toBe('Ett utsökt testrecept')
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
                { nameSv: 'Deg', nameEn: null, ingredients: [{ name: 'mjöl', quantity: 2, volume: 'dl', recipeId: null }] },
                { nameSv: 'Fyllning', nameEn: null, ingredients: [{ name: 'socker', quantity: 1, volume: 'dl', recipeId: null }] },
            ],
        })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeIngredient).toEqual(['2 dl mjöl', '1 dl socker'])
    })

    it('generates instructions with positions', () => {
        const recipe = createMockRecipe({ stepsSv: ['Steg ett', 'Steg två', 'Steg tre'] })
        const result = generateRecipeJsonLd(recipe)

        expect(result.recipeInstructions).toEqual([
            { '@type': 'HowToStep', position: 1, text: 'Steg ett' },
            { '@type': 'HowToStep', position: 2, text: 'Steg två' },
            { '@type': 'HowToStep', position: 3, text: 'Steg tre' },
        ])
    })

    it('handles missing description', () => {
        const recipe = createMockRecipe({ descriptionSv: null })
        const result = generateRecipeJsonLd(recipe)

        expect(result.description).toBeUndefined()
    })

    describe('with English locale', () => {
        it('uses English name and description when available', () => {
            const recipe = createMockRecipe({
                nameEn: 'Test Recipe',
                descriptionEn: 'A delicious test recipe',
            })
            const result = generateRecipeJsonLd(recipe, 'en')

            expect(result.name).toBe('Test Recipe')
            expect(result.description).toBe('A delicious test recipe')
        })

        it('falls back to Swedish when English is not available', () => {
            const recipe = createMockRecipe()
            const result = generateRecipeJsonLd(recipe, 'en')

            expect(result.name).toBe('Testrecept')
            expect(result.description).toBe('Ett utsökt testrecept')
        })

        it('uses English steps when available', () => {
            const recipe = createMockRecipe({
                stepsEn: ['Mix the ingredients', 'Bake for 20 minutes'],
            })
            const result = generateRecipeJsonLd(recipe, 'en')

            expect(result.recipeInstructions).toEqual([
                { '@type': 'HowToStep', position: 1, text: 'Mix the ingredients' },
                { '@type': 'HowToStep', position: 2, text: 'Bake for 20 minutes' },
            ])
        })

        it('formats servings in English', () => {
            const recipe = createMockRecipe({ servings: 4, numberOfUnits: null })
            const result = generateRecipeJsonLd(recipe, 'en')

            expect(result.recipeYield).toBe('4 servings')
        })

        it('formats numberOfUnits in English', () => {
            const recipe = createMockRecipe({ servings: null, numberOfUnits: 12 })
            const result = generateRecipeJsonLd(recipe, 'en')

            expect(result.recipeYield).toBe('12 pcs')
        })
    })
})
