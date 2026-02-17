import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Modal from './Modal'

describe('Modal', () => {
    const mockOnClose = jest.fn()

    beforeEach(() => {
        mockOnClose.mockClear()
    })

    it('renders nothing when isOpen is false', () => {
        render(
            <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
        expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('renders title and content when isOpen is true', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        expect(screen.getByText('Test Modal')).toBeInTheDocument()
        expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('calls onClose when clicking the close button', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        fireEvent.click(screen.getByRole('button'))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when clicking the overlay', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        // Click on the overlay (the outer container)
        const overlay = screen.getByText('Test Modal').closest('[class*="overlay"]')
        if (overlay) {
            fireEvent.click(overlay)
        }

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when clicking inside the modal', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        fireEvent.click(screen.getByText('Modal content'))

        expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('calls onClose when pressing Escape key', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose on other key presses', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal content</p>
            </Modal>
        )

        fireEvent.keyDown(document, { key: 'Enter' })

        expect(mockOnClose).not.toHaveBeenCalled()
    })
})
