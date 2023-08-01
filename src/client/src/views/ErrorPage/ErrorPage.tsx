import React from 'react'
import styles from './ErrorPage.module.css'

import { useRouteError } from 'react-router-dom'

import PageFrame from '../../components/PageFrame/PageFrame'

export default function ErrorPage() {
    const error = useRouteError()

    return (
        <PageFrame>
            <div className={styles.container}>
                <i>{error.statusText || error.message}</i>
            </div>
        </PageFrame>
    )
}
