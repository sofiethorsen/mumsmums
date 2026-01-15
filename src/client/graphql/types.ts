// TODO: generate types, having issues generating from the ktor schema due to anonymous operations

export interface Ingredient {
    name: string,
    volume: string,
    quantity: number,
    recipeId: number | undefined,
}

export interface IngredientSection {
    name: string | undefined,
    ingredients: Ingredient[],
}

export interface Recipe {
    recipeId: number,
    name: string,
    description: string | undefined,
    servings: number | undefined,
    numberOfUnits: number | undefined,
    ingredientSections: IngredientSection[],
    steps: string[],
    imageUrl: string | undefined,
    fbPreviewImageUrl: string | undefined
}

export type RecipePreview = Pick<Recipe, 'recipeId' | 'name' | 'imageUrl' | 'description' | 'steps' | 'servings' | 'numberOfUnits'>

export interface GetRecipeByIdQueryResult {
    recipe: Recipe
}

export interface GetRecipePreviewsQueryResult {
    recipes: RecipePreview[]
}

export interface GetRecipeIdsQueryResult {
    recipes: Pick<Recipe, 'recipeId'>[]
}
