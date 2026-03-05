import { useState, useMemo } from 'react'
import { useLocale } from 'next-intl'
import Fuse from 'fuse.js'
import PageFrame from '../../components/PageFrame/PageFrame'
import PageHead from '../../components/PageHead/PageHead'
import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter'
import HeroSection from '../../components/HeroSection/HeroSection'
import type { SearchTab } from '../../components/HeroSection/HeroSection'
import { useIngredients } from '../../hooks'
import { toAbsoluteUrl } from '../../constants/urls'
import type { GetRecipePreviewsQuery } from '../../graphql/generated'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface HomePageProps {
    recipes: RecipePreview[]
}

export default function HomePage({ recipes }: HomePageProps) {
    const locale = useLocale()
    const { ingredients: libraryIngredients } = useIngredients()
    const [searchTab, setSearchTab] = useState<SearchTab>('name')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([])
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])

    const availableCategories = useMemo(() => {
        if (!recipes) return []
        const seen = new Map<number, RecipePreview['categories'][number]>()
        for (const recipe of recipes) {
            for (const cat of recipe.categories) {
                if (!seen.has(cat.id)) seen.set(cat.id, cat)
            }
        }
        return Array.from(seen.values())
            .map((cat) => ({ id: cat.id, nameSv: cat.nameSv, nameEn: cat.nameEn ?? '' }))

            .sort((a, b) => a.nameSv.localeCompare(b.nameSv, 'sv'))
    }, [recipes])

    const filteredRecipes = useMemo(() => {
        if (!recipes) return []

        let result = recipes

        if (selectedCategoryIds.length > 0) {
            result = result.filter((recipe) =>
                recipe.categories.some((cat) => selectedCategoryIds.includes(cat.id))
            )
        }

        if (searchTab === 'ingredient') {
            if (selectedIngredientIds.length === 0) return result

            // For each selected ID, build the set of IDs that match:
            // the ingredient itself + any ingredient derived from it
            const expandedSets = selectedIngredientIds.map((id) => {
                const ids = new Set([id])
                for (const ing of libraryIngredients) {
                    if (ing.derivesFromId === id) {
                        ids.add(ing.id)
                    }
                }
                return ids
            })

            return result.filter((recipe) =>
                expandedSets.every((idSet) =>
                    recipe.ingredientIds.some((rid) => idSet.has(rid))
                )
            )
        }

        if (!searchQuery || searchQuery.length < 2) return result

        const keys = locale === 'en' ? ['nameSv', 'nameEn'] : ['nameSv']
        const fuse = new Fuse(result, {
            keys,
            threshold: 0.3,
            ignoreLocation: true,
        })

        return fuse.search(searchQuery).map((result) => result.item)
    }, [recipes, searchTab, searchQuery, selectedIngredientIds, selectedCategoryIds, locale, libraryIngredients])

    return (
        <>
            <PageHead
                title={`mumsmums`}
                description="Recept utan livshistorier"
                siteType={'website'}
                url={`https://mumsmums.app`}
                imageUrl={toAbsoluteUrl('/images/og-home.webp')}
            />
            <PageFrame>
                <HeroSection
                    searchTab={searchTab}
                    onTabChange={setSearchTab}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedIngredientIds={selectedIngredientIds}
                    onIngredientSelectionChange={setSelectedIngredientIds}
                />
                <CategoryFilter
                    categories={availableCategories}
                    selectedIds={selectedCategoryIds}
                    onSelectionChange={setSelectedCategoryIds}
                />
                <RecipeGrid
                    recipes={filteredRecipes}
                    searchQuery={searchQuery}
                    selectedIngredientCount={searchTab === 'ingredient' ? selectedIngredientIds.length : undefined}
                    selectedCategoryCount={selectedCategoryIds.length}
                />
            </PageFrame>
        </>
    )
}
