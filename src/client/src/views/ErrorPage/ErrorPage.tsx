import React from 'react'
import './ErrorPage.css'

import { useRouteError } from 'react-router-dom'

import PageFrame from '../../components/PageFrame/PageFrame'

export default function ErrorPage() {
    const error = useRouteError()

    return (
        <PageFrame>
            <div className="container">
                <i>{error.statusText || error.message}</i>
            </div>
        </PageFrame>
   )
}
