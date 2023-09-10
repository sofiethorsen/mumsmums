import React from 'react'
import Link from 'next/link'

import style from './Navigation.module.css'

const Navigation = () => {
    return (
        <div className={style.header}>
            <div className={style.nav}>
                <Link className={style.link} href="/">Recept</Link>
                <Link className={style.link} href="/list">Shoppinglista</Link>
            </div>
        </div>
    )
}

export default Navigation
