import React from 'react'
import styles from './RecipeMobile.module.css'

import ErrorMessage from '../ErrorMessage/ErrorMessage'

import { useQuery } from '@apollo/client'

import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'
import IngredientsCard from '../IngredientsCard/IngredientsCard'

import { GET_RECIPE_BY_ID } from './queries'

interface RecipeProps {
    recipeId: number
}

const RecipeMobile: React.FC<RecipeProps> = ({ recipeId }) => {
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
        <div className={styles.container}>
            <div className={styles.recipeName}>{recipe.name}</div>
            <div className={styles.details}>
                <div>
                    <SquareRecipeImage imageUrl={recipe.imageUrl} imageAltText={Image.name} />
                    <div className={styles.ingredients}>
                        <IngredientsCard recipe={recipe} />
                    </div>
                </div>
                <div className={styles.instructions}>
                    <div className={styles.instructionsCard}>
                        <div className={styles.title}>Gör så här</div>
                        <div className={styles.steps}>
                            <ol>
                                {recipe.steps.map((step: string, index: number) => (
                                    <li key={`step-${index}`}>{step}</li>)
                                )}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecipeMobile
