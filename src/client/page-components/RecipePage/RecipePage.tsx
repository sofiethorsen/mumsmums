import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import RecipeDesktop from '../../components/Recipe/RecipeDesktop'
import RecipeMobile from '../../components/Recipe/RecipeMobile'

import type { GetRecipeByIdQuery } from '../../graphql/generated'

type Recipe = NonNullable<GetRecipeByIdQuery['recipe']>

interface RecipePageProps {
    recipe: Recipe
}

const RecipePage: React.FC<RecipePageProps> = ({ recipe }) => {
    const [isDesktop, setDesktop] = useState(false)

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' })

    useEffect(() => {
        setDesktop(isDesktopOrLaptop)
    }, [isDesktopOrLaptop])

    return (
        <>
            {isDesktop && <RecipeDesktop recipe={recipe} />}
            {!isDesktop && <RecipeMobile recipe={recipe} />}
        </>
    )
}

export default RecipePage
