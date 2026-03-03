import type { FC } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import styles from './UsedInSection.module.css'
import RecipeImage from '../RecipeImage/RecipeImage'
import type { RecipeReference } from '../../graphql/generated'
import { localized } from '../../i18n'

interface UsedInSectionProps {
    recipes: RecipeReference[]
}

const UsedInSection: FC<UsedInSectionProps> = ({ recipes }) => {
    const t = useTranslations('usedIn')
    const locale = useLocale()

    if (!recipes || recipes.length === 0) {
        return null
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>{t('title')}</h2>
            <div className={styles.carousel}>
                {recipes.map((recipe) => {
                    const name = localized(recipe.nameSv, recipe.nameEn, locale)
                    return (
                        <Link
                            key={recipe.recipeId}
                            href={`/recipe/${recipe.recipeId}`}
                            className={styles.card}
                        >
                            <div className={styles.imageContainer}>
                                <RecipeImage
                                    imageUrl={recipe.imageUrl}
                                    imageAltText={name}
                                />
                                <div className={styles.imageOverlay} />
                                <div className={styles.recipeName}>{name}</div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default UsedInSection
