import React from 'react'
import Link from 'next/link'

import { FEATURE_FLAGS } from '../../constants/featureFlags'
import Icon from '../Icon/Icon'
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
                    {FEATURE_FLAGS.MENU && (
                        <button className={style.iconButton} aria-label="Meny">
                            <Icon name="menu-burger" size={30} />
                        </button>
                    )}
                </div>

                <div className={style.navCenter}>
                </div>

                <div className={style.navRight}>
                    {FEATURE_FLAGS.LOGIN && (
                        <button className={style.iconButton} aria-label="Logga in">
                            <Icon name="circle-user" size={30} />
                        </button>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Navigation
