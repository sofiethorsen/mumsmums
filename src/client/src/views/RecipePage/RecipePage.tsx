import React from 'react'

import ErrorPage from '../ErrorPage/ErrorPage'
import PageFrame from '../../components/PageFrame/PageFrame'
import Recipe from '../../components/Recipe/Recipe'
import { useParams } from 'react-router-dom'

const RecipePage = () => {
    const { recipeId } = useParams()

    if (recipeId === undefined) {
        return <ErrorPage />
    }

    const parsedRecipeId = parseFloat(recipeId)

    if (isNaN(parsedRecipeId)) {
        return <ErrorPage />
    }

    return (
        <PageFrame>
            <Recipe recipeId={parsedRecipeId} />
        </PageFrame>
    )
}

export default RecipePage
