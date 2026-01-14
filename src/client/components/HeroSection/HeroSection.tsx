import React from 'react'
import SearchIcon from '../SearchIcon/SearchIcon'
import style from './HeroSection.module.css'

interface HeroSectionProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    recipeCount: number
}

const HeroSection: React.FC<HeroSectionProps> = ({
    searchQuery,
    onSearchChange,
    recipeCount,
}) => {
    return (
        <section className={style.hero}>
            <div className={style.heroContent}>
                <h1 className={style.title}>Mumsmums</h1>
                <p className={style.subtitle}>
                    Recept utan livshistorier.
                </p>

                <div className={style.searchWrapper}>
                    <SearchIcon size={20} className={style.searchIcon} />
                    <input
                        type="text"
                        placeholder="Sök recept..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={style.searchInput}
                    />
                </div>
            </div>
        </section>
    )
}

export default HeroSection
