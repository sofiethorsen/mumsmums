import HomePage from '../page-components/HomePage/HomePage'
import client from '../graphql/client'
import { GetRecipePreviewsDocument, GetRecipePreviewsQuery } from '../graphql/generated'

type RecipePreview = GetRecipePreviewsQuery['recipes'][number]

interface HomeProps {
    recipes: RecipePreview[]
}

export default function Home({ recipes }: HomeProps) {
    return <HomePage recipes={recipes} />
}

export async function getStaticProps() {
    const { data } = await client.query({
        query: GetRecipePreviewsDocument,
        // Always fetch fresh data for SSR/ISR - Apollo cache is for client-side only
        fetchPolicy: 'network-only',
    })

    const recipes = data?.recipes ?? []
    return {
        props: {
            recipes,
        },
        // Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
        revalidate: 60,
    }
}
