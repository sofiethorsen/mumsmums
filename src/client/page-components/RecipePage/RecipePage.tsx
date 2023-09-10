import React from 'react'
import { useMediaQuery } from 'react-responsive'

import { useQuery } from '@apollo/client'

import { GET_RECIPE_BY_ID } from '../../components/Recipe/queries'

import RecipeDesktop from '../../components/Recipe/RecipeDesktop'
import RecipeMobile from '../../components/Recipe/RecipeMobile'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'

interface RecipePageProps {
    recipeId: number
}

const RecipePage: React.FC<RecipePageProps> = ({ recipeId }) => {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })

    const { loading, error, data } = useQuery(GET_RECIPE_BY_ID, {
        variables: { recipeId: recipeId },
    })

    if (loading) return null
    if (error) return <p>Error: {error.message}</p>

    const recipe = data.recipe
    if (recipe === null || undefined) {
        return <ErrorMessage />
    }

    return (
        <>
            {isTabletOrMobile && <RecipeMobile recipe={recipe} />}
            {isDesktopOrLaptop && <RecipeDesktop recipe={recipe} />}
        </>
    )
}

export default RecipePage
