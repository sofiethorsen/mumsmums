import Link from 'next/link'

import { HomeIcon } from '../icons'
import styles from './Navigation.module.css'

const Navigation = () => {
    return (
        <div className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.home} aria-label="Hem">
                        <HomeIcon size={28} />
                    </Link>
                </div>
            </nav>
        </div>
    )
}

export default Navigation
