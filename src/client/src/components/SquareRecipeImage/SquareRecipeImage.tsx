import React from 'react'
import styles from './SquareRecipeImage.module.css'
import generateHexColor from './colorGenerator'

interface SquareImageProps {
    imageUrl: string | undefined
    imageAltText: string
    recipeId: number
}

const renderImage = (imageUrl: string, imageAltText: string) => {
    return <img
        src={imageUrl}
        alt={imageAltText}
        className={styles.squareImage}
    />
}

const renderPlaceHolder = (recipeId: number) => {
    return <div
        className={styles.placeHolder}
        style={{ backgroundColor: generateHexColor(recipeId) }}
    />
}

const SquareRecipeImage: React.FC<SquareImageProps> = ({ imageUrl, imageAltText, recipeId }) => {
    return (
        <div className={styles.imageContainer}>
            {imageUrl && imageUrl.length > 0 && renderImage(imageUrl, imageAltText)}
            {!imageUrl && renderPlaceHolder(recipeId)}
        </div>
    )
}

export default SquareRecipeImage
