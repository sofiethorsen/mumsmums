// TODO: generate types, having issues generating from the ktor schema due to anonymous operations

export interface Ingredient {
    name: string,
    volume: string,
    quantity: number
}

export interface Recipe {
    id: number,
    name: string,
    ingredients: Ingredient[],
    instruction: String,
    imageUrl: string,
}
