import type { FC } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import styles from './ImageGrid.module.css'

import Link from 'next/link'
import type { GetRecipePreviewsQuery } from '../../graphql/generated'
import RecipeImage from '../RecipeImage/RecipeImage'
import { ClockIcon, UsersIcon } from '../icons'
import { localized } from '../../i18n'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface ImageGridProps {
    recipes: RecipePreview[]
}

const ImageGrid: FC<ImageGridProps> = ({ recipes }) => {
    const t = useTranslations('recipe')
    const locale = useLocale()

    return (
        <div className={styles.grid}>
            {recipes.map((recipe: RecipePreview, index: number) => {
                const name = localized(recipe.nameSv, recipe.nameEn, locale)
                const description = localized(recipe.descriptionSv ?? '', recipe.descriptionEn, locale)
                const steps = locale === 'en' && recipe.stepsEn.length > 0 ? recipe.stepsEn : recipe.stepsSv

                return (
                    <Link className={styles.card} href={`/recipe/${recipe.recipeId}`} key={index}>
                        <div className={styles.imageContainer}>
                            <RecipeImage
                                imageUrl={recipe.imageUrl}
                                imageAltText={name}
                                priority={index === 0} // LCP optimization: load first image immediately
                            />
                            <div className={styles.imageOverlay} />
                            <div className={styles.recipeName}>
                                {name}
                            </div>
                        </div>
                        <div className={styles.cardContent}>
                            {description && (
                                <p className={styles.description}>{description}</p>
                            )}
                            <div className={styles.metadata}>
                                <span className={styles.metaItem}>
                                    <ClockIcon size={16} />
                                    {t('steps', { count: steps.length })}
                                </span>
                                {recipe.servings && (
                                    <span className={styles.metaItem}>
                                        <UsersIcon size={16} />
                                        {t('servings', { count: recipe.servings })}
                                    </span>
                                )}
                                {recipe.numberOfUnits && (
                                    <span className={styles.metaItem}>
                                        <UsersIcon size={16} />
                                        {t('units', { count: recipe.numberOfUnits })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export default ImageGrid
