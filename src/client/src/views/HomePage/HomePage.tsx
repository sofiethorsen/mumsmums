import React from 'react'

import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'
import PageFrame from '../../components/PageFrame/PageFrame'

export default function HomePage() {
    return (
        <PageFrame>
            <RecipeGrid />
        </PageFrame>
    )
}
