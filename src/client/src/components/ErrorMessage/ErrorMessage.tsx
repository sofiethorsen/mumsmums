import React from 'react'
import styles from './ErrorMessage.module.css'

import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

const getErrorMessage = (error: unknown) => {
    if (isRouteErrorResponse(error)) {
        return <i>{error.status || error.statusText}</i>
    } else {
        return <i>Hoppsan, här fanns ingenting!</i>
    }
}

const ErrorMessage = () => {
    let error = useRouteError()

    return (
        <div className={styles.centered}>
            {getErrorMessage(error)}
        </div>
    )
}

export default ErrorMessage
