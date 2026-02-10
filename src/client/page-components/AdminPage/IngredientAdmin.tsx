import React, { useState, useEffect } from 'react'
import client from '../../graphql/client'
import type { LibraryIngredient } from '../../graphql/generated'
import {
    GET_INGREDIENTS,
    CREATE_INGREDIENT,
    UPDATE_INGREDIENT,
    DELETE_INGREDIENT,
} from '../../graphql/queries'
import styles from './AdminPage.module.css'

type Mode = 'list' | 'create' | 'edit'

const IngredientAdmin: React.FC = () => {
    const [mode, setMode] = useState<Mode>('list')
    const [ingredients, setIngredients] = useState<LibraryIngredient[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [nameSv, setNameSv] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [qualifierSv, setQualifierSv] = useState('')
    const [qualifierEn, setQualifierEn] = useState('')
    const [derivesFromId, setDerivesFromId] = useState<number | null>(null)
    const [fullNameSv, setFullNameSv] = useState('')
    const [fullNameEn, setFullNameEn] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const result = await client.query<{ ingredients: LibraryIngredient[] }>({
                query: GET_INGREDIENTS,
                fetchPolicy: 'network-only',
            })
            setIngredients(result.data?.ingredients ?? [])
        } catch (error) {
            console.error('Error loading data:', error)
            alert('Kunde inte ladda data')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setMode('list')
        setEditingId(null)
        setNameSv('')
        setNameEn('')
        setQualifierSv('')
        setQualifierEn('')
        setDerivesFromId(null)
        setFullNameSv('')
        setFullNameEn('')
    }

    const handleCreate = () => {
        resetForm()
        setMode('create')
    }

    const handleEdit = (ingredient: LibraryIngredient) => {
        resetForm()
        setEditingId(ingredient.id)
        setNameSv(ingredient.nameSv)
        setNameEn(ingredient.nameEn || '')
        setQualifierSv(ingredient.qualifierSv || '')
        setQualifierEn(ingredient.qualifierEn || '')
        setDerivesFromId(ingredient.derivesFromId || null)
        setFullNameSv(ingredient.fullNameSv)
        setFullNameEn(ingredient.fullNameEn || '')
        setMode('edit')
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Vill du verkligen radera denna ingrediens?')) return
        try {
            await client.mutate({
                mutation: DELETE_INGREDIENT,
                variables: { id },
            })
            await loadData()
        } catch (error) {
            console.error('Error deleting ingredient:', error)
            alert('Kunde inte radera')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nameSv.trim()) {
            alert('Namn (svenska) krävs')
            return
        }
        if (!fullNameSv.trim()) {
            alert('Fullständigt namn (svenska) krävs')
            return
        }

        setLoading(true)
        try {
            const input = {
                nameSv: nameSv.trim(),
                nameEn: nameEn.trim() || null,
                qualifierSv: qualifierSv.trim() || null,
                qualifierEn: qualifierEn.trim() || null,
                derivesFromId,
                fullNameSv: fullNameSv.trim(),
                fullNameEn: fullNameEn.trim() || null,
            }

            if (mode === 'create') {
                await client.mutate({
                    mutation: CREATE_INGREDIENT,
                    variables: { input },
                })
            } else {
                await client.mutate({
                    mutation: UPDATE_INGREDIENT,
                    variables: { id: editingId, input },
                })
            }

            await loadData()
            resetForm()
        } catch (error) {
            console.error('Error saving ingredient:', error)
            alert('Kunde inte spara')
        } finally {
            setLoading(false)
        }
    }

    // Auto-generate fullNameSv when name and qualifier change
    const updateFullName = (name: string, qualifier: string) => {
        if (qualifier.trim()) {
            setFullNameSv(`${name}, ${qualifier}`)
        } else {
            setFullNameSv(name)
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
            <form onSubmit={handleSubmit} className={styles.libraryForm}>
                <h3>{mode === 'create' ? 'Skapa ingrediens' : 'Redigera ingrediens'}</h3>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Namn (svenska) *</label>
                        <input
                            type="text"
                            value={nameSv}
                            onChange={(e) => {
                                setNameSv(e.target.value)
                                updateFullName(e.target.value, qualifierSv)
                            }}
                            placeholder="t.ex. koriander, ägg, äggula"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Namn (engelska)</label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="t.ex. coriander, egg, egg yolk"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Kvalificerare (svenska)</label>
                        <input
                            type="text"
                            value={qualifierSv}
                            onChange={(e) => {
                                setQualifierSv(e.target.value)
                                updateFullName(nameSv, e.target.value)
                            }}
                            placeholder="t.ex. malen, blad"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Kvalificerare (engelska)</label>
                        <input
                            type="text"
                            value={qualifierEn}
                            onChange={(e) => setQualifierEn(e.target.value)}
                            placeholder="t.ex. ground, leaves"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Visningsnamn (svenska) *</label>
                        <input
                            type="text"
                            value={fullNameSv}
                            onChange={(e) => setFullNameSv(e.target.value)}
                            placeholder="t.ex. koriander, malen"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Visningsnamn (engelska)</label>
                        <input
                            type="text"
                            value={fullNameEn}
                            onChange={(e) => setFullNameEn(e.target.value)}
                            placeholder="t.ex. ground coriander"
                        />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Härleds från</label>
                    <select
                        value={derivesFromId || ''}
                        onChange={(e) => setDerivesFromId(Number(e.target.value) || null)}
                    >
                        <option value="">Ingen (grundingrediens)</option>
                        {ingredients
                            .filter(i => i.id !== editingId)
                            .map(ing => (
                                <option key={ing.id} value={ing.id}>
                                    {ing.fullNameSv}
                                </option>
                            ))}
                    </select>
                </div>
                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Sparar...' : 'Spara'}
                    </button>
                    <button type="button" onClick={resetForm} className={styles.cancelButton}>
                        Avbryt
                    </button>
                </div>
            </form>
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
