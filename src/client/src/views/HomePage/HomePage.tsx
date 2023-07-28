import React from 'react'
import './HomePage.css'

import RecipeList from '../../components/RecipeList/RecipeList'
import PageFrame from '../../components/PageFrame/PageFrame'

export default function HomePage() {
    return (
        <PageFrame>
            <RecipeList />
        </PageFrame>
   )
}
