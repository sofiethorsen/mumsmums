import React from 'react'
import styles from './RecipeDesktop.module.css'

import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'
import IngredientsCard from '../IngredientsCard/IngredientsCard'

import { Recipe } from '../../graphql/types'

interface RecipeProps {
    recipe: Recipe
}

const RecipeDesktop: React.FC<RecipeProps> = ({ recipe }) => {
    return (
        <>
            <div className={styles.wrapper}>
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
                                            <li className={styles.listItem} key={`step-${index}`}>{step}</li>)
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
        </>
    )
}

export default RecipeDesktop
