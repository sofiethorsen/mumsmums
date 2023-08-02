import React from 'react'
import styles from './Recipe.module.css'

import ErrorMessage from '../ErrorMessage/ErrorMessage'
import { Ingredient, IngredientSection } from '../../graphql/client/types'
import { useQuery, gql } from '@apollo/client'

const GET_RECIPE_BY_ID = gql`
  query GetRecipeById($recipeId: Int!) {
    recipe(id: $recipeId) {
      id,
      name,
      steps,
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

interface RecipeProps {
  recipeId: number
}

const renderSectionTitle = (name: string | undefined) => {
  if (name) {
    return <div className={styles.sectionTitle}>{name}</div>
  } else {
    return null
  }
}

const renderIngredient = (ingredient: Ingredient, index: number) => {
  const quantity = ingredient.quantity && `${ingredient.quantity} `
  const volume = ingredient.volume && `${ingredient.volume} `

  return (
    <div key={`ingredient-${index}`}>{quantity}{volume}{ingredient.name}</div>
  )
}

const renderIngredientSection = (section: IngredientSection, sectionIndex: number) => {
  return (
    <div key={`section-${sectionIndex}`} className={styles.section}>
      {renderSectionTitle(section.name)}
      <div className={styles.ingredients}>
        {section.ingredients.map((ingredient: Ingredient, index: number) => (
          renderIngredient(ingredient, index)
        ))
        }
      </div>
    </div>
  )
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
      <div className={styles.squareImageContainer}>
        <img
          src={recipe.imageUrl}
          alt="Cropped square image"
          className={styles.squareImage}
        />
      </div>
      <div className={styles.name}>
        {recipe.name}
      </div>
      <div className={styles.details}>
        <div className={styles.sections}>
          {recipe.ingredientSections.map((section: IngredientSection, index: number) => renderIngredientSection(section, index))}
        </div>
        <div className={styles.steps}>
          <ol>
            {recipe.steps.map((step: string, index: number) => (
              <li key={`step-${index}`}>{step}</li>)
            )}
          </ol>
        </div>

      </div>
    </div>
  )
}

export default Recipe
