import React from 'react'
import styles from './ErrorPage.module.css'

import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

import PageFrame from '../../components/PageFrame/PageFrame'

interface Error {
    statusText: string | undefined
    message: string | undefined
}

const getErrorMessage = (error: unknown) => {
    if (isRouteErrorResponse(error)) {
        return <i>{error.status || error.statusText}</i>
    } else {
        return <i>Hoppsan, här fanns ingenting!</i>
    }
}

const ErrorPage = () => {
    let error = useRouteError()

    return (
        <PageFrame>
            <div className={styles.container}>
                {getErrorMessage(error)}
            </div>
        </PageFrame>
    )
}

export default ErrorPage
