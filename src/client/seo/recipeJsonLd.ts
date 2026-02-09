import { toAbsoluteUrl } from '../constants/urls'
import type { GetRecipeByIdQuery } from '../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>
type Ingredient = Recipe['ingredientSections'][number]['ingredients'][number]

export function formatIngredient(ingredient: Ingredient): string {
    const parts = []
    if (ingredient.quantity) parts.push(ingredient.quantity)
    if (ingredient.volume) parts.push(ingredient.volume)
    parts.push(ingredient.name)
    return parts.join(' ')
}

export function generateRecipeJsonLd(recipe: Recipe) {
    const ingredients = recipe.ingredientSections.flatMap(section =>
        section.ingredients.map(formatIngredient)
    )

    const instructions = recipe.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
    }))

    return {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.name,
        description: recipe.description || undefined,
        image: toAbsoluteUrl(recipe.imageUrl),
        recipeYield: recipe.servings
            ? `${recipe.servings} portioner`
            : recipe.numberOfUnits
                ? `${recipe.numberOfUnits} st`
                : undefined,
        recipeIngredient: ingredients,
        recipeInstructions: instructions,
    }
}
