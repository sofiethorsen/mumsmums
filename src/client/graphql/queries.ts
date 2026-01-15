import { gql } from '@apollo/client'

export const GET_RECIPE_PREVIEWS = gql`
    query {
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
