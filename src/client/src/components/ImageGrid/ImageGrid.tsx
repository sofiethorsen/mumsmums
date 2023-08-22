import React from 'react'
import styles from './ImageGrid.module.css'

import { Link } from 'react-router-dom'
import { Recipe } from '../../graphql/client/types'
import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'

interface ImageGridProps {
  recipes: Recipe[]
}

const ImageGrid: React.FC<ImageGridProps> = ({ recipes }) => {

  return (
    <div className={styles.grid}>
      {recipes.map((recipe: Recipe, index: number) => (
        <Link to={`/recipe/${recipe.recipeId}`} key={index}>
          <SquareRecipeImage
            imageUrl={recipe.imageUrl}
            imageAltText={recipe.name}
            recipeId={recipe.recipeId}
          />
          <div className={styles.name}>
            {recipe.name}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ImageGrid
