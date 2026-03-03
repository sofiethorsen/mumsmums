import { useState, type FC } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import styles from './RecipeMobile.module.css'

import IngredientsCard from '../IngredientsCard/IngredientsCard'
import RecipeImage from '../RecipeImage/RecipeImage'
import UsedInSection from '../UsedInSection/UsedInSection'
import { ClockIcon, UsersIcon } from '../icons'
import { localized } from '../../i18n'

import type { GetRecipeByIdQuery } from '../../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

interface RecipeProps {
    recipe: Recipe
}

const RecipeMobile: FC<RecipeProps> = ({ recipe }) => {
    const t = useTranslations('recipe')
    const locale = useLocale()
    const [multiplier, setMultiplier] = useState(1)

    const name = localized(recipe.nameSv, recipe.nameEn, locale)
    const description = localized(recipe.descriptionSv ?? '', recipe.descriptionEn, locale)
    const steps = locale === 'en' && recipe.stepsEn.length > 0 ? recipe.stepsEn : recipe.stepsSv
    const scaledServings = recipe.servings ? recipe.servings * multiplier : null
    const scaledUnits = recipe.numberOfUnits ? recipe.numberOfUnits * multiplier : null

    return (
        <div className={styles.wrapper}>
            {/* Hero image section */}
            <div className={styles.heroSection}>
                <div className={styles.imageContainer}>
                    <RecipeImage
                        imageUrl={recipe.imageUrl}
                        imageAltText={name}
                        priority
                    />
                    <div className={styles.imageOverlay} />
                    <div className={styles.heroTitle}>
                        <h1 className={styles.recipeName}>{name}</h1>
                    </div>
                </div>
            </div>

            {/* Meta information */}
            <div className={styles.metaSection}>
                {description && (
                    <p className={styles.description}>{description}</p>
                )}
                <div className={styles.metaInfo}>
                    <span className={styles.metaItem}>
                        <ClockIcon size={16} />
                        {t('steps', { count: steps.length })}
                    </span>
                    {scaledServings && (
                        <span className={styles.metaItem}>
                            <UsersIcon size={16} />
                            {t('servings', { count: scaledServings })}
                        </span>
                    )}
                    {scaledUnits && (
                        <span className={styles.metaItem}>
                            <UsersIcon size={16} />
                            {t('units', { count: scaledUnits })}
                        </span>
                    )}
                </div>
            </div>

            {/* Content sections */}
            <div className={styles.contentSection}>
                <div className={styles.ingredientsSection}>
                    <IngredientsCard recipe={recipe} multiplier={multiplier} onMultiplierChange={setMultiplier} />
                </div>

                <div className={styles.instructionsSection}>
                    <div className={styles.instructionCard}>
                        <h2 className={styles.sectionTitle}>{t('instructionsTitle')}</h2>
                        <ol className={styles.stepsList}>
                            {steps.map((step: string, index: number) => (
                                <li className={styles.stepItem} key={`step-${index}`}>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {recipe.usedIn && recipe.usedIn.length > 0 && (
                    <div className={styles.usedInSection}>
                        <UsedInSection recipes={recipe.usedIn} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecipeMobile
