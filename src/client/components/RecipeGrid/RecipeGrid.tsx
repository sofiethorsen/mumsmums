import React from 'react'
import { useQuery } from '@apollo/client/react'
import styles from './RecipeGrid.module.css'
import { GetRecipesQueryResult } from '../../graphql/types'
import { GET_RECIPE_PREVIEWS } from '../../graphql/queries'

import ImageGrid from '../ImageGrid/ImageGrid'

const RecipeList = () => {
    const { loading, error, data } = useQuery<GetRecipesQueryResult>(GET_RECIPE_PREVIEWS)

    if (loading) return null
    if (error) return <p>Error: {error.message}</p>

    return (
        <div className={styles.grid}>
            <div><h1>Topp mumsar</h1></div>
            <ImageGrid recipes={data.recipes} />
        </div>
    )
}

export default RecipeList
