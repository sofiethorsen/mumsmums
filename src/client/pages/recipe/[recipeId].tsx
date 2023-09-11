import React from 'react'
import RecipePage from '../../page-components/RecipePage/RecipePage'
import PageFrame from '../../components/PageFrame/PageFrame'
import client from '../../graphql/client'
import { gql } from '@apollo/client'

import { GET_RECIPE_BY_ID } from '../../components/Recipe/queries'

const GET_RECIPE_IDS = gql`
  query {
    recipes {
      recipeId,
    }
  }
`

export default function Recipe({ recipe }) {
    return (
        <PageFrame>
            <RecipePage recipe={recipe} />
        </PageFrame>
    )
}

export async function getStaticPaths() {
    const { data } = await client.query({
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

export async function getStaticProps({ params }) {
    const recipeData = await client.query({
        query: GET_RECIPE_BY_ID,
        variables: { recipeId: params.recipeId },
    })

    return {
        props: {
            recipe: recipeData.data.recipe,
        },
    }
}
