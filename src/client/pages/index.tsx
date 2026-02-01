import HomePage from '../page-components/HomePage/HomePage'
import client from '../graphql/client'
import { GET_RECIPE_PREVIEWS } from '../graphql/queries'
import type { GetRecipePreviewsQueryResult, RecipePreview } from '../graphql/types'

interface HomeProps {
    recipes: RecipePreview[]
}

export default function Home({ recipes }: HomeProps) {
    return <HomePage recipes={recipes} />
}

export async function getStaticProps() {
    const { data } = await client.query<GetRecipePreviewsQueryResult>({
        query: GET_RECIPE_PREVIEWS,
        // Always fetch fresh data for SSR/ISR - Apollo cache is for client-side only
        fetchPolicy: 'network-only',
    })

    return {
        props: {
            recipes: data.recipes,
        },
        // Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
        revalidate: 60,
    }
}
