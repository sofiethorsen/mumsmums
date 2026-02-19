import React from 'react'
import styles from './RecipeSectionEditor.module.css'
import IngredientRowEditor, { IngredientRowData } from '../IngredientRowEditor/IngredientRowEditor'
import type { LibraryIngredient, LibraryUnit } from '../../graphql/generated'

export interface RecipeSectionData {
    name: string
    ingredients: IngredientRowData[]
}

const EMPTY_INGREDIENT: IngredientRowData = {
    name: '',
    volume: '',
    quantity: '',
    recipeId: '',
    ingredientId: '',
    unitId: '',
}

interface RecipeSectionEditorProps {
    section: RecipeSectionData
    libraryIngredients: LibraryIngredient[]
    libraryUnits: LibraryUnit[]
    canRemove: boolean
    onChange: (section: RecipeSectionData) => void
    onCreateNewIngredient: (ingredientIndex: number, query: string) => void
    onRemove: () => void
}

const RecipeSectionEditor: React.FC<RecipeSectionEditorProps> = ({
    section,
    libraryIngredients,
    libraryUnits,
    canRemove,
    onChange,
    onCreateNewIngredient,
    onRemove,
}) => {
    const handleNameChange = (name: string) => {
        onChange({ ...section, name })
    }

    const handleIngredientChange = (index: number, ingredient: IngredientRowData) => {
        const newIngredients = [...section.ingredients]
        newIngredients[index] = ingredient
        onChange({ ...section, ingredients: newIngredients })
    }

    const handleAddIngredient = () => {
        onChange({ ...section, ingredients: [...section.ingredients, EMPTY_INGREDIENT] })
    }

    const handleRemoveIngredient = (index: number) => {
        onChange({
            ...section,
            ingredients: section.ingredients.filter((_, i) => i !== index),
        })
    }

    return (
        <div className={styles.section}>
            <div className={styles.header}>
                <input
                    type="text"
                    placeholder="Sektionsnamn (frivilligt)"
                    value={section.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={styles.nameInput}
                />
                {canRemove && (
                    <button type="button" onClick={onRemove} className={styles.removeButton}>
                        Ta bort sektion
                    </button>
                )}
            </div>

            {section.ingredients.map((ingredient, index) => (
                <IngredientRowEditor
                    key={index}
                    ingredient={ingredient}
                    libraryIngredients={libraryIngredients}
                    libraryUnits={libraryUnits}
                    canRemove={section.ingredients.length > 1}
                    onChange={(updated) => handleIngredientChange(index, updated)}
                    onCreateNew={(query) => onCreateNewIngredient(index, query)}
                    onRemove={() => handleRemoveIngredient(index)}
                />
            ))}

            <button type="button" onClick={handleAddIngredient} className={styles.addButton}>
                Lägg till ingrediens
            </button>
        </div>
    )
}

export default RecipeSectionEditor
