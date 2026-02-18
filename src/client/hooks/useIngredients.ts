import { useState, useEffect, useCallback } from 'react'
import client from '../graphql/client'
import type { LibraryIngredient } from '../graphql/generated'
import { GET_INGREDIENTS } from '../graphql/queries'

interface UseIngredientsOptions {
    /** Use 'network-only' for admin pages that need fresh data, 'cache-first' for forms */
    fetchPolicy?: 'cache-first' | 'network-only'
}

interface UseIngredientsResult {
    ingredients: LibraryIngredient[]
    loading: boolean
    error: string | null
    /** Reload data from network */
    reload: () => Promise<void>
    /** Add an ingredient to local state without refetching */
    addIngredient: (ingredient: LibraryIngredient) => void
    /** Update an ingredient in local state */
    updateIngredient: (ingredient: LibraryIngredient) => void
    /** Remove an ingredient from local state */
    removeIngredient: (id: number) => void
}

export function useIngredients(options: UseIngredientsOptions = {}): UseIngredientsResult {
    const { fetchPolicy = 'cache-first' } = options

    const [ingredients, setIngredients] = useState<LibraryIngredient[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await client.query<{ ingredients: LibraryIngredient[] }>({
                query: GET_INGREDIENTS,
                fetchPolicy,
            })
            setIngredients(result.data?.ingredients ?? [])
        } catch {
            setError('Kunde inte ladda ingredienser')
        } finally {
            setLoading(false)
        }
    }, [fetchPolicy])

    useEffect(() => {
        loadData()
    }, [loadData])

    const addIngredient = useCallback((ingredient: LibraryIngredient) => {
        setIngredients(prev => [...prev, ingredient])
    }, [])

    const updateIngredient = useCallback((ingredient: LibraryIngredient) => {
        setIngredients(prev => prev.map(i => i.id === ingredient.id ? ingredient : i))
    }, [])

    const removeIngredient = useCallback((id: number) => {
        setIngredients(prev => prev.filter(i => i.id !== id))
    }, [])

    return {
        ingredients,
        loading,
        error,
        reload: loadData,
        addIngredient,
        updateIngredient,
        removeIngredient,
    }
}
