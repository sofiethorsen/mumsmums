import React, { useState } from 'react'
import styles from './RecipeMobile.module.css'

import IngredientsCard from '../IngredientsCard/IngredientsCard'
import RecipeImage from '../RecipeImage/RecipeImage'
import UsedInSection from '../UsedInSection/UsedInSection'
import { ClockIcon, UsersIcon } from '../icons'

import type { GetRecipeByIdQuery } from '../../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

interface RecipeProps {
    recipe: Recipe
}

const RecipeMobile: React.FC<RecipeProps> = ({ recipe }) => {
    const [multiplier, setMultiplier] = useState(1)

    const scaledServings = recipe.servings ? recipe.servings * multiplier : null
    const scaledUnits = recipe.numberOfUnits ? recipe.numberOfUnits * multiplier : null

    return (
        <div className={styles.wrapper}>
            {/* Hero image section */}
            <div className={styles.heroSection}>
                <div className={styles.imageContainer}>
                    <RecipeImage
                        imageUrl={recipe.imageUrl}
                        imageAltText={recipe.name}
                        priority
                    />
                    <div className={styles.imageOverlay} />
                    <div className={styles.heroTitle}>
                        <h1 className={styles.recipeName}>{recipe.name}</h1>
                    </div>
                </div>
            </div>

            {/* Meta information */}
            <div className={styles.metaSection}>
                {recipe.description && (
                    <p className={styles.description}>{recipe.description}</p>
                )}
                <div className={styles.metaInfo}>
                    <span className={styles.metaItem}>
                        <ClockIcon size={16} />
                        {recipe.steps.length} steg
                    </span>
                    {scaledServings && (
                        <span className={styles.metaItem}>
                            <UsersIcon size={16} />
                            {scaledServings} portioner
                        </span>
                    )}
                    {scaledUnits && (
                        <span className={styles.metaItem}>
                            <UsersIcon size={16} />
                            {scaledUnits} st
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
                        <h2 className={styles.sectionTitle}>Gör så här</h2>
                        <ol className={styles.stepsList}>
                            {recipe.steps.map((step: string, index: number) => (
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
