import { renderHook, act } from '@testing-library/react'
import { useCreateIngredientModal } from './useCreateIngredientModal'
import client from '../graphql/client'

// Mock the Apollo client
jest.mock('../graphql/client', () => ({
    mutate: jest.fn(),
}))

const mockClient = client as jest.Mocked<typeof client>

describe('useCreateIngredientModal', () => {
    const mockIngredient = {
        id: 1,
        nameSv: 'Salt',
        nameEn: 'Salt',
        fullNameSv: 'Salt',
        fullNameEn: 'Salt',
        qualifierSv: null,
        qualifierEn: null,
        derivesFromId: null,
    }

    const mockFormValues = {
        nameSv: 'Salt',
        nameEn: 'Salt',
        qualifierSv: '',
        qualifierEn: '',
        derivesFromId: null,
        fullNameSv: 'Salt',
        fullNameEn: 'Salt',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockClient.mutate.mockResolvedValue({ data: { createIngredient: mockIngredient } })
    })

    it('initializes with closed state', () => {
        const { result } = renderHook(() => useCreateIngredientModal())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.initialName).toBe('')
        expect(result.current.target).toBe(null)
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(null)
    })

    it('open sets state correctly', () => {
        const { result } = renderHook(() => useCreateIngredientModal())

        act(() => {
            result.current.open('Salt', { sectionIndex: 0, ingredientIndex: 1 })
        })

        expect(result.current.isOpen).toBe(true)
        expect(result.current.initialName).toBe('Salt')
        expect(result.current.target).toEqual({ sectionIndex: 0, ingredientIndex: 1 })
    })

    it('close resets state', () => {
        const { result } = renderHook(() => useCreateIngredientModal())

        act(() => {
            result.current.open('Salt', { sectionIndex: 0, ingredientIndex: 1 })
        })

        act(() => {
            result.current.close()
        })

        expect(result.current.isOpen).toBe(false)
        expect(result.current.initialName).toBe('')
        expect(result.current.target).toBe(null)
    })

    it('submit creates ingredient and returns it', async () => {
        const { result } = renderHook(() => useCreateIngredientModal())

        act(() => {
            result.current.open('Salt', { sectionIndex: 0, ingredientIndex: 1 })
        })

        let createdIngredient
        await act(async () => {
            createdIngredient = await result.current.submit(mockFormValues)
        })

        expect(createdIngredient).toEqual(mockIngredient)
        expect(mockClient.mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                variables: {
                    input: {
                        nameSv: 'Salt',
                        nameEn: 'Salt',
                        qualifierSv: null,
                        qualifierEn: null,
                        derivesFromId: null,
                        fullNameSv: 'Salt',
                        fullNameEn: 'Salt',
                    },
                },
            })
        )
        expect(result.current.isOpen).toBe(false)
    })

    it('submit sets loading state', async () => {
        const { result } = renderHook(() => useCreateIngredientModal())

        act(() => {
            result.current.open('Salt', { sectionIndex: 0, ingredientIndex: 1 })
        })

        let submitPromise: Promise<unknown>
        act(() => {
            submitPromise = result.current.submit(mockFormValues)
        })

        expect(result.current.loading).toBe(true)

        await act(async () => {
            await submitPromise
        })

        expect(result.current.loading).toBe(false)
    })

    it('submit sets error on failure', async () => {
        mockClient.mutate.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useCreateIngredientModal())

        act(() => {
            result.current.open('Salt', { sectionIndex: 0, ingredientIndex: 1 })
        })

        let createdIngredient
        await act(async () => {
            createdIngredient = await result.current.submit(mockFormValues)
        })

        expect(createdIngredient).toBe(null)
        expect(result.current.error).toBe('Kunde inte spara. Kontrollera att visningsnamnet är unikt.')
        expect(result.current.isOpen).toBe(true) // stays open on error
    })
})
