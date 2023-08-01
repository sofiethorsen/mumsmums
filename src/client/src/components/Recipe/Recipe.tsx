import React from 'react'
import styles from './Recipe.module.css'

import ErrorMessage from '../ErrorMessage/ErrorMessage'
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

interface RecipeProps {
  recipeId: number
}

const Recipe: React.FC<RecipeProps> = ({ recipeId }) => {
  const { loading, error, data } = useQuery(GET_RECIPE_BY_ID, {
    variables: { recipeId: recipeId },
  })

  if (loading) return null
  if (error) return <p>Error: {error.message}</p>

  const recipe = data.recipe

  if (recipe === null || undefined) {
    return <ErrorMessage />
  }

  return (
    <div className={styles.recipe}>
      <h2>{recipe.name}</h2>
      <div>{recipe.instruction}</div>
    </div>
  )
}

export default Recipe
