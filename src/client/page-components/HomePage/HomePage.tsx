import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import PageFrame from '../../components/PageFrame/PageFrame'
import PageHead from '../../components/PageHead/PageHead'
import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'
import HeroSection from '../../components/HeroSection/HeroSection'
import type { RecipePreview } from '../../graphql/types'

interface HomePageProps {
    recipes: RecipePreview[]
}

export default function HomePage({ recipes }: HomePageProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredRecipes = useMemo(() => {
        if (!recipes) return []
        if (!searchQuery || searchQuery.length < 2) return recipes

        const fuse = new Fuse(recipes, {
            keys: ['name'],
            threshold: 0.3,
            ignoreLocation: true,
        })

        return fuse.search(searchQuery).map((result) => result.item)
    }, [recipes, searchQuery])

    return (
        <>
            <PageHead
                title={`mumsmums`}
                siteType={'website'}
                url={`https://mumsmums.app`}
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
