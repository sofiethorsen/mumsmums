import { toAbsoluteUrl } from '../constants/urls'
import { localized } from '../i18n'
import type { GetRecipeByIdQuery } from '../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>
type Ingredient = Recipe['ingredientSections'][number]['ingredients'][number]

export function formatIngredient(ingredient: Ingredient): string {
    const parts: (string | number)[] = []
    if (ingredient.quantity) parts.push(ingredient.quantity)
    if (ingredient.volume) parts.push(ingredient.volume)
    parts.push(ingredient.name)
    return parts.join(' ')
}

export function generateRecipeJsonLd(recipe: Recipe, locale: string = 'sv') {
    const ingredients = recipe.ingredientSections.flatMap(section =>
        section.ingredients.map(formatIngredient)
    )

    const steps = locale === 'en' && recipe.stepsEn.length > 0 ? recipe.stepsEn : recipe.stepsSv
    const instructions = steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
    }))

    const yieldServings = locale === 'en' ? 'servings' : 'portioner'
    const yieldUnits = locale === 'en' ? 'pcs' : 'st'

    return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: localized(recipe.nameSv, recipe.nameEn, locale),
        description: localized(recipe.descriptionSv ?? '', recipe.descriptionEn, locale) || undefined,
        image: toAbsoluteUrl(recipe.imageUrl),
        recipeYield: recipe.servings
            ? `${recipe.servings} ${yieldServings}`
            : recipe.numberOfUnits
                ? `${recipe.numberOfUnits} ${yieldUnits}`
                : undefined,
        recipeIngredient: ingredients,
        recipeInstructions: instructions,
    }
}
