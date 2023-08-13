import React from 'react'
import { useQuery, gql } from '@apollo/client'
import styles from './RecipeGrid.module.css'

import ImageGrid from '../ImageGrid/ImageGrid'

const GET_RECIPES = gql`
  query {
    recipes {
      recipeId,
      name,
      imageUrl
    }
  }
`

const RecipeList = () => {
  const { loading, error, data } = useQuery(GET_RECIPES)

  if (loading) return null
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className={styles.container}>
      <div><h1>Topp mumsar</h1></div>
      <ImageGrid recipes={data.recipes} />
    </div>
  )
}

export default RecipeList
