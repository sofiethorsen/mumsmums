import React, { createRef } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SearchPanel from './SearchPanel'

describe('SearchPanel', () => {
    const mockOnClose = jest.fn()
    const triggerRef = createRef<HTMLButtonElement>()

    beforeEach(() => {
        mockOnClose.mockClear()
    })

    it('does not render when isOpen is false', () => {
        render(<SearchPanel isOpen={false} onClose={mockOnClose} triggerRef={triggerRef} />)

        expect(screen.queryByPlaceholderText(/sök efter recept/i)).not.toBeInTheDocument()
    })

    it('renders when isOpen is true', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />)

        expect(screen.getByPlaceholderText(/sök efter recept/i)).toBeInTheDocument()
    })

    it('renders the search input with correct placeholder', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />)

        const input = screen.getByPlaceholderText('Sök efter recept...')
        expect(input).toBeInTheDocument()
    })

    it('input has autofocus attribute', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />)

        const input = screen.getByPlaceholderText(/sök efter recept/i)
        expect(input).toHaveProperty('autofocus')
    })

    it('calls onClose when backdrop is clicked', () => {
        const { container } = render(
            <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />
        )

        // The backdrop should be the first child with the backdrop class
        const backdrop = container.querySelector('[class*="backdrop"]')
        expect(backdrop).toBeInTheDocument()

        fireEvent.click(backdrop!)
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when ESC key is pressed', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />)

        fireEvent.keyDown(document, { key: 'Escape' })
        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when clicking inside the search panel', () => {
        render(<SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />)

        const input = screen.getByPlaceholderText(/sök efter recept/i)
        fireEvent.mouseDown(input)

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not call onClose when clicking the trigger element', () => {
        const { container } = render(
            <>
                <button ref={triggerRef as React.RefObject<HTMLButtonElement>}>
                    Trigger
                </button>
                <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />
            </>
        )

        const trigger = screen.getByText('Trigger')
        fireEvent.mouseDown(trigger)

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('does not add event listeners when isOpen is false', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener')

        render(<SearchPanel isOpen={false} onClose={mockOnClose} triggerRef={triggerRef} />)

        expect(addEventListenerSpy).not.toHaveBeenCalled()

        addEventListenerSpy.mockRestore()
    })

    it('cleans up event listeners when unmounting', () => {
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')

        const { unmount } = render(
            <SearchPanel isOpen={true} onClose={mockOnClose} triggerRef={triggerRef} />
        )

        unmount()

        expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

        removeEventListenerSpy.mockRestore()
    })
})
