import type { FC } from 'react'
import Link from 'next/link'
import styles from './UsedInSection.module.css'
import RecipeImage from '../RecipeImage/RecipeImage'
import type { RecipeReference } from '../../graphql/generated'

interface UsedInSectionProps {
    recipes: RecipeReference[]
}

const UsedInSection: FC<UsedInSectionProps> = ({ recipes }) => {
    if (!recipes || recipes.length === 0) {
        return null
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Ingår i</h2>
            <div className={styles.carousel}>
                {recipes.map((recipe) => (
                    <Link
                        key={recipe.recipeId}
                        href={`/recipe/${recipe.recipeId}`}
                        className={styles.card}
                    >
                        <div className={styles.imageContainer}>
                            <RecipeImage
                                imageUrl={recipe.imageUrl}
                                imageAltText={recipe.name}
                            />
                            <div className={styles.imageOverlay} />
                            <div className={styles.recipeName}>{recipe.name}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default UsedInSection
