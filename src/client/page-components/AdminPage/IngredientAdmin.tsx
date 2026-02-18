import React, { useState } from 'react'
import client from '../../graphql/client'
import type { LibraryIngredient } from '../../graphql/generated'
import {
    CREATE_INGREDIENT,
    UPDATE_INGREDIENT,
    DELETE_INGREDIENT,
} from '../../graphql/queries'
import IngredientForm, { IngredientFormValues } from '../../components/IngredientForm/IngredientForm'
import { useIngredients } from '../../hooks'
import styles from './AdminPage.module.css'

type Mode = 'list' | 'create' | 'edit'

const IngredientAdmin: React.FC = () => {
    const [mode, setMode] = useState<Mode>('list')
    const [searchTerm, setSearchTerm] = useState('')
    const [editingIngredient, setEditingIngredient] = useState<LibraryIngredient | null>(null)
    const [formError, setFormError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const {
        ingredients,
        loading,
        reload,
        removeIngredient,
    } = useIngredients({ fetchPolicy: 'network-only' })

    const handleCreate = () => {
        setEditingIngredient(null)
        setFormError(null)
        setMode('create')
    }

    const handleEdit = (ingredient: LibraryIngredient) => {
        setEditingIngredient(ingredient)
        setFormError(null)
        setMode('edit')
    }

    const handleCancel = () => {
        setMode('list')
        setEditingIngredient(null)
        setFormError(null)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Vill du verkligen radera denna ingrediens?')) return
        try {
            await client.mutate({
                mutation: DELETE_INGREDIENT,
                variables: { id },
            })
            removeIngredient(id)
        } catch (error) {
            console.error('Error deleting ingredient:', error)
            alert('Kunde inte radera')
        }
    }

    const handleSubmit = async (values: IngredientFormValues) => {
        setSaving(true)
        setFormError(null)
        try {
            const input = {
                nameSv: values.nameSv,
                nameEn: values.nameEn || null,
                qualifierSv: values.qualifierSv || null,
                qualifierEn: values.qualifierEn || null,
                derivesFromId: values.derivesFromId,
                fullNameSv: values.fullNameSv,
                fullNameEn: values.fullNameEn || null,
            }

            if (mode === 'create') {
                await client.mutate({
                    mutation: CREATE_INGREDIENT,
                    variables: { input },
                })
            } else {
                await client.mutate({
                    mutation: UPDATE_INGREDIENT,
                    variables: { id: editingIngredient?.id, input },
                })
            }

            await reload()
            handleCancel()
        } catch (error) {
            console.error('Error saving ingredient:', error)
            setFormError('Kunde inte spara. Kontrollera att visningsnamnet är unikt.')
        } finally {
            setSaving(false)
        }
    }

    const getIngredientName = (id: number) => {
        return ingredients.find(i => i.id === id)?.fullNameSv || `(ID: ${id})`
    }

    const filteredIngredients = ingredients.filter(i =>
        i.fullNameSv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.nameSv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.fullNameEn && i.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading && mode === 'list') {
        return <div>Laddar...</div>
    }

    // Form view
    if (mode === 'create' || mode === 'edit') {
        return (
            <IngredientForm
                mode={mode}
                initialValues={editingIngredient ? {
                    nameSv: editingIngredient.nameSv,
                    nameEn: editingIngredient.nameEn || '',
                    qualifierSv: editingIngredient.qualifierSv || '',
                    qualifierEn: editingIngredient.qualifierEn || '',
                    derivesFromId: editingIngredient.derivesFromId || null,
                    fullNameSv: editingIngredient.fullNameSv,
                    fullNameEn: editingIngredient.fullNameEn || '',
                } : undefined}
                existingIngredients={ingredients}
                editingId={editingIngredient?.id}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={saving}
                error={formError}
            />
        )
    }

    // List view
    return (
        <div className={styles.listView}>
            <button onClick={handleCreate} className={styles.createButton}>
                Skapa ny ingrediens
            </button>

            <h3 style={{ marginTop: '24px' }}>Ingredienser ({ingredients.length})</h3>
            <input
                type="text"
                placeholder="Sök ingredienser..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
            />
            <div className={styles.recipeList}>
                {filteredIngredients.map(ingredient => (
                    <div key={ingredient.id} className={`${styles.libraryItem} ${styles.libraryItemWide}`}>
                        <div className={styles.libraryItemInfo}>
                            <span className={styles.libraryItemName}>{ingredient.fullNameSv}</span>
                            {ingredient.fullNameEn && (
                                <span className={styles.libraryItemMeta}>{ingredient.fullNameEn}</span>
                            )}
                        </div>
                        <span className={styles.libraryItemMeta}>
                            {ingredient.qualifierSv || '-'}
                        </span>
                        <span className={styles.libraryItemMeta}>
                            {ingredient.derivesFromId ? (
                                <>Från: {getIngredientName(ingredient.derivesFromId)}</>
                            ) : '-'}
                        </span>
                        <div className={styles.actions}>
                            <button onClick={() => handleEdit(ingredient)}>Redigera</button>
                            <button onClick={() => handleDelete(ingredient.id)}>Radera</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default IngredientAdmin
