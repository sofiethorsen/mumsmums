import React from 'react'
import './RecipePage.css'

import PageFrame from '../../components/PageFrame/PageFrame'
import Recipe from '../../components/Recipe/Recipe'
import { useParams } from 'react-router-dom'

export default function RecipePage() {
    const { recipeId } = useParams()

    return (
        <PageFrame>
            <Recipe recipeId={recipeId} />
        </PageFrame>
    )
}
