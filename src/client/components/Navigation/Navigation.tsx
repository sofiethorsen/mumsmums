import React from 'react'
import Link from 'next/link'

import { FEATURE_FLAGS } from '../../constants/featureFlags'
import Icon from '../Icon/Icon'
import style from './Navigation.module.css'

const Navigation = () => {
    return (
        <div className={style.header}>
            <nav className={style.nav}>

                <div className={style.navLeft}>
                    {FEATURE_FLAGS.MENU && (
                        <button className={style.iconButton} aria-label="Meny">
                            <Icon name="menu-burger" size={26} />
                        </button>
                    )}
                </div>

                <div className={style.navCenter}>
                    <Link href="/" className={style.home} aria-label="Hem">
                        <Icon name="home" size={28} />
                    </Link>
                </div>

                <div className={style.navRight}>
                    {FEATURE_FLAGS.SEARCH && (
                        <button className={style.iconButton} aria-label="Sök">
                            <Icon name="pan-frying" size={26} />
                        </button>
                    )}
                    {FEATURE_FLAGS.LOGIN && (
                        <button className={style.iconButton} aria-label="Logga in">
                            <Icon name="circle-user" size={26} />
                        </button>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Navigation
