import { gql } from '@apollo/client'

export const GET_RECIPE_PREVIEWS = gql`
    query GetRecipePreviews {
        recipes {
            recipeId
            name
            imageUrl
            description
            steps
            servings
            numberOfUnits
        }
    }
`

export const GET_RECIPES = gql`
    query GetRecipes {
        recipes {
            recipeId
            name
        }
    }
`

export const GET_RECIPE_BY_ID = gql`
    query GetRecipeById($recipeId: Long!) {
        recipe(recipeId: $recipeId) {
            recipeId
            name
            description
            servings
            numberOfUnits
            imageUrl
            ingredientSections {
                name
                ingredients {
                    name
                    volume
                    quantity
                    recipeId
                }
            }
            steps
            usedIn {
                recipeId
                name
                imageUrl
            }
        }
    }
`

// Mutations

export const CREATE_RECIPE = gql`
    mutation CreateRecipe($input: RecipeInput!) {
        createRecipe(input: $input) {
            recipeId
            name
        }
    }
`

export const DELETE_RECIPE = gql`
    mutation DeleteRecipe($recipeId: Long!) {
        deleteRecipe(recipeId: $recipeId)
    }
`

export const UPDATE_RECIPE = gql`
    mutation UpdateRecipe($recipeId: Long!, $input: RecipeInput!) {
        updateRecipe(recipeId: $recipeId, input: $input) {
            recipeId
            name
        }
    }
`

// Ingredient queries and mutations
export const GET_INGREDIENTS = gql`
    query GetIngredients {
        ingredients {
            id
            nameSv
            nameEn
            qualifierSv
            qualifierEn
            derivesFromId
            fullNameSv
            fullNameEn
        }
    }
`

export const CREATE_INGREDIENT = gql`
    mutation CreateIngredient($input: LibraryIngredientInput!) {
        createIngredient(input: $input) {
            id
            nameSv
            nameEn
            qualifierSv
            qualifierEn
            derivesFromId
            fullNameSv
            fullNameEn
        }
    }
`

export const UPDATE_INGREDIENT = gql`
    mutation UpdateIngredient($id: Long!, $input: LibraryIngredientInput!) {
        updateIngredient(id: $id, input: $input) {
            id
            nameSv
            nameEn
            qualifierSv
            qualifierEn
            derivesFromId
            fullNameSv
            fullNameEn
        }
    }
`

export const DELETE_INGREDIENT = gql`
    mutation DeleteIngredient($id: Long!) {
        deleteIngredient(id: $id)
    }
`

// Unit queries and mutations
export const GET_UNITS = gql`
    query GetUnits {
        units {
            id
            shortNameSv
            shortNameEn
            nameSv
            nameEn
            type
            mlEquivalent
            gEquivalent
        }
    }
`

export const CREATE_UNIT = gql`
    mutation CreateUnit($input: LibraryUnitInput!) {
        createUnit(input: $input) {
            id
            shortNameSv
            shortNameEn
            nameSv
            nameEn
            type
            mlEquivalent
            gEquivalent
        }
    }
`

export const UPDATE_UNIT = gql`
    mutation UpdateUnit($id: Long!, $input: LibraryUnitInput!) {
        updateUnit(id: $id, input: $input) {
            id
            shortNameSv
            shortNameEn
            nameSv
            nameEn
            type
            mlEquivalent
            gEquivalent
        }
    }
`

export const DELETE_UNIT = gql`
    mutation DeleteUnit($id: Long!) {
        deleteUnit(id: $id)
    }
`
