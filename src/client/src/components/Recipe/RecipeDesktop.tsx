import React from 'react'
import styles from './RecipeDesktop.module.css'

import ErrorMessage from '../ErrorMessage/ErrorMessage'
import { useQuery } from '@apollo/client'

import { GET_RECIPE_BY_ID } from './queries'
import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'
import IngredientsCard from '../IngredientsCard/IngredientsCard'

interface RecipeProps {
    recipeId: number
}

const RecipeDesktop: React.FC<RecipeProps> = ({ recipeId }) => {
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
            <div className={styles.columns}>
                <div className={styles.leftColumn}>
                    <IngredientsCard recipe={recipe} />
                </div>
                <div className={styles.middleColumn}>
                    <div className={styles.instruction}>
                        <div className={styles.instructionCard} >
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
                <div className={styles.rightColumn}>
                    <div className={styles.imageWrapper}>
                        <SquareRecipeImage
                            imageUrl={recipe.imageUrl}
                            imageAltText={recipe.name}
                            recipeId={recipe.recipeId}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default RecipeDesktop
