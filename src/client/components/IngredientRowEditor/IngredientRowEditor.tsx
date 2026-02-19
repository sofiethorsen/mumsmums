import React from 'react'
import styles from './IngredientRowEditor.module.css'
import AutocompletePicker from '../AutocompletePicker/AutocompletePicker'
import type { LibraryIngredient, LibraryUnit } from '../../graphql/generated'

export interface IngredientRowData {
    name: string
    volume: string
    quantity: string
    recipeId: string
    ingredientId: string
    unitId: string
}

interface IngredientRowEditorProps {
    ingredient: IngredientRowData
    libraryIngredients: LibraryIngredient[]
    libraryUnits: LibraryUnit[]
    canRemove: boolean
    onChange: (ingredient: IngredientRowData) => void
    onCreateNew: (query: string) => void
    onRemove: () => void
}

const IngredientRowEditor: React.FC<IngredientRowEditorProps> = ({
    ingredient,
    libraryIngredients,
    libraryUnits,
    canRemove,
    onChange,
    onCreateNew,
    onRemove,
}) => {
    const handleIngredientSelect = (ingredientId: string) => {
        if (ingredientId) {
            const libraryIngredient = libraryIngredients.find(i => i.id.toString() === ingredientId)
            if (libraryIngredient) {
                onChange({
                    ...ingredient,
                    ingredientId,
                    name: libraryIngredient.fullNameSv,
                })
            }
        } else {
            onChange({ ...ingredient, ingredientId: '' })
        }
    }

    const handleUnitSelect = (unitId: string) => {
        if (unitId) {
            const libraryUnit = libraryUnits.find(u => u.id.toString() === unitId)
            if (libraryUnit) {
                onChange({
                    ...ingredient,
                    unitId,
                    volume: libraryUnit.shortNameSv ?? '',
                })
            }
        } else {
            onChange({ ...ingredient, unitId: '', volume: '' })
        }
    }

    const handleFieldChange = (field: keyof IngredientRowData, value: string) => {
        onChange({ ...ingredient, [field]: value })
    }

    return (
        <div className={styles.row}>
            <div className={styles.main}>
                <AutocompletePicker
                    options={libraryIngredients.map(lib => ({
                        id: lib.id.toString(),
                        label: lib.fullNameSv,
                    }))}
                    value={ingredient.ingredientId}
                    onChange={handleIngredientSelect}
                    placeholder="Sök ingrediens..."
                    className={styles.ingredientPicker}
                    onCreateNew={onCreateNew}
                    createNewLabel={(query) => `Skapa "${query}"`}
                />
            </div>
            <div className={styles.quantity}>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Mängd"
                    value={ingredient.quantity}
                    onChange={(e) => handleFieldChange('quantity', e.target.value)}
                    className={styles.quantityInput}
                />
                <select
                    value={ingredient.unitId}
                    onChange={(e) => handleUnitSelect(e.target.value)}
                    className={styles.unitSelect}
                >
                    <option value="">Välj enhet...</option>
                    {libraryUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                            {unit.shortNameSv ? `${unit.shortNameSv} (${unit.nameSv})` : unit.nameSv}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.actions}>
                <input
                    type="number"
                    placeholder="Recept-ID"
                    value={ingredient.recipeId}
                    onChange={(e) => handleFieldChange('recipeId', e.target.value)}
                    className={styles.recipeIdInput}
                />
                {canRemove && (
                    <button type="button" onClick={onRemove} className={styles.removeButton}>
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default IngredientRowEditor
