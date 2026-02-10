import type { MetadataRoute } from 'next'
import client from '../graphql/client'
import { GetRecipesDocument } from '../graphql/generated'

const SITE_URL = 'https://mumsmums.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { data } = await client.query({
        query: GetRecipesDocument,
        fetchPolicy: 'network-only',
    })

    const recipes = data?.recipes ?? []
    const recipeUrls: MetadataRoute.Sitemap = recipes.map(recipe => ({
        url: `${SITE_URL}/recipe/${recipe.recipeId}`,
        changeFrequency: 'monthly',
        priority: 1,
    }))

    return [
        {
            url: SITE_URL,
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        ...recipeUrls,
    ]
}
