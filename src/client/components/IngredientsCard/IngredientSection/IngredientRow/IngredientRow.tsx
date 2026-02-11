import React from 'react'

import Link from 'next/link'
import styles from './IngredientRow.module.css'

import type { Ingredient } from '../../../../graphql/generated'

interface IngredientRowProps {
    ingredient: Ingredient
}

// Reserved ID for "no unit" entry in unit_library
const NO_UNIT_ID = 2362809692160

// Format quantity to remove floating point errors and unnecessary decimals
const formatQuantity = (quantity: number): string => {
    // Round to 2 decimal places to avoid floating point precision errors
    const rounded = Math.round(quantity * 100) / 100
    // Convert to string and remove trailing zeros ONLY after decimal point
    return rounded.toString().replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

const IngredientRow: React.FC<IngredientRowProps> = ({ ingredient }) => {
    const quantity = ingredient.quantity ? `${formatQuantity(ingredient.quantity)} ` : ''
    const isNoUnit = ingredient.unitId === NO_UNIT_ID
    const volume = !isNoUnit && ingredient.volume && `${ingredient.volume} `
    const hasRecipeId = Boolean(ingredient.recipeId)

    if (hasRecipeId) {
        return (
            <Link className={styles.ingredientLink} href={`/recipe/${ingredient.recipeId}`}>
                <div className={styles.ingredient}>{quantity}{volume}{ingredient.name}</div>
            </Link >
        )
    } else {
        return (
            <div className={styles.ingredient}>{quantity}{volume}{ingredient.name}</div>
        )
    }
}

export default IngredientRow
