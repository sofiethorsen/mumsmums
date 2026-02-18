import React, { useState } from 'react'
import client from '../../graphql/client'
import { type LibraryUnit, UnitType } from '../../graphql/generated'
import {
    CREATE_UNIT,
    UPDATE_UNIT,
    DELETE_UNIT,
} from '../../graphql/queries'
import { useUnits } from '../../hooks'
import styles from './AdminPage.module.css'

type Mode = 'list' | 'create' | 'edit'

const UNIT_TYPE_LABELS: Record<UnitType, string> = {
    [UnitType.Volume]: 'Volym',
    [UnitType.Weight]: 'Vikt',
    [UnitType.Count]: 'Antal',
    [UnitType.Other]: 'Övrigt',
}

const UnitAdmin: React.FC = () => {
    const [mode, setMode] = useState<Mode>('list')
    const [saving, setSaving] = useState(false)

    // Form state
    const [editingId, setEditingId] = useState<number | null>(null)
    const [shortNameSv, setShortNameSv] = useState('')
    const [shortNameEn, setShortNameEn] = useState('')
    const [nameSv, setNameSv] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [type, setType] = useState<UnitType>(UnitType.Volume)
    const [mlEquivalent, setMlEquivalent] = useState('')
    const [gEquivalent, setGEquivalent] = useState('')

    const { units, loading, reload, removeUnit } = useUnits({ fetchPolicy: 'network-only' })

    const resetForm = () => {
        setMode('list')
        setEditingId(null)
        setShortNameSv('')
        setShortNameEn('')
        setNameSv('')
        setNameEn('')
        setType(UnitType.Volume)
        setMlEquivalent('')
        setGEquivalent('')
    }

    const handleCreate = () => {
        resetForm()
        setMode('create')
    }

    const handleEdit = (unit: LibraryUnit) => {
        resetForm()
        setEditingId(unit.id)
        setShortNameSv(unit.shortNameSv)
        setShortNameEn(unit.shortNameEn || '')
        setNameSv(unit.nameSv)
        setNameEn(unit.nameEn || '')
        setType(unit.type)
        setMlEquivalent(unit.mlEquivalent?.toString() || '')
        setGEquivalent(unit.gEquivalent?.toString() || '')
        setMode('edit')
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Vill du verkligen radera denna enhet?')) return
        try {
            await client.mutate({
                mutation: DELETE_UNIT,
                variables: { id },
            })
            removeUnit(id)
        } catch (error) {
            console.error('Error deleting unit:', error)
            alert('Kunde inte radera')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shortNameSv.trim()) {
            alert('Svensk förkortning krävs')
            return
        }
        if (!nameSv.trim()) {
            alert('Svenskt namn krävs')
            return
        }

        setSaving(true)
        try {
            const input = {
                shortNameSv: shortNameSv.trim(),
                shortNameEn: shortNameEn.trim() || null,
                nameSv: nameSv.trim(),
                nameEn: nameEn.trim() || null,
                type,
                mlEquivalent: mlEquivalent ? parseFloat(mlEquivalent) : null,
                gEquivalent: gEquivalent ? parseFloat(gEquivalent) : null,
            }

            if (mode === 'create') {
                await client.mutate({
                    mutation: CREATE_UNIT,
                    variables: { input },
                })
            } else {
                await client.mutate({
                    mutation: UPDATE_UNIT,
                    variables: { id: editingId, input },
                })
            }

            await reload()
            resetForm()
        } catch (error) {
            console.error('Error saving unit:', error)
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
                <h3>{mode === 'create' ? 'Skapa enhet' : 'Redigera enhet'}</h3>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Förkortning (svenska) *</label>
                        <input
                            type="text"
                            value={shortNameSv}
                            onChange={(e) => setShortNameSv(e.target.value)}
                            placeholder="t.ex. msk"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Förkortning (engelska)</label>
                        <input
                            type="text"
                            value={shortNameEn}
                            onChange={(e) => setShortNameEn(e.target.value)}
                            placeholder="t.ex. tbsp"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Fullständigt namn (svenska) *</label>
                        <input
                            type="text"
                            value={nameSv}
                            onChange={(e) => setNameSv(e.target.value)}
                            placeholder="t.ex. matsked"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Fullständigt namn (engelska)</label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="t.ex. tablespoon"
                        />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Typ *</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as UnitType)}
                        >
                            {Object.entries(UNIT_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {type === UnitType.Volume && (
                        <div className={styles.formGroup}>
                            <label>ml-ekvivalent</label>
                            <input
                                type="number"
                                step="0.01"
                                value={mlEquivalent}
                                onChange={(e) => setMlEquivalent(e.target.value)}
                                placeholder="t.ex. 15 (för msk)"
                            />
                        </div>
                    )}
                    {type === UnitType.Weight && (
                        <div className={styles.formGroup}>
                            <label>gram-ekvivalent</label>
                            <input
                                type="number"
                                step="0.01"
                                value={gEquivalent}
                                onChange={(e) => setGEquivalent(e.target.value)}
                                placeholder="t.ex. 1000 (för kg)"
                            />
                        </div>
                    )}
                    {type !== UnitType.Volume && type !== UnitType.Weight && (
                        <div className={styles.formGroup} />
                    )}
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

    // Group units by type
    const unitsByType = units.reduce((acc, unit) => {
        if (!acc[unit.type]) acc[unit.type] = []
        acc[unit.type].push(unit)
        return acc
    }, {} as Record<UnitType, LibraryUnit[]>)

    // List view
    return (
        <div className={styles.listView}>
            <button onClick={handleCreate} className={styles.createButton}>
                Skapa ny enhet
            </button>

            {([UnitType.Volume, UnitType.Weight, UnitType.Count, UnitType.Other]).map(unitType => {
                const typeUnits = unitsByType[unitType] || []
                if (typeUnits.length === 0) return null

                return (
                    <div key={unitType}>
                        <h3 style={{ marginTop: '24px' }}>
                            {UNIT_TYPE_LABELS[unitType]} ({typeUnits.length})
                        </h3>
                        <div className={styles.recipeList}>
                            {typeUnits.map(unit => (
                                <div key={unit.id} className={styles.libraryItem}>
                                    <div className={styles.libraryItemInfo}>
                                        <span className={styles.libraryItemName}>{unit.shortNameSv}</span>
                                        <span className={styles.libraryItemMeta}>{unit.nameSv}</span>
                                    </div>
                                    <span className={styles.libraryItemMeta}>
                                        {unit.mlEquivalent && `${unit.mlEquivalent} ml`}
                                        {unit.gEquivalent && `${unit.gEquivalent} g`}
                                        {!unit.mlEquivalent && !unit.gEquivalent && '-'}
                                    </span>
                                    <div className={styles.actions}>
                                        <button onClick={() => handleEdit(unit)}>Redigera</button>
                                        <button onClick={() => handleDelete(unit.id)}>Radera</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default UnitAdmin
