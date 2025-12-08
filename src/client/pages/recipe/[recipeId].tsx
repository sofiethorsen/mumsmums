import React from 'react'
import RecipePage from '../../page-components/RecipePage/RecipePage'
import PageHead from '../../components/PageHead/PageHead'
import PageFrame from '../../components/PageFrame/PageFrame'
import client from '../../graphql/client'
import { gql } from '@apollo/client'
import { toAbsoluteUrl } from '../../constants/urls'
import type { Recipe, GetRecipeByIdQueryResult, GetRecipeIdsQueryResult } from '../../graphql/types'

import { GET_RECIPE_BY_ID } from '../../components/Recipe/queries'

const GET_RECIPE_IDS = gql`
  query {
    recipes {
      recipeId,
    }
  }
`

const renderPageHead = (recipe: Recipe) => {
    return <PageHead
        title={`mumsmums - ${recipe.name}`}
        description={recipe.description}
        siteType={'article'}
        url={`https://mumsmums.app/recipe/${recipe.recipeId}`}
        imageUrl={toAbsoluteUrl(recipe.imageUrl)}
        fbPreviewImageUrl={toAbsoluteUrl(recipe.fbPreviewImageUrl)}
    />
}

interface RecipeProps {
      recipe: Recipe
}

export default function Recipe({ recipe }: RecipeProps) {
    return (
        <>
            {renderPageHead(recipe)}
            <PageFrame>
                <RecipePage recipe={recipe} />
            </PageFrame>
        </>
    )
}

export async function getStaticPaths() {
    const { data } = await client.query<GetRecipeIdsQueryResult>({
        query: GET_RECIPE_IDS,
    })

    const paths = data.recipes.map((recipe) => ({
        params: { recipeId: String(recipe.recipeId) },
    }))

    return {
        paths: paths,
        fallback: false,
    }
}

export async function getStaticProps({ params }: { params: { recipeId: string } }) {
    // since we get the ID from the URL, we need to convert it to a number to make TS happy
    const numericRecipeId = parseInt(params.recipeId, 10)
    const recipeData = await client.query<GetRecipeByIdQueryResult>({
        query: GET_RECIPE_BY_ID,
        variables: { recipeId: numericRecipeId },
    })

    return {
        props: {
            recipe: recipeData.data.recipe,
        },
    }
}
