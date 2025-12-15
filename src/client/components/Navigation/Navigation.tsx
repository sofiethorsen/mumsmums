import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useQuery } from '@apollo/client/react'

import { FEATURE_FLAGS } from '../../constants/featureFlags'
import Icon from '../Icon/Icon'
import SearchPanel from '../SearchPanel/SearchPanel'
import style from './Navigation.module.css'
import { GetRecipePreviewsQueryResult } from '../../graphql/types'
import { GET_RECIPE_PREVIEWS } from '../../graphql/queries'

const Navigation = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const searchButtonRef = useRef<HTMLButtonElement>(null)
    const { data } = useQuery<GetRecipePreviewsQueryResult>(GET_RECIPE_PREVIEWS)

    return (
        <>
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
                        <button
                            ref={searchButtonRef}
                            className={style.iconButton}
                            aria-label="Sök"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Icon name="pan-frying" size={26} />
                        </button>
                        {FEATURE_FLAGS.LOGIN && (
                            <button className={style.iconButton} aria-label="Logga in">
                                <Icon name="circle-user" size={26} />
                            </button>
                        )}
                    </div>
                </nav>
            </div>

            {/* Search Panel */}
            <SearchPanel
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                triggerRef={searchButtonRef}
                recipes={data?.recipes || []}
            />
        </>
    )
}

export default Navigation
