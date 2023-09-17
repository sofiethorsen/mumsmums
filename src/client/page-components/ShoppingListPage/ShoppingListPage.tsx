import React from 'react'
import styles from './ShoppingListPage.module.css'

import PageFrame from '../../components/PageFrame/PageFrame'
import PageHead from '../../components/PageHead/PageHead'

export default function ShoppingListPage() {
    return (
        <PageFrame>
            <PageHead
                title={`mumsmums`}
                siteType={'website'}
                url={`https://mumsmums.app/list`}
            />
            <div className={styles.content}>
                Här blir det shopping snart!
            </div>
        </PageFrame>
    )
}
