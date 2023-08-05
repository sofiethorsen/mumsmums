import React from 'react'
import { Link } from 'react-router-dom'

import styles from './IngredientsCard.module.css'

import { Recipe, Ingredient, IngredientSection } from '../../graphql/client/types'

interface IngredientsCardProps {
    recipe: Recipe
}

const renderServingsOrUnitsInfo = (servings: number | undefined, numberOfUnits: number | undefined) => {
    const info = (numberOfUnits && `${numberOfUnits} st`) || `${servings} port.`

    return (
        <div className={styles.servings}>
            {info}
        </div>
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
    const hasRecipeId = Boolean(ingredient.recipeId)

    if (hasRecipeId) {
        return (
            <Link className={styles.ingredientLink} to={`/recipe/${ingredient.recipeId}`} key={index}>
                <div className={styles.ingredient} key={`ingredient-${index}`}>{quantity}{volume}{ingredient.name}</div>
            </Link >
        )
    } else {
        return (
            <div className={styles.ingredient} key={`ingredient-${index}`}>{quantity}{volume}{ingredient.name}</div>
        )
    }
}

const IngredientsCard: React.FC<IngredientsCardProps> = ({ recipe }) => {
    return (
        <div className={styles.ingredientsCard}>
            <div className={styles.title}>Ingredienser</div>
            {renderServingsOrUnitsInfo(recipe.servings, recipe.numberOfUnits)}
            {recipe.ingredientSections.map((section: IngredientSection, index: number) => renderIngredientSection(section, index))}
        </div>
    )
}

export default IngredientsCard
