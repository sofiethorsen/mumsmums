import React from 'react'
import styles from './RecipeMobile.module.css'

import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'
import IngredientsCard from '../IngredientsCard/IngredientsCard'

import { Recipe } from '../../graphql/types'

interface RecipeProps {
    recipe: Recipe
}

const RecipeMobile: React.FC<RecipeProps> = ({ recipe }) => {
    return (
        <>
            <div className={styles.wrapper}>
                <div className={styles.recipeName}>{recipe.name}</div>
                <div className={styles.details}>
                    <div>
                        <SquareRecipeImage
                            imageUrl={recipe.imageUrl}
                            imageAltText={recipe.name}
                            recipeId={recipe.recipeId}
                        />
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
                                        <li className={styles.listItem} key={`step-${index}`}>{step}</li>)
                                    )}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RecipeMobile
