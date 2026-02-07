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
