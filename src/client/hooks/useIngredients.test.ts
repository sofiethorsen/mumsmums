import { renderHook, waitFor, act } from '@testing-library/react'
import { useIngredients } from './useIngredients'
import client from '../graphql/client'

// Mock the Apollo client
jest.mock('../graphql/client', () => ({
    query: jest.fn(),
}))

const mockClient = client as jest.Mocked<typeof client>

describe('useIngredients', () => {
    const mockIngredients = [
        { id: 1, nameSv: 'Salt', nameEn: 'Salt', fullNameSv: 'Salt', fullNameEn: 'Salt', qualifierSv: null, qualifierEn: null, derivesFromId: null },
        { id: 2, nameSv: 'Peppar', nameEn: 'Pepper', fullNameSv: 'Peppar', fullNameEn: 'Pepper', qualifierSv: null, qualifierEn: null, derivesFromId: null },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockClient.query.mockResolvedValue({ data: { ingredients: mockIngredients } })
    })

    it('fetches ingredients on mount', async () => {
        const { result } = renderHook(() => useIngredients())

        expect(result.current.loading).toBe(true)
        expect(result.current.ingredients).toEqual([])

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        expect(result.current.ingredients).toEqual(mockIngredients)
        expect(mockClient.query).toHaveBeenCalledWith({
            query: expect.anything(),
            fetchPolicy: 'cache-first',
        })
    })

    it('uses specified fetchPolicy', async () => {
        renderHook(() => useIngredients({ fetchPolicy: 'network-only' }))

        await waitFor(() => {
            expect(mockClient.query).toHaveBeenCalledWith({
                query: expect.anything(),
                fetchPolicy: 'network-only',
            })
        })
    })

    it('sets error on fetch failure', async () => {
        mockClient.query.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useIngredients())

        await waitFor(() => {
            expect(result.current.error).toBe('Kunde inte ladda ingredienser')
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.ingredients).toEqual([])
    })

    it('addIngredient adds to local state', async () => {
        const { result } = renderHook(() => useIngredients())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const newIngredient = { id: 3, nameSv: 'Socker', nameEn: 'Sugar', fullNameSv: 'Socker', fullNameEn: 'Sugar', qualifierSv: null, qualifierEn: null, derivesFromId: null }

        act(() => {
            result.current.addIngredient(newIngredient)
        })

        expect(result.current.ingredients).toHaveLength(3)
        expect(result.current.ingredients[2]).toEqual(newIngredient)
    })

    it('updateIngredient updates in local state', async () => {
        const { result } = renderHook(() => useIngredients())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        const updatedIngredient = { ...mockIngredients[0], nameSv: 'Havssalt' }

        act(() => {
            result.current.updateIngredient(updatedIngredient)
        })

        expect(result.current.ingredients[0].nameSv).toBe('Havssalt')
    })

    it('removeIngredient removes from local state', async () => {
        const { result } = renderHook(() => useIngredients())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
        })

        act(() => {
            result.current.removeIngredient(1)
        })

        expect(result.current.ingredients).toHaveLength(1)
        expect(result.current.ingredients[0].id).toBe(2)
    })

    it('reload fetches fresh data', async () => {
        const { result } = renderHook(() => useIngredients())

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
