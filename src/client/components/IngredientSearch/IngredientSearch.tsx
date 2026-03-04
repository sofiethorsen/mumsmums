import type { FC } from 'react'
import { useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import AutocompletePicker from '../AutocompletePicker/AutocompletePicker'
import type { AutocompletePickerOption } from '../AutocompletePicker/AutocompletePicker'
import { SearchIcon } from '../icons'
import { useIngredients } from '../../hooks'
import type { LibraryIngredient } from '../../graphql/generated'
import styles from './IngredientSearch.module.css'

interface IngredientSearchProps {
    selectedIds: number[]
    onSelectionChange: (ids: number[]) => void
}

function getIngredientLabel(ingredient: LibraryIngredient, locale: string): string {
    if (locale === 'en' && ingredient.fullNameEn) {
        return ingredient.fullNameEn
    }
    return ingredient.fullNameSv
}

const IngredientSearch: FC<IngredientSearchProps> = ({
    selectedIds,
    onSelectionChange,
}) => {
    const t = useTranslations('hero')
    const locale = useLocale()
    const { ingredients } = useIngredients()

    const options: AutocompletePickerOption[] = useMemo(() => {
        return ingredients
            .filter((ing) => !selectedIds.includes(ing.id))
            .map((ing) => ({
                id: String(ing.id),
                label: getIngredientLabel(ing, locale),
            }))
    }, [ingredients, selectedIds, locale])

    const selectedIngredients = useMemo(() => {
        return selectedIds
            .map((id) => ingredients.find((ing) => ing.id === id))
            .filter((ing): ing is LibraryIngredient => ing != null)
    }, [selectedIds, ingredients])

    const handleSelect = (id: string) => {
        if (id) {
            onSelectionChange([...selectedIds, Number(id)])
        }
    }

    const handleRemove = (id: number) => {
        onSelectionChange(selectedIds.filter((sid) => sid !== id))
    }

    return (
        <div className={styles.container}>
            <div className={styles.pickerWrapper}>
                <SearchIcon size={20} className={styles.searchIcon} />
                <AutocompletePicker
                    options={options}
                    value=""
                    onChange={handleSelect}
                    placeholder={t('ingredientSearchPlaceholder')}
                    className={styles.picker}
                />
            </div>
            {selectedIngredients.length > 0 && (
                <div className={styles.chips}>
                    {selectedIngredients.map((ing) => (
                        <span key={ing.id} className={styles.chip}>
                            {getIngredientLabel(ing, locale)}
                            <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => handleRemove(ing.id)}
                                aria-label={`Ta bort ${getIngredientLabel(ing, locale)}`}
                            >
                                ✕
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default IngredientSearch
