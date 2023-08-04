import { gql } from '@apollo/client'

export const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($recipeId: Int!) {
    recipe(id: $recipeId) {
      id,
      name,
      steps,
      servings,
      numberOfUnits,
      ingredientSections {
        name,
        ingredients {
          name,
          volume,
          quantity,
        }
      }
      imageUrl
    }
  }
`
