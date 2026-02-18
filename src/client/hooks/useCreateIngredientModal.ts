import { useState, useCallback } from 'react'
import client from '../graphql/client'
import type { LibraryIngredient } from '../graphql/generated'
import { CREATE_INGREDIENT } from '../graphql/queries'
import type { IngredientFormValues } from '../components/IngredientForm/IngredientForm'

interface ModalTarget {
    sectionIndex: number
    ingredientIndex: number
}

interface UseCreateIngredientModalResult {
    isOpen: boolean
    initialName: string
    target: ModalTarget | null
    loading: boolean
    error: string | null
    /** Open the modal with an initial name and target field */
    open: (name: string, target: ModalTarget) => void
    /** Close the modal and reset state */
    close: () => void
    /** Submit the form and return the created ingredient */
    submit: (values: IngredientFormValues) => Promise<LibraryIngredient | null>
}

export function useCreateIngredientModal(): UseCreateIngredientModalResult {
    const [isOpen, setIsOpen] = useState(false)
    const [initialName, setInitialName] = useState('')
    const [target, setTarget] = useState<ModalTarget | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const open = useCallback((name: string, modalTarget: ModalTarget) => {
        setInitialName(name)
        setTarget(modalTarget)
        setError(null)
        setIsOpen(true)
    }, [])

    const close = useCallback(() => {
        setIsOpen(false)
        setInitialName('')
        setTarget(null)
        setError(null)
    }, [])

    const submit = useCallback(async (values: IngredientFormValues): Promise<LibraryIngredient | null> => {
        setLoading(true)
        setError(null)
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

            const result = await client.mutate<{ createIngredient: LibraryIngredient }>({
                mutation: CREATE_INGREDIENT,
                variables: { input },
            })

            const newIngredient = result.data?.createIngredient ?? null
            if (newIngredient) {
                close()
            }
            return newIngredient
        } catch {
            setError('Kunde inte spara. Kontrollera att visningsnamnet är unikt.')
            return null
        } finally {
            setLoading(false)
        }
    }, [close])

    return {
        isOpen,
        initialName,
        target,
        loading,
        error,
        open,
        close,
        submit,
    }
}
