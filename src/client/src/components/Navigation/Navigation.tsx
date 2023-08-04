import React from 'react'
import { Link } from 'react-router-dom'

import style from './Navigation.module.css'

const Navigation = () => {
    return (
        <div className={style.header}>
            <nav>
                <Link to={`/`}>Recept</Link>
                <Link to={`/list`}>Shoppinglista</Link>
            </nav>
        </div>
    )
}

export default Navigation
