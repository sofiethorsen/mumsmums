import React, { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchPanel from './SearchPanel'
import { RecipePreview } from '../../graphql/types'

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}))

describe('SearchPanel', () => {
    const mockOnClose = jest.fn()
    const triggerRef = createRef<HTMLButtonElement>()
    const mockRecipes: RecipePreview[] = [
        { recipeId: 1, name: 'Kanelbullar', imageUrl: '/images/kanelbullar.jpg', description: 'Delicious cinnamon buns', steps: ['Step 1', 'Step 2'], servings: 12, numberOfUnits: undefined },
        { recipeId: 2, name: 'Kardemummabullar', imageUrl: '/images/kardemumma.jpg', description: 'Tasty cardamom buns', steps: ['Step 1'], servings: 10, numberOfUnits: undefined },
        { recipeId: 3, name: 'Chokladbollar', imageUrl: '/images/choklad.jpg', description: 'Chocolate balls', steps: ['Step 1', 'Step 2', 'Step 3'], servings: undefined, numberOfUnits: 20 },
    ]

    beforeEach(() => {
        mockOnClose.mockClear()
    })

    it('does not render when isOpen is false', () => {
        render(<SearchPanel isOpen={false} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        expect(screen.queryByPlaceholderText(/sök efter recept/i)).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        expect(screen.getByPlaceholderText(/sök efter recept/i)).toBeInTheDocument()
    })

    it('renders the search input with correct placeholder', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        const input = screen.getByPlaceholderText('Sök efter recept...')
        expect(input).toBeInTheDocument()
    })

    it('input has autofocus attribute', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        const input = screen.getByPlaceholderText(/sök efter recept/i)
        expect(input).toHaveProperty('autofocus')
    })

    it('calls onClose when backdrop is clicked', () => {
        const { container } = render(
            <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />
        )

        // The backdrop should be the first child with the backdrop class
        const backdrop = container.querySelector('[class*="backdrop"]')
        expect(backdrop).toBeInTheDocument()

        fireEvent.click(backdrop!)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when ESC key is pressed', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        fireEvent.keyDown(document, { key: 'Escape' })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when clicking inside the search panel', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        const input = screen.getByPlaceholderText(/sök efter recept/i)
        fireEvent.mouseDown(input)

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not call onClose when clicking the trigger element', () => {
        render(
            <>
                <button ref={triggerRef as React.RefObject<HTMLButtonElement>}>
                    Trigger
                </button>
                <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />
            </>
        )

        const trigger = screen.getByText('Trigger')
        fireEvent.mouseDown(trigger)

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not add event listeners when isOpen is false', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

        render(<SearchPanel isOpen={false} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

        expect(addEventListenerSpy).not.toHaveBeenCalled()

        addEventListenerSpy.mockRestore()
    })

    it('cleans up event listeners when unmounting', () => {
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

        const { unmount } = render(
            <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />
        )

        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

        removeEventListenerSpy.mockRestore()
    })

    describe('Search functionality', () => {
        it('shows search results when typing at least 2 characters', () => {
            render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

            const input = screen.getByPlaceholderText(/sök efter recept/i)
            fireEvent.change(input, { target: { value: 'kanel' } })

            expect(screen.getByText('Kanelbullar')).toBeInTheDocument()
        })

        it('shows fuzzy search results', () => {
            render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

            const input = screen.getByPlaceholderText(/sök efter recept/i)
            fireEvent.change(input, { target: { value: 'kardem' } })

            expect(screen.getByText('Kardemummabullar')).toBeInTheDocument()
        })

        it('shows no results message when no matches (at least 2 chars)', () => {
            render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

            const input = screen.getByPlaceholderText(/sök efter recept/i)
            fireEvent.change(input, { target: { value: 'pizza' } })

            expect(screen.getByText(/inga recept hittades för "pizza"/i)).toBeInTheDocument()
        })

        it('does not show no results message for single character', () => {
            render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

            const input = screen.getByPlaceholderText(/sök efter recept/i)
            fireEvent.change(input, { target: { value: 'z' } })

            expect(screen.queryByText(/inga recept hittades/i)).not.toBeInTheDocument()
        })

        it('resets search query when panel closes', () => {
            const { rerender } = render(
                <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />
            )

            const input = screen.getByPlaceholderText(/sök efter recept/i)
            fireEvent.change(input, { target: { value: 'kanel' } })

            rerender(<SearchPanel isOpen={false} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)
            rerender(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} recipes={mockRecipes} />)

            const newInput = screen.getByPlaceholderText(/sök efter recept/i)
            expect(newInput).toHaveValue('')
        })
    })
})
