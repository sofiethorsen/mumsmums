import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { SearchIcon } from '../icons'
import IngredientSearch from '../IngredientSearch/IngredientSearch'
import styles from './HeroSection.module.css'

export type SearchTab = 'name' | 'ingredient'

interface HeroSectionProps {
    searchTab: SearchTab
    onTabChange: (tab: SearchTab) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    selectedIngredientIds: number[]
    onIngredientSelectionChange: (ids: number[]) => void
}

const HeroSection: FC<HeroSectionProps> = ({
    searchTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    selectedIngredientIds,
    onIngredientSelectionChange,
}) => {
    const t = useTranslations('hero')

    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <h1 className={styles.title}>Mumsmums</h1>
                <p className={styles.subtitle}>
                    {t('subtitle')}
                </p>

                <div className={styles.tabBar}>
                    <button
                        type="button"
                        className={`${styles.tab} ${searchTab === 'name' ? styles.tabActive : ''}`}
                        onClick={() => onTabChange('name')}
                    >
                        {t('tabName')}
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${searchTab === 'ingredient' ? styles.tabActive : ''}`}
                        onClick={() => onTabChange('ingredient')}
                    >
                        {t('tabIngredient')}
                    </button>
                </div>

                <div className={styles.searchArea}>
                    {searchTab === 'name' ? (
                        <div className={styles.searchWrapper}>
                            <SearchIcon size={20} className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    ) : (
                        <IngredientSearch
                            selectedIds={selectedIngredientIds}
                            onSelectionChange={onIngredientSelectionChange}
                        />
                    )}
                </div>
            </div>
        </section>
    )
}

export default HeroSection
