import React from 'react'

import styles from './SquareRecipeImage.module.css'
import generateHexColor from './colorGenerator'

interface SquareImageProps {
    imageUrl: string | undefined
    imageAltText: string
    recipeId: number
}

const renderImageOrPlaceholder = (imageUrl: string | undefined, imageAltText: string, recipeId: number) => {
    if (imageUrl && imageUrl.length > 0) {
        return (
            <img
                src={imageUrl}
                alt={imageAltText}
                className={styles.squareImage}
            />
        )
    } else {
        return (
            <div
                className={styles.placeHolder}
                style={{ backgroundColor: generateHexColor(recipeId) }}
            />
        );
    }
};


const SquareRecipeImage: React.FC<SquareImageProps> = ({ imageUrl, imageAltText, recipeId }) => {
    return (
        <div className={styles.imageContainer}>
            {renderImageOrPlaceholder(imageUrl, imageAltText, recipeId)}
        </div>
    )
}

export default SquareRecipeImage
