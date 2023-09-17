import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import Head from 'next/head'

import RecipeDesktop from '../../components/Recipe/RecipeDesktop'
import RecipeMobile from '../../components/Recipe/RecipeMobile'

import { Recipe } from '../../graphql/types'

interface RecipePageProps {
    recipe: Recipe
}

const renderPreviewImageTag = (recipe: Recipe) => {
    if (recipe.fbPreviewImageUrl) {
        return (
            <>
                <meta property="og:image" content={recipe.fbPreviewImageUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="600" />
            </>
        )
    } else if (recipe.imageUrl) {
        return (
            <>
                <meta property="og:image" content={recipe.imageUrl} />
                <meta property="og:image:width" content="300" />
                <meta property="og:image:height" content="300" />
            </>
        )
    } else {
        return null
    }
}

const RecipePage: React.FC<RecipePageProps> = ({ recipe }) => {
    const [isDesktop, setDesktop] = useState(false)

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' })

    useEffect(() => {
        setDesktop(isDesktopOrLaptop)
    }, [isDesktopOrLaptop])

    return (
        <>
            <Head>
                <title>{`mumsmums - ${recipe.name}`}</title>
                <meta property="og:title" content={`mumsmums - ${recipe.name}`} key="title" />
                <meta property="og:site_name" content="mumsmums" />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={`https://mumsmums.app/recipe/${recipe.recipeId}`} />
                <meta property="og:locale" content="sv_SE" />
                {renderPreviewImageTag(recipe)}
                {recipe.description && <meta property="og:description" content={recipe.description} />}
            </Head>
            {isDesktop && <RecipeDesktop recipe={recipe} />}
            {!isDesktop && <RecipeMobile recipe={recipe} />}
        </>
    )
}

export default RecipePage
