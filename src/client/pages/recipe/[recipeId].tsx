import React from 'react'
import RecipePage from '../../page-components/RecipePage/RecipePage'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'
import { useRouter } from 'next/router'
import PageFrame from '../../components/PageFrame/PageFrame'

export default function Recipe() {
    const router = useRouter()
    const parsedRecipeId = parseFloat(String(router.query.recipeId))

    if (isNaN(parsedRecipeId)) {
        return <ErrorMessage />
    }

    return (
        <PageFrame>
            <RecipePage recipeId={parsedRecipeId} />
        </PageFrame>
    )
}
