import { renderHook, waitFor, act } from '@testing-library/react'
import { useUnits } from './useUnits'
import client from '../graphql/client'
import { UnitType } from '../graphql/generated'

// Mock the Apollo client
jest.mock('../graphql/client', () => ({
    query: jest.fn(),
}))

const mockClient = client as jest.Mocked<typeof client>

describe('useUnits', () => {
    const mockUnits = [
        { id: 1, shortNameSv: 'msk', shortNameEn: 'tbsp', nameSv: 'matsked', nameEn: 'tablespoon', type: UnitType.Volume, mlEquivalent: 15, gEquivalent: null },
        { id: 2, shortNameSv: 'tsk', shortNameEn: 'tsp', nameSv: 'tesked', nameEn: 'teaspoon', type: UnitType.Volume, mlEquivalent: 5, gEquivalent: null },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockClient.query.mockResolvedValue({ data: { units: mockUnits } })
    })

    it('fetches units on mount', async () => {
        const { result } = renderHook(() => useUnits())

        expect(result.current.loading).toBe(true)
        expect(result.current.units).toEqual([])

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.units).toEqual(mockUnits)
        expect(mockClient.query).toHaveBeenCalledWith({
            query: expect.anything(),
            fetchPolicy: 'cache-first',
        })
    })

    it('uses specified fetchPolicy', async () => {
        renderHook(() => useUnits({ fetchPolicy: 'network-only' }))

        await waitFor(() => {
            expect(mockClient.query).toHaveBeenCalledWith({
                query: expect.anything(),
                fetchPolicy: 'network-only',
            })
        })
    })

    it('sets error on fetch failure', async () => {
        mockClient.query.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useUnits())

        await waitFor(() => {
            expect(result.current.error).toBe('Kunde inte ladda enheter')
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.units).toEqual([])
    })

    it('addUnit adds to local state', async () => {
        const { result } = renderHook(() => useUnits())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const newUnit = { id: 3, shortNameSv: 'dl', shortNameEn: 'dl', nameSv: 'deciliter', nameEn: 'deciliter', type: UnitType.Volume, mlEquivalent: 100, gEquivalent: null }

        act(() => {
            result.current.addUnit(newUnit)
        })

        expect(result.current.units).toHaveLength(3)
        expect(result.current.units[2]).toEqual(newUnit)
    })

    it('updateUnit updates in local state', async () => {
        const { result } = renderHook(() => useUnits())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const updatedUnit = { ...mockUnits[0], nameSv: 'stor matsked' }

        act(() => {
            result.current.updateUnit(updatedUnit)
        })

        expect(result.current.units[0].nameSv).toBe('stor matsked')
    })

    it('removeUnit removes from local state', async () => {
        const { result } = renderHook(() => useUnits())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        act(() => {
            result.current.removeUnit(1)
        })

        expect(result.current.units).toHaveLength(1)
        expect(result.current.units[0].id).toBe(2)
    })

    it('reload fetches fresh data', async () => {
        const { result } = renderHook(() => useUnits())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(mockClient.query).toHaveBeenCalledTimes(1)

        await act(async () => {
            await result.current.reload()
        })

        expect(mockClient.query).toHaveBeenCalledTimes(2)
    })
})
