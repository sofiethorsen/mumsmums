import React from 'react'
import './Recipe.css'

import { useQuery, gql } from '@apollo/client'

const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($recipeId: Int!) {
    recipe(id: $recipeId) {
      id,
      name,
      instruction,
      imageUrl
    }
  }
`

export default function Recipe({ recipeId }) {
    const { loading, error, data } = useQuery(GET_RECIPE_BY_ID, {
        variables: { recipeId: recipeId },
    })

    if (loading) return null
    if (error) return <p>Error: {error.message}</p>

    const recipe = data.recipe

    return (
        <div className="recipe">
            <h2>{recipe.name}</h2>
            <div>{recipe.instruction}</div>
        </div>
    )
}
