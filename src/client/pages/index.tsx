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
    })

    return {
        props: {
            recipes: data.recipes,
        },
    }
}
