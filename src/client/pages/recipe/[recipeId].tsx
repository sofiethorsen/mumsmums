import { useLocale } from 'next-intl'
import RecipePage from '../../page-components/RecipePage/RecipePage'
import PageHead from '../../components/PageHead/PageHead'
import PageFrame from '../../components/PageFrame/PageFrame'
import client from '../../graphql/client'
import { toAbsoluteUrl } from '../../constants/urls'
import { generateRecipeJsonLd } from '../../seo/recipeJsonLd'
import { getMessages, localized } from '../../i18n'
import { GetRecipeByIdDocument, GetRecipeByIdQuery, GetRecipesDocument } from '../../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

const RecipePageHead = ({ recipe, locale }: { recipe: Recipe; locale: string }) => {
    return <PageHead
        title={`mumsmums - ${localized(recipe.nameSv, recipe.nameEn, locale)}`}
        description={localized(recipe.descriptionSv ?? '', recipe.descriptionEn, locale) || undefined}
        siteType={'article'}
        url={`https://mumsmums.app/recipe/${recipe.recipeId}`}
        imageUrl={toAbsoluteUrl(recipe.imageUrl)}
        locale={locale}
    />
}

interface RecipeProps {
      recipe: Recipe
}

export default function Recipe({ recipe }: RecipeProps) {
    const locale = useLocale()
    const jsonLd = generateRecipeJsonLd(recipe, locale)

    // See: https://nextjs.org/docs/app/guides/json-ld
    return (
        <>
            <RecipePageHead recipe={recipe} locale={locale} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
                }}
            />
            <PageFrame>
                <RecipePage recipe={recipe} />
            </PageFrame>
        </>
    )
}

export async function getStaticPaths() {
    const { data } = await client.query({
        query: GetRecipesDocument,
    })

    const recipes = data?.recipes ?? []
    const paths = recipes.flatMap((recipe) =>
        ['sv', 'en'].map((locale) => ({
            params: { recipeId: String(recipe.recipeId) },
            locale,
        }))
    )

    return {
        paths: paths,
        // 'blocking' allows new recipes to be rendered on-demand, not just at build time
        fallback: 'blocking',
    }
}

export async function getStaticProps({ params, locale }: { params: { recipeId: string }; locale: string }) {
    // since we get the ID from the URL, we need to convert it to a number to make TS happy
    const numericRecipeId = parseInt(params.recipeId, 10)
    const recipeData = await client.query({
        query: GetRecipeByIdDocument,
        variables: { recipeId: numericRecipeId },
        // Always fetch fresh data for SSR/ISR - Apollo cache is for client-side only
        fetchPolicy: 'network-only',
    })

    // Return 404 if recipe doesn't exist (e.g., was deleted)
    const recipe = recipeData.data?.recipe
    if (!recipe) {
        return { notFound: true }
    }

    return {
        props: {
            recipe,
            messages: await getMessages(locale),
        },
        // Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
        revalidate: 60,
    }
}
