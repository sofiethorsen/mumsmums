import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import StepsEditor from './StepsEditor'

describe('StepsEditor', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    it('renders steps with numbers', () => {
        render(<StepsEditor steps={['Första steget', 'Andra steget']} onChange={mockOnChange} />)

        expect(screen.getByText('1.')).toBeInTheDocument()
        expect(screen.getByText('2.')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Första steget')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Andra steget')).toBeInTheDocument()
    })

    it('calls onChange when updating a step', () => {
        render(<StepsEditor steps={['Ursprungligt']} onChange={mockOnChange} />)

        const textarea = screen.getByDisplayValue('Ursprungligt')
        fireEvent.change(textarea, { target: { value: 'Uppdaterat' } })

        expect(mockOnChange).toHaveBeenCalledWith(['Uppdaterat'])
    })

    it('calls onChange when adding a step', () => {
        render(<StepsEditor steps={['Första']} onChange={mockOnChange} />)

        fireEvent.click(screen.getByText('Lägg till steg'))

        expect(mockOnChange).toHaveBeenCalledWith(['Första', ''])
    })

    it('calls onChange when removing a step', () => {
        render(<StepsEditor steps={['Första', 'Andra']} onChange={mockOnChange} />)

        const removeButtons = screen.getAllByText('✕')
        fireEvent.click(removeButtons[0])

        expect(mockOnChange).toHaveBeenCalledWith(['Andra'])
    })

    it('does not show remove button when only one step', () => {
        render(<StepsEditor steps={['Enda steget']} onChange={mockOnChange} />)

        expect(screen.queryByText('✕')).not.toBeInTheDocument()
    })

    it('shows remove buttons when multiple steps', () => {
        render(<StepsEditor steps={['Första', 'Andra']} onChange={mockOnChange} />)

        expect(screen.getAllByText('✕')).toHaveLength(2)
    })
})
