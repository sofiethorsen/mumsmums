import React, { PropsWithChildren } from 'react'

import styles from './PageFrame.module.css'
import client from '../../graphql/client'
import { ApolloProvider } from '@apollo/client/react'
import Navigation from '../Navigation/Navigation'
import ThemeManager from '../ThemeManager/ThemeManager'

const PageFrame = ({ children }: PropsWithChildren) => {
    return (
        <ApolloProvider client={client}>
            <ThemeManager />
            <div className={styles.page}>
                <Navigation />
                {children}
            </div>
        </ApolloProvider>
    )
}

export default PageFrame
