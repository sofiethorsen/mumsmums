import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { localized } from '../../i18n'
import styles from './CategoryFilter.module.css'

interface Category {
    id: number
    nameSv: string
    nameEn: string
}

interface CategoryFilterProps {
    categories: Category[]
    selectedIds: number[]
    onSelectionChange: (ids: number[]) => void
}

const CategoryFilter: FC<CategoryFilterProps> = ({ categories, selectedIds, onSelectionChange }) => {
    const locale = useLocale()
    const t = useTranslations('recipeGrid')

    if (categories.length === 0) return null

    const allSelected = selectedIds.length === 0

    const toggleCategory = (id: number) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((sid) => sid !== id))
        } else {
            onSelectionChange([...selectedIds, id])
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.chips}>
                <button
                    type="button"
                    className={`${styles.chip} ${allSelected ? styles.chipActive : ''}`}
                    onClick={() => onSelectionChange([])}
                >
                    {t('allCategories')}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        type="button"
                        className={`${styles.chip} ${selectedIds.includes(cat.id) ? styles.chipActive : ''}`}
                        onClick={() => toggleCategory(cat.id)}
                    >
                        {localized(cat.nameSv, cat.nameEn, locale)}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default CategoryFilter
