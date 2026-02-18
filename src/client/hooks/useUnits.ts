import { useState, useEffect, useCallback } from 'react'
import client from '../graphql/client'
import type { LibraryUnit } from '../graphql/generated'
import { GET_UNITS } from '../graphql/queries'

interface UseUnitsOptions {
    /** Use 'network-only' for admin pages that need fresh data, 'cache-first' for forms */
    fetchPolicy?: 'cache-first' | 'network-only'
}

interface UseUnitsResult {
    units: LibraryUnit[]
    loading: boolean
    error: string | null
    /** Reload data from network */
    reload: () => Promise<void>
    /** Add a unit to local state without refetching */
    addUnit: (unit: LibraryUnit) => void
    /** Update a unit in local state */
    updateUnit: (unit: LibraryUnit) => void
    /** Remove a unit from local state */
    removeUnit: (id: number) => void
}

export function useUnits(options: UseUnitsOptions = {}): UseUnitsResult {
    const { fetchPolicy = 'cache-first' } = options

    const [units, setUnits] = useState<LibraryUnit[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await client.query<{ units: LibraryUnit[] }>({
                query: GET_UNITS,
                fetchPolicy,
            })
            setUnits(result.data?.units ?? [])
        } catch {
            setError('Kunde inte ladda enheter')
        } finally {
            setLoading(false)
        }
    }, [fetchPolicy])

    useEffect(() => {
        loadData()
    }, [loadData])

    const addUnit = useCallback((unit: LibraryUnit) => {
        setUnits(prev => [...prev, unit])
    }, [])

    const updateUnit = useCallback((unit: LibraryUnit) => {
        setUnits(prev => prev.map(u => u.id === unit.id ? unit : u))
    }, [])

    const removeUnit = useCallback((id: number) => {
        setUnits(prev => prev.filter(u => u.id !== id))
    }, [])

    return {
        units,
        loading,
        error,
        reload: loadData,
        addUnit,
        updateUnit,
        removeUnit,
    }
}
