import React from 'react'
import styles from './ShoppingListPage.module.css'

import PageFrame from '../../components/PageFrame/PageFrame'

export default function ShoppingListPage() {
    return (
        <PageFrame>
            <div className={styles.container}>
                Här blir det shopping snart!
            </div>
        </PageFrame>
    )
}
