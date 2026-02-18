import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StepsEditor from './StepsEditor'

describe('StepsEditor', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    it('renders steps with numbers', () => {
        render(<StepsEditor steps={['First step', 'Second step']} onChange={mockOnChange} />)

        expect(screen.getByText('1.')).toBeInTheDocument()
        expect(screen.getByText('2.')).toBeInTheDocument()
        expect(screen.getByDisplayValue('First step')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Second step')).toBeInTheDocument()
    })

    it('calls onChange when updating a step', () => {
        render(<StepsEditor steps={['Original']} onChange={mockOnChange} />)

        const textarea = screen.getByDisplayValue('Original')
        fireEvent.change(textarea, { target: { value: 'Updated' } })

        expect(mockOnChange).toHaveBeenCalledWith(['Updated'])
    })

    it('calls onChange when adding a step', () => {
        render(<StepsEditor steps={['First']} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('Lägg till steg'))

        expect(mockOnChange).toHaveBeenCalledWith(['First', ''])
    })

    it('calls onChange when removing a step', () => {
        render(<StepsEditor steps={['First', 'Second']} onChange={mockOnChange} />)

        const removeButtons = screen.getAllByText('✕')
        fireEvent.click(removeButtons[0])

        expect(mockOnChange).toHaveBeenCalledWith(['Second'])
    })

    it('does not show remove button when only one step', () => {
        render(<StepsEditor steps={['Only step']} onChange={mockOnChange} />)

        expect(screen.queryByText('✕')).not.toBeInTheDocument()
    })

    it('shows remove buttons when multiple steps', () => {
        render(<StepsEditor steps={['First', 'Second']} onChange={mockOnChange} />)

        expect(screen.getAllByText('✕')).toHaveLength(2)
    })
})
