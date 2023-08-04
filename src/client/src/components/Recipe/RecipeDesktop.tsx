import React from 'react'
import styles from './RecipeDesktop.module.css'

import ErrorMessage from '../ErrorMessage/ErrorMessage'
import { Ingredient, IngredientSection } from '../../graphql/client/types'
import { useQuery } from '@apollo/client'

import { GET_RECIPE_BY_ID } from './queries'
import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'

interface RecipeProps {
    recipeId: number
}

const renderSectionTitle = (name: string | undefined) => {
    if (name) {
        return <div className={styles.sectionTitle}>{name}</div>
    } else {
        return null
    }
}

const renderServingsOrUnitsInfo = (servings: number | undefined, numberOfUnits: number | undefined) => {
    const info = (numberOfUnits && `${numberOfUnits} st`) || `${servings} port.`

    return (
        <div className={styles.servings}>
            {info}
        </div>
    )
}

const renderIngredient = (ingredient: Ingredient, index: number) => {
    const quantity = ingredient.quantity && `${ingredient.quantity} `
    const volume = ingredient.volume && `${ingredient.volume} `

    return (
        <div className={styles.ingredient} key={`ingredient-${index}`}>{quantity}{volume}{ingredient.name}</div>
    )
}

const renderIngredientSection = (section: IngredientSection, sectionIndex: number) => {
    return (
        <div key={`section-${sectionIndex}`} className={styles.section}>
            {renderSectionTitle(section.name)}
            <div className={styles.ingredients}>
                {section.ingredients.map((ingredient: Ingredient, index: number) => (
                    renderIngredient(ingredient, index)
                ))
                }
            </div>
        </div>
    )
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
                    <div>
                        <div className={styles.ingredientsCard}>
                            <div className={styles.title}>Ingredienser</div>
                            {renderServingsOrUnitsInfo(recipe.servings, recipe.numberOfUnits)}
                            {recipe.ingredientSections.map((section: IngredientSection, index: number) => renderIngredientSection(section, index))}
                        </div>
                    </div>

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
                        <SquareRecipeImage imageUrl={recipe.imageUrl} imageAltText={Image.name} />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default RecipeDesktop
