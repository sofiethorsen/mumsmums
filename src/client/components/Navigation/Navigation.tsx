import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { HomeIcon } from '../icons'
import LocaleSwitcher from '../LocaleSwitcher/LocaleSwitcher'
import styles from './Navigation.module.css'

const Navigation = () => {
    const t = useTranslations('navigation')

    return (
        <div className={styles.header}>
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <Link href="/" className={styles.home} aria-label={t('homeAriaLabel')}>
                        <HomeIcon size={28} />
                    </Link>
                </div>
                <div className={styles.navRight}>
                    <LocaleSwitcher />
                </div>
            </nav>
        </div>
    )
}

export default Navigation
