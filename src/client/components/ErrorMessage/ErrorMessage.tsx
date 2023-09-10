import React from 'react'
import styles from './ErrorMessage.module.css'

const ErrorMessage = () => {
    return (
        <div className={styles.centered}>
            <i>Hoppsan, här fanns ingenting!</i>
        </div>
    )
}

export default ErrorMessage
