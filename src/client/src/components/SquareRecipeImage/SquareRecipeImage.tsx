import React from 'react'

import styles from './SquareRecipeImage.module.css'

interface SquareImageProps {
    imageUrl: string
    imageAltText: string
}

const SquareRecipeImage: React.FC<SquareImageProps> = ({ imageUrl, imageAltText }) => {
    return (
        <div className={styles.imageContainer}>
            <img
                src={imageUrl}
                alt={imageAltText}
                className={styles.squareImage}
            />
        </div>
    )
}

export default SquareRecipeImage
