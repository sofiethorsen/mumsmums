import { useState, useMemo } from 'react'
import { useLocale } from 'next-intl'
import Fuse from 'fuse.js'
import PageFrame from '../../components/PageFrame/PageFrame'
import PageHead from '../../components/PageHead/PageHead'
import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'
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

    const filteredRecipes = useMemo(() => {
        if (!recipes) return []

        if (searchTab === 'ingredient') {
            if (selectedIngredientIds.length === 0) return recipes

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

            return recipes.filter((recipe) =>
                expandedSets.every((idSet) =>
                    recipe.ingredientIds.some((rid) => idSet.has(rid))
                )
            )
        }

        if (!searchQuery || searchQuery.length < 2) return recipes

        const keys = locale === 'en' ? ['nameSv', 'nameEn'] : ['nameSv']
        const fuse = new Fuse(recipes, {
            keys,
            threshold: 0.3,
            ignoreLocation: true,
        })

        return fuse.search(searchQuery).map((result) => result.item)
    }, [recipes, searchTab, searchQuery, selectedIngredientIds, locale, libraryIngredients])

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
                <RecipeGrid
                    recipes={filteredRecipes}
                    searchQuery={searchQuery}
                    selectedIngredientCount={searchTab === 'ingredient' ? selectedIngredientIds.length : undefined}
                />
            </PageFrame>
        </>
    )
}
