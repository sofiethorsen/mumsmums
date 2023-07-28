import React from 'react'
import './ImageGrid.css'

import { Link } from 'react-router-dom'

const ImageGrid = ({ recipes }) => {

  return (
    <div className="grid">
      {recipes.map((recipe, index) => (
        <Link to={`/recipe/${recipe.id}`} key={index} className="square-image-link">
          <div key={index} className="square-image-container">
            <img
              src={recipe.imageUrl}
              alt="Cropped square image"
              className="square-image"
            />
          </div>
          <div className="name">
            {recipe.name}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ImageGrid
