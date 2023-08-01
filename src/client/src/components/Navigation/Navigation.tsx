import React from 'react'

import style from './Navigation.module.css'

const Navigation = () => {
    return (
        <div className={style.header}>
            <nav>
                <a href="/">Recept</a>
                <a href="/list">Shoppinglista</a>
            </nav>
        </div>
    )
}

export default Navigation
