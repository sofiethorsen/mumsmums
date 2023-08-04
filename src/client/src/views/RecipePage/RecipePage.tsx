import React from 'react'
import { useMediaQuery } from 'react-responsive'


import ErrorPage from '../ErrorPage/ErrorPage'
import PageFrame from '../../components/PageFrame/PageFrame'
import RecipeDesktop from '../../components/Recipe/RecipeDesktop'
import { useParams } from 'react-router-dom'
import RecipeMobile from '../../components/Recipe/RecipeMobile'

const RecipePage = () => {
    const { recipeId } = useParams()
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })

    if (recipeId === undefined) {
        return <ErrorPage />
    }

    const parsedRecipeId = parseFloat(recipeId)

    if (isNaN(parsedRecipeId)) {
        return <ErrorPage />
    }

    return (
        <PageFrame>
            {isTabletOrMobile && <RecipeMobile recipeId={parsedRecipeId} />}
            {isDesktopOrLaptop && <RecipeDesktop recipeId={parsedRecipeId} />}
        </PageFrame>
    )
}

export default RecipePage
