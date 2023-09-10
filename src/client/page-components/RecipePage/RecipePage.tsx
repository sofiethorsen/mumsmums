import React from 'react'
import { useMediaQuery } from 'react-responsive'

import PageFrame from '../../components/PageFrame/PageFrame'
import RecipeDesktop from '../../components/Recipe/RecipeDesktop'
import { useRouter } from 'next/router'
import RecipeMobile from '../../components/Recipe/RecipeMobile'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'

const RecipePage = () => {
    const router = useRouter()
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' })
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })

    if (router === undefined) {
        return <ErrorMessage />
    }

    const parsedRecipeId = parseFloat(String(router.query.recipeId))

    if (isNaN(parsedRecipeId)) {
        return <ErrorMessage />
    }

    return (
        <PageFrame>
            {isTabletOrMobile && <RecipeMobile recipeId={parsedRecipeId} />}
            {isDesktopOrLaptop && <RecipeDesktop recipeId={parsedRecipeId} />}
        </PageFrame>
    )
}

export default RecipePage
