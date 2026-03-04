import { useState, type FC, type FormEvent } from 'react'
import client from '../../graphql/client'
import { type Category } from '../../graphql/generated'
import {
    CREATE_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY,
} from '../../graphql/queries'
import { useCategories } from '../../hooks'
import styles from './AdminPage.module.css'

type Mode = 'list' | 'create' | 'edit'

const CategoryAdmin: FC = () => {
    const [mode, setMode] = useState<Mode>('list')
    const [saving, setSaving] = useState(false)

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [nameSv, setNameSv] = useState('')
    const [nameEn, setNameEn] = useState('')

    const { categories, loading, reload, removeCategory } = useCategories({ fetchPolicy: 'network-only' })

    const resetForm = () => {
        setMode('list')
        setEditingId(null)
        setNameSv('')
        setNameEn('')
    }

    const handleCreate = () => {
        resetForm()
        setMode('create')
    }

    const handleEdit = (category: Category) => {
        resetForm()
        setEditingId(category.id)
        setNameSv(category.nameSv)
        setNameEn(category.nameEn || '')
        setMode('edit')
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Vill du verkligen radera denna kategori?')) return
        try {
            await client.mutate({
                mutation: DELETE_CATEGORY,
                variables: { id },
            })
            removeCategory(id)
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Kunde inte radera')
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!nameSv.trim()) {
            alert('Svenskt namn krävs')
            return
        }

        setSaving(true)
        try {
            const input = {
                nameSv: nameSv.trim(),
                nameEn: nameEn.trim() || null,
            }

            if (mode === 'create') {
                await client.mutate({
                    mutation: CREATE_CATEGORY,
                    variables: { input },
                })
            } else {
                await client.mutate({
                    mutation: UPDATE_CATEGORY,
                    variables: { id: editingId, input },
                })
            }

            await reload()
            resetForm()
        } catch (error) {
            console.error('Error saving category:', error)
            alert('Kunde inte spara')
        } finally {
            setSaving(false)
        }
    }

    if (loading && mode === 'list') {
        return <div>Laddar...</div>
    }

    // Form view
    if (mode === 'create' || mode === 'edit') {
        return (
            <form onSubmit={handleSubmit} className={styles.libraryForm}>
                <h3>{mode === 'create' ? 'Skapa kategori' : 'Redigera kategori'}</h3>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Namn (svenska) *</label>
                        <input
                            type="text"
                            value={nameSv}
                            onChange={(e) => setNameSv(e.target.value)}
                            placeholder="t.ex. Huvudrätt"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Namn (engelska)</label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="t.ex. Main course"
                        />
                    </div>
                </div>
                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton} disabled={saving}>
                        {saving ? 'Sparar...' : 'Spara'}
                    </button>
                    <button type="button" onClick={resetForm} className={styles.cancelButton}>
                        Avbryt
                    </button>
                </div>
            </form>
        )
    }

    // List view
    const sorted = [...categories].sort((a, b) => a.nameSv.localeCompare(b.nameSv, 'sv'))

    return (
        <div className={styles.listView}>
            <button onClick={handleCreate} className={styles.createButton}>
                Skapa ny kategori
            </button>

            <div className={styles.recipeList}>
                {sorted.map(category => (
                    <div key={category.id} className={styles.recipeItem}>
                        <span className={styles.recipeName}>{category.nameSv}</span>
                        <div className={styles.actions}>
                            <button onClick={() => handleEdit(category)}>Redigera</button>
                            <button onClick={() => handleDelete(category.id)}>Radera</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CategoryAdmin
