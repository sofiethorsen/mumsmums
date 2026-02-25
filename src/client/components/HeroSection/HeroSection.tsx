import type { FC } from 'react'
import { SearchIcon } from '../icons'
import styles from './HeroSection.module.css'

interface HeroSectionProps {
    searchQuery: string
    onSearchChange: (query: string) => void
}

const HeroSection: FC<HeroSectionProps> = ({
    searchQuery,
    onSearchChange,
}) => {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <h1 className={styles.title}>Mumsmums</h1>
                <p className={styles.subtitle}>
                    Recept utan livshistorier.
                </p>

                <div className={styles.searchWrapper}>
                    <SearchIcon size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Sök recept..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>
        </section>
    )
}

export default HeroSection
