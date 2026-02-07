import React from 'react'
import Link from 'next/link'

import { HomeIcon } from '../icons'
import style from './Navigation.module.css'

const Navigation = () => {
    return (
        <div className={style.header}>
            <nav className={style.nav}>
                <div className={style.navLeft}>
                    <Link href="/" className={style.home} aria-label="Hem">
                        <HomeIcon size={28} />
                    </Link>
                </div>
            </nav>
        </div>
    )
}

export default Navigation
