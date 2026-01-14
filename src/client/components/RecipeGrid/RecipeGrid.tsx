import React from 'react'
import styles from './RecipeGrid.module.css'
import { RecipePreview } from '../../graphql/types'
import ImageGrid from '../ImageGrid/ImageGrid'

interface RecipeGridProps {
    recipes: RecipePreview[]
    searchQuery: string
    loading?: boolean
    error?: { message: string }
}

const RecipeGrid: React.FC<RecipeGridProps> = ({ recipes, searchQuery, loading = false, error }) => {
    if (loading) return null
    if (error) return <p>Error: {error.message}</p>

    const hasSearchQuery = searchQuery && searchQuery.length >= 2
    const hasResults = recipes && recipes.length > 0

    return (
        <div className={styles.container}>
            {hasSearchQuery && (
                <p className={styles.searchResults}>
                    {hasResults
                        ? `${recipes.length} recept hittade för "${searchQuery}"`
                        : `Inga recept matchade din sökning "${searchQuery}"`}
                </p>
            )}

            {hasResults ? (
                <ImageGrid recipes={recipes} />
            ) : (
                hasSearchQuery && (
                    <div className={styles.emptyState}>
                        <p>Försök med ett annat sökord</p>
                    </div>
                )
            )}
        </div>
    )
}

export default RecipeGrid
