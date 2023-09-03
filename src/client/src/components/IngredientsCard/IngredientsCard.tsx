import React, { useEffect, useState } from 'react'

import styles from './IngredientsCard.module.css'

import { Recipe } from '../../graphql/client/types'
import IngredientSection from './IngredientSection/IngredientSection'

interface IngredientsCardProps {
    recipe: Recipe
}

const MULTIPLIERS = [0.5, 1, 1.5, 2]

const IngredientsCard: React.FC<IngredientsCardProps> = ({ recipe }) => {
    const [multiplier, setMultiplier] = useState(1)
    const [originalAmount, setOriginalAmount] = useState(recipe.numberOfUnits || recipe.servings || 1)

    useEffect(() => {
        const value: number = (recipe.numberOfUnits || recipe.servings || 1) * multiplier
        setOriginalAmount(value)
    }, [])

    const handleMultiplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMultiplier = parseFloat(e.target.value)
        setMultiplier(newMultiplier)
    }

    const scaledRecipe = {
        ...recipe,
        servings: (recipe.servings && recipe.servings * multiplier),
        numberOfUnits: (recipe.numberOfUnits && recipe.numberOfUnits * multiplier),
        ingredientSections: recipe.ingredientSections.map((section) => ({
            ...section,
            ingredients: section.ingredients.map((ingredient) => ({
                ...ingredient,
                quantity: (ingredient.quantity && ingredient.quantity * multiplier) || ingredient.quantity,
            })),
        })),
    }

    const unit = (scaledRecipe.numberOfUnits && 'st') || (scaledRecipe.servings && 'port.')

    return (
        <div className={styles.ingredientsCard}>
            <div className={styles.title}>Ingredienser</div>
            <div className={styles.servings}>
                <label>
                    <select value={multiplier} onChange={handleMultiplierChange}>
                        {MULTIPLIERS.map((option, index) => (
                            <option key={index} value={option}>
                                {originalAmount * option} {unit}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            {scaledRecipe.ingredientSections.map((section, index) => <IngredientSection key={index} section={section} />)}
        </div>
    )
}

export default IngredientsCard
