import React, { PropsWithChildren } from 'react'

import styles from './PageFrame.module.css'

import Navigation from '../Navigation/Navigation'
import client from '../../graphql/client/client'
import { ApolloProvider } from '@apollo/client'

const PageFrame = ({ children }: PropsWithChildren) => {
    return (
        <ApolloProvider client={client}>
            <div className={styles.page}>
                <Navigation />
                {children}
            </div>
        </ApolloProvider>
    )
}

export default PageFrame
