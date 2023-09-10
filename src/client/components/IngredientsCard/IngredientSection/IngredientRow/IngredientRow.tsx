import React from 'react'

import Link from 'next/link'
import styles from './IngredientRow.module.css'

import { Ingredient } from '../../../../graphql/types'

interface IngredientRowProps {
    ingredient: Ingredient
}

const IngredientRow: React.FC<IngredientRowProps> = ({ ingredient }) => {
    const quantity = ingredient.quantity && `${ingredient.quantity} `
    const volume = ingredient.volume && `${ingredient.volume} `
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
