import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import styles from './RecipeGrid.module.css'
import type { GetRecipePreviewsQuery } from '../../graphql/generated'
import ImageGrid from '../ImageGrid/ImageGrid'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface RecipeGridProps {
    recipes: RecipePreview[]
    searchQuery: string
    loading?: boolean
    error?: { message: string }
}

const RecipeGrid: FC<RecipeGridProps> = ({ recipes, searchQuery, loading = false, error }) => {
    const t = useTranslations('recipeGrid')

    if (loading) return null
    if (error) return <p>Error: {error.message}</p>

    const hasSearchQuery = searchQuery && searchQuery.length >= 2
    const hasResults = recipes && recipes.length > 0

    return (
        <div className={styles.container}>
            {hasSearchQuery && (
                <p className={styles.searchResults}>
                    {hasResults
                        ? t('recipesFound', { count: recipes.length, query: searchQuery })
                        : t('noResults', { query: searchQuery })}
                </p>
            )}

            {hasResults ? (
                <ImageGrid recipes={recipes} />
            ) : (
                hasSearchQuery && (
                    <div className={styles.emptyState}>
                        <p>{t('tryAnother')}</p>
                    </div>
                )
            )}
        </div>
    )
}

export default RecipeGrid
