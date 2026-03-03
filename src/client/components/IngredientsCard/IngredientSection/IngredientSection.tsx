import type { FC } from 'react'
import { useLocale } from 'next-intl'

import styles from './IngredientSection.module.css'

import type { Ingredient, IngredientSection as IngredientSectionType } from '../../../graphql/generated'
import IngredientRow from './IngredientRow/IngredientRow'
import { localized } from '../../../i18n'

interface IngredientSectionProps {
    section: IngredientSectionType
}

const IngredientSection: FC<IngredientSectionProps> = ({ section }) => {
    const locale = useLocale()
    const sectionName = section.nameSv ? localized(section.nameSv, section.nameEn, locale) : null

    return (
        <div className={styles.section}>
            {sectionName && <div className={styles.sectionTitle}>{sectionName}</div>}
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
