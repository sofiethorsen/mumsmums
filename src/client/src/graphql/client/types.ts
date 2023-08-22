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
    servings: number | undefined,
    numberOfUnits: number | undefined,
    ingredientSections: IngredientSection[],
    steps: string[],
    imageUrl: string | undefined,
}
