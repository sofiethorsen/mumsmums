import React from 'react'
import styles from './RecipeMobile.module.css'

import ErrorMessage from '../ErrorMessage/ErrorMessage'
import { Ingredient, IngredientSection } from '../../graphql/client/types'
import { useQuery } from '@apollo/client'

import SquareRecipeImage from '../SquareRecipeImage/SquareRecipeImage'

import { GET_RECIPE_BY_ID } from './queries'

interface RecipeProps {
    recipeId: number
}

const renderServingsOrUnitsInfo = (servings: number | undefined, numberOfUnits: number | undefined) => {
    const info = (numberOfUnits && `${numberOfUnits} st`) || `${servings} port.`

    return (
        <div className={styles.servings}>
            {info}
        </div>
    )
}

const renderSectionTitle = (name: string | undefined) => {
    if (name) {
        return <div className={styles.sectionTitle}>{name}</div>
    } else {
        return null
    }
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
                        <div className={styles.ingredientsCard}>
                            <div className={styles.title}>Ingredienser</div>
                            {renderServingsOrUnitsInfo(recipe.servings, recipe.numberOfUnits)}
                            {recipe.ingredientSections.map((section: IngredientSection, index: number) => renderIngredientSection(section, index))}
                        </div>
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
