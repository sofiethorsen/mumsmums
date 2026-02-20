import React from 'react'
import styles from './ImageGrid.module.css'

import Link from 'next/link'
import type { GetRecipePreviewsQuery } from '../../graphql/generated'
import RecipeImage from '../RecipeImage/RecipeImage'
import { ClockIcon, UsersIcon } from '../icons'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface ImageGridProps {
    recipes: RecipePreview[]
}

const ImageGrid: React.FC<ImageGridProps> = ({ recipes }) => {

    return (
        <div className={styles.grid}>
            {recipes.map((recipe: RecipePreview, index: number) => (
                <Link className={styles.card} href={`/recipe/${recipe.recipeId}`} key={index}>
                    <div className={styles.imageContainer}>
                        <RecipeImage
                            imageUrl={recipe.imageUrl}
                            imageAltText={recipe.name}
                            priority={index === 0} // LCP optimization: load first image immediately
                        />
                        <div className={styles.imageOverlay} />
                        <div className={styles.recipeName}>
                            {recipe.name}
                        </div>
                    </div>
                    <div className={styles.cardContent}>
                        {recipe.description && (
                            <p className={styles.description}>{recipe.description}</p>
                        )}
                        <div className={styles.metadata}>
                            <span className={styles.metaItem}>
                                <ClockIcon size={16} />
                                {recipe.steps.length} steg
                            </span>
                            {recipe.servings && (
                                <span className={styles.metaItem}>
                                    <UsersIcon size={16} />
                                    {recipe.servings} portioner
                                </span>
                            )}
                            {recipe.numberOfUnits && (
                                <span className={styles.metaItem}>
                                    <UsersIcon size={16} />
                                    {recipe.numberOfUnits} st
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default ImageGrid
