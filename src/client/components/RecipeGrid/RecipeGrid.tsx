import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import styles from './RecipeGrid.module.css'
import type { GetRecipePreviewsQuery } from '../../graphql/generated'
import ImageGrid from '../ImageGrid/ImageGrid'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface RecipeGridProps {
    recipes: RecipePreview[]
    searchQuery: string
    selectedIngredientCount?: number
    selectedCategoryCount?: number
    loading?: boolean
    error?: { message: string }
}

const RecipeGrid: FC<RecipeGridProps> = ({ recipes, searchQuery, selectedIngredientCount, selectedCategoryCount, loading = false, error }) => {
    const t = useTranslations('recipeGrid')

    if (loading) return null
    if (error) return <p>Error: {error.message}</p>

    const isIngredientSearch = selectedIngredientCount != null && selectedIngredientCount > 0
    const isCategoryFilter = selectedCategoryCount != null && selectedCategoryCount > 0
    const hasSearchQuery = searchQuery && searchQuery.length >= 2
    const hasResults = recipes && recipes.length > 0

    return (
        <div className={styles.container}>
            {isCategoryFilter && !isIngredientSearch && !hasSearchQuery && (
                <p className={styles.searchResults}>
                    {hasResults
                        ? t('categoryResults', { count: recipes.length })
                        : t('noCategoryResults')}
                </p>
            )}

            {isIngredientSearch && (
                <p className={styles.searchResults}>
                    {hasResults
                        ? t('ingredientResults', { count: recipes.length, ingredientCount: selectedIngredientCount })
                        : t('noIngredientResults')}
                </p>
            )}

            {!isIngredientSearch && hasSearchQuery && (
                <p className={styles.searchResults}>
                    {hasResults
                        ? t('recipesFound', { count: recipes.length, query: searchQuery })
                        : t('noResults', { query: searchQuery })}
                </p>
            )}

            {hasResults ? (
                <ImageGrid recipes={recipes} />
            ) : (
                (hasSearchQuery || isIngredientSearch || isCategoryFilter) && (
                    <div className={styles.emptyState}>
                        <p>{t('tryAnother')}</p>
                    </div>
                )
            )}
        </div>
    )
}

export default RecipeGrid
