import { useState, useEffect, useCallback } from 'react'
import client from '../graphql/client'
import type { Category } from '../graphql/generated'
import { GET_CATEGORIES } from '../graphql/queries'

interface UseCategoriesOptions {
    /** Use 'network-only' for admin pages that need fresh data, 'cache-first' for forms */
    fetchPolicy?: 'cache-first' | 'network-only'
}

interface UseCategoriesResult {
    categories: Category[]
    loading: boolean
    error: string | null
    /** Reload data from network */
    reload: () => Promise<void>
    /** Add a category to local state without refetching */
    addCategory: (category: Category) => void
    /** Update a category in local state */
    updateCategory: (category: Category) => void
    /** Remove a category from local state */
    removeCategory: (id: number) => void
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesResult {
    const { fetchPolicy = 'cache-first' } = options

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await client.query<{ categories: Category[] }>({
                query: GET_CATEGORIES,
                fetchPolicy,
            })
            setCategories(result.data?.categories ?? [])
        } catch {
            setError('Kunde inte ladda kategorier')
        } finally {
            setLoading(false)
        }
    }, [fetchPolicy])

    useEffect(() => {
        loadData()
    }, [loadData])

    const addCategory = useCallback((category: Category) => {
        setCategories(prev => [...prev, category])
    }, [])

    const updateCategory = useCallback((category: Category) => {
        setCategories(prev => prev.map(c => c.id === category.id ? category : c))
    }, [])

    const removeCategory = useCallback((id: number) => {
        setCategories(prev => prev.filter(c => c.id !== id))
    }, [])

    return {
        categories,
        loading,
        error,
        reload: loadData,
        addCategory,
        updateCategory,
        removeCategory,
    }
}
