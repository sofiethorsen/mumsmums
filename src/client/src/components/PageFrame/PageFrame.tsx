import React from 'react'

import './PageFrame.css'

import Navigation from '../Navigation/Navigation.tsx'
import client from '../../graphql/client/client'
import { ApolloProvider } from '@apollo/client'

const PageFrame = ({children}) => {
    return (
        <ApolloProvider client={client}>
            <div className="page">
                <Navigation/>
                {children}
            </div>
        </ApolloProvider>
    )
}

export default PageFrame
