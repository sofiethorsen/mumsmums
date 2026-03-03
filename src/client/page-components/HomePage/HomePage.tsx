import { useState, useMemo } from 'react'
import { useLocale } from 'next-intl'
import Fuse from 'fuse.js'
import PageFrame from '../../components/PageFrame/PageFrame'
import PageHead from '../../components/PageHead/PageHead'
import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'
import HeroSection from '../../components/HeroSection/HeroSection'
import { toAbsoluteUrl } from '../../constants/urls'
import type { GetRecipePreviewsQuery } from '../../graphql/generated'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface HomePageProps {
    recipes: RecipePreview[]
}

export default function HomePage({ recipes }: HomePageProps) {
    const locale = useLocale()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredRecipes = useMemo(() => {
        if (!recipes) return []
        if (!searchQuery || searchQuery.length < 2) return recipes

        const keys = locale === 'en' ? ['nameSv', 'nameEn'] : ['nameSv']
        const fuse = new Fuse(recipes, {
            keys,
            threshold: 0.3,
            ignoreLocation: true,
        })

        return fuse.search(searchQuery).map((result) => result.item)
    }, [recipes, searchQuery, locale])

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
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
                <RecipeGrid
                    recipes={filteredRecipes}
                    searchQuery={searchQuery}
                />
            </PageFrame>
        </>
    )
}
