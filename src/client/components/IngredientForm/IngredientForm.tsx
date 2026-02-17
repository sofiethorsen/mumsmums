import React, { useState, useEffect } from 'react'
import styles from './IngredientForm.module.css'
import type { LibraryIngredient } from '../../graphql/generated'

export interface IngredientFormValues {
    nameSv: string
    nameEn: string
    qualifierSv: string
    qualifierEn: string
    derivesFromId: number | null
    fullNameSv: string
    fullNameEn: string
}

interface IngredientFormProps {
    mode: 'create' | 'edit'
    initialValues?: Partial<IngredientFormValues>
    existingIngredients: LibraryIngredient[]
    editingId?: number | null
    onSubmit: (values: IngredientFormValues) => Promise<void>
    onCancel: () => void
    loading?: boolean
    error?: string | null
    compact?: boolean
}

const IngredientForm: React.FC<IngredientFormProps> = ({
    mode,
    initialValues,
    existingIngredients,
    editingId,
    onSubmit,
    onCancel,
    loading = false,
    error,
    compact = false,
}) => {
    const [nameSv, setNameSv] = useState(initialValues?.nameSv || '')
    const [nameEn, setNameEn] = useState(initialValues?.nameEn || '')
    const [qualifierSv, setQualifierSv] = useState(initialValues?.qualifierSv || '')
    const [qualifierEn, setQualifierEn] = useState(initialValues?.qualifierEn || '')
    const [derivesFromId, setDerivesFromId] = useState<number | null>(initialValues?.derivesFromId || null)
    const [fullNameSv, setFullNameSv] = useState(initialValues?.fullNameSv || '')
    const [fullNameEn, setFullNameEn] = useState(initialValues?.fullNameEn || '')

    // Auto-generate fullNameSv when name and qualifier change
    const updateFullName = (name: string, qualifier: string) => {
        if (qualifier.trim()) {
            setFullNameSv(`${name}, ${qualifier}`)
        } else {
            setFullNameSv(name)
        }
    }

    // Update fullNameSv on initial mount if we have an initial name
    useEffect(() => {
        if (initialValues?.nameSv && !initialValues?.fullNameSv) {
            updateFullName(initialValues.nameSv, initialValues.qualifierSv || '')
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nameSv.trim()) {
            alert('Namn (svenska) krävs')
            return
        }
        if (!fullNameSv.trim()) {
            alert('Visningsnamn (svenska) krävs')
            return
        }

        await onSubmit({
            nameSv: nameSv.trim(),
            nameEn: nameEn.trim(),
            qualifierSv: qualifierSv.trim(),
            qualifierEn: qualifierEn.trim(),
            derivesFromId,
            fullNameSv: fullNameSv.trim(),
            fullNameEn: fullNameEn.trim(),
        })
    }

    const formClass = compact ? styles.formCompact : styles.form

    return (
        <form onSubmit={handleSubmit} className={formClass}>
            {!compact && (
                <h3>{mode === 'create' ? 'Skapa ingrediens' : 'Redigera ingrediens'}</h3>
            )}

            {error && <div className={styles.error}>{error}</div>}

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
                        placeholder="t.ex. koriander, ägg"
                        autoFocus={compact}
                    />
                </div>
                {!compact && (
                    <div className={styles.formGroup}>
                        <label>Namn (engelska)</label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={(e) => setNameEn(e.target.value)}
                            placeholder="t.ex. coriander, egg"
                        />
                    </div>
                )}
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
                        placeholder="t.ex. malen, färsk"
                    />
                </div>
                {!compact && (
                    <div className={styles.formGroup}>
                        <label>Kvalificerare (engelska)</label>
                        <input
                            type="text"
                            value={qualifierEn}
                            onChange={(e) => setQualifierEn(e.target.value)}
                            placeholder="t.ex. ground, fresh"
                        />
                    </div>
                )}
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
                {!compact && (
                    <div className={styles.formGroup}>
                        <label>Visningsnamn (engelska)</label>
                        <input
                            type="text"
                            value={fullNameEn}
                            onChange={(e) => setFullNameEn(e.target.value)}
                            placeholder="t.ex. ground coriander"
                        />
                    </div>
                )}
            </div>

            <div className={styles.formGroup}>
                <label>Härleds från</label>
                <select
                    value={derivesFromId || ''}
                    onChange={(e) => setDerivesFromId(Number(e.target.value) || null)}
                >
                    <option value="">Ingen (grundingrediens)</option>
                    {existingIngredients
                        .filter(i => i.id !== editingId)
                        .map(ing => (
                            <option key={ing.id} value={ing.id}>
                                {ing.fullNameSv}
                            </option>
                        ))}
                </select>
            </div>

            <div className={styles.actions}>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                    {loading ? 'Sparar...' : 'Spara'}
                </button>
                <button type="button" onClick={onCancel} className={styles.cancelButton}>
                    Avbryt
                </button>
            </div>
        </form>
    )
}

export default IngredientForm
