import type { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useLocale } from 'next-intl'
import { GlobeIcon } from '../icons'
import styles from './LocaleSwitcher.module.css'

const LocaleSwitcher: FC = () => {
    const locale = useLocale()
    const { asPath } = useRouter()
    const targetLocale = locale === 'sv' ? 'en' : 'sv'
    const label = locale === 'sv' ? 'SV' : 'EN'

    return (
        <Link
            href={asPath}
            locale={targetLocale}
            className={styles.switcher}
            aria-label={targetLocale === 'en' ? 'Switch to English' : 'Byt till svenska'}
        >
            <GlobeIcon size={18} />
            <span className={styles.label}>{label}</span>
        </Link>
    )
}

export default LocaleSwitcher
