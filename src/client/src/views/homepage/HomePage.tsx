import React from 'react'
import './HomePage.css'

import { ApolloProvider } from '@apollo/client'
import client from '../../graphql/client/client'
import RecipeList from '../../components/RecipeList/RecipeList'

export default function HomePage() {
    return (
    <ApolloProvider client={client}>
      <div className="container">
        <RecipeList />
      </div>
    </ApolloProvider>
   )
}
