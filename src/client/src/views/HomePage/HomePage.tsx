import React from 'react'

import RecipeGrid from '../../components/RecipeGrid/RecipeGrid'
import PageFrame from '../../components/PageFrame/PageFrame'
import { Helmet } from 'react-helmet-async'

export default function HomePage() {
    return (
        <>
            <Helmet>
                <title>mumsmums</title>
                <meta property="og:site_name" content="mumsmums" />
                <meta property="og:type" content="website" />
            </Helmet>
            <PageFrame>
                <RecipeGrid />
            </PageFrame>
        </>
    )
}
