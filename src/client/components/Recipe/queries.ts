import { gql } from '@apollo/client'

export const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($recipeId: Long!) {
    recipe(recipeId: $recipeId) {
      recipeId,
      name,
      steps,
      servings,
      description,
      numberOfUnits,
      ingredientSections {
        name,
        ingredients {
          name,
          volume,
          quantity,
          recipeId,
        }
      }
      imageUrl,
      fbPreviewImageUrl,
    }
  }
`
