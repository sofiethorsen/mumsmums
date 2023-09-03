import React from 'react'

import styles from './IngredientSection.module.css'

import { Ingredient, IngredientSection as IngredientSectionType } from '../../../graphql/client/types'
import IngredientRow from './IngredientRow/IngredientRow'

interface IngredientSectionProps {
    section: IngredientSectionType
}

const IngredientSection: React.FC<IngredientSectionProps> = ({ section }) => {
    return (
        <div className={styles.section}>
            {section.name && <div className={styles.sectionTitle}>{section.name}</div>}
            <div className={styles.ingredients}>
                {section.ingredients.map((ingredient: Ingredient, index: number) => (
                    <IngredientRow key={index} ingredient={ingredient} />
                ))
                }
            </div>
        </div>
    )
}

export default IngredientSection
