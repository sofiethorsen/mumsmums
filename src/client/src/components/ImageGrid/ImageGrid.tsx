import React from 'react'
import styles from './ImageGrid.module.css'

import { Link } from 'react-router-dom'

const ImageGrid = ({ recipes }) => {

  return (
    <div className={styles.grid}>
      {recipes.map((recipe, index) => (
        <Link to={`/recipe/${recipe.id}`} key={index}>
          <div key={index} className={styles.squareImageContainer}>
            <img
              src={recipe.imageUrl}
              alt="Cropped square image"
              className={styles.squareImage}
            />
          </div>
          <div className={styles.name}>
            {recipe.name}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ImageGrid
