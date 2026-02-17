import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AutocompletePicker from './AutocompletePicker'

describe('AutocompletePicker', () => {
    const mockOnChange = jest.fn()
    const mockOptions = [
        { id: '1', label: 'Apple' },
        { id: '2', label: 'Banana' },
        { id: '3', label: 'Cherry' },
        { id: '4', label: 'Apricot' },
    ]

    const defaultProps = {
        options: mockOptions,
        value: '',
        onChange: mockOnChange,
        placeholder: 'Search...',
    }

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    it('renders the input with placeholder', () => {
        render(<AutocompletePicker {...defaultProps} />)
        const input = screen.getByPlaceholderText('Search...')
        expect(input).toBeInTheDocument()
    })

    it('does not show dropdown when input is empty', () => {
        render(<AutocompletePicker {...defaultProps} />)
        const input = screen.getByPlaceholderText('Search...')
        fireEvent.focus(input)

        expect(screen.queryByRole('list')).not.toBeInTheDocument()
    })

    it('shows filtered options when typing', () => {
        render(<AutocompletePicker {...defaultProps} />)
        const input = screen.getByPlaceholderText('Search...')

        fireEvent.change(input, { target: { value: 'ap' } })

        expect(screen.getByText('Apple')).toBeInTheDocument()
        expect(screen.getByText('Apricot')).toBeInTheDocument()
        expect(screen.queryByText('Banana')).not.toBeInTheDocument()
        expect(screen.queryByText('Cherry')).not.toBeInTheDocument()
    })

    it('shows "Inga resultat" when no options match', () => {
        render(<AutocompletePicker {...defaultProps} />)
        const input = screen.getByPlaceholderText('Search...')

        fireEvent.change(input, { target: { value: 'xyz' } })

        expect(screen.getByText('Inga resultat')).toBeInTheDocument()
    })

    it('calls onChange when selecting an option', () => {
        render(<AutocompletePicker {...defaultProps} />)
        const input = screen.getByPlaceholderText('Search...')

        fireEvent.change(input, { target: { value: 'ban' } })
        fireEvent.click(screen.getByText('Banana'))

        expect(mockOnChange).toHaveBeenCalledWith('2')
    })

    it('displays selected value when value prop is set', () => {
        render(<AutocompletePicker {...defaultProps} value="2" />)

        expect(screen.getByText('Banana')).toBeInTheDocument()
        expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument()
    })

    it('clears selection when clear button is clicked', () => {
        render(<AutocompletePicker {...defaultProps} value="2" />)

        const clearButton = screen.getByRole('button')
        fireEvent.click(clearButton)

        expect(mockOnChange).toHaveBeenCalledWith('')
    })

    it('allows editing when clicking on selected value', () => {
        render(<AutocompletePicker {...defaultProps} value="2" />)

        fireEvent.click(screen.getByText('Banana'))

        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    describe('keyboard navigation', () => {
        it('selects option with Enter key', () => {
            render(<AutocompletePicker {...defaultProps} />)
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'ap' } })
            fireEvent.keyDown(input, { key: 'Enter' })

            expect(mockOnChange).toHaveBeenCalledWith('1') // First filtered option (Apple)
        })

        it('navigates options with arrow keys', () => {
            render(<AutocompletePicker {...defaultProps} />)
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'ap' } })
            fireEvent.keyDown(input, { key: 'ArrowDown' })
            fireEvent.keyDown(input, { key: 'Enter' })

            expect(mockOnChange).toHaveBeenCalledWith('4') // Second filtered option (Apricot)
        })

        it('closes dropdown with Escape key', () => {
            render(<AutocompletePicker {...defaultProps} />)
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'ap' } })
            expect(screen.getByText('Apple')).toBeInTheDocument()

            fireEvent.keyDown(input, { key: 'Escape' })
            expect(screen.queryByText('Apple')).not.toBeInTheDocument()
        })
    })

    describe('case insensitive search', () => {
        it('matches options regardless of case', () => {
            render(<AutocompletePicker {...defaultProps} />)
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'APPLE' } })

            expect(screen.getByText('Apple')).toBeInTheDocument()
        })
    })

    describe('onCreateNew', () => {
        const mockOnCreateNew = jest.fn()

        beforeEach(() => {
            mockOnCreateNew.mockClear()
        })

        it('shows create option when onCreateNew is provided and query has no matches', () => {
            render(
                <AutocompletePicker
                    {...defaultProps}
                    onCreateNew={mockOnCreateNew}
                    createNewLabel={(q) => `Create "${q}"`}
                />
            )
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'Mango' } })

            expect(screen.getByText('Create "Mango"')).toBeInTheDocument()
        })

        it('shows create option alongside matching results', () => {
            render(
                <AutocompletePicker
                    {...defaultProps}
                    onCreateNew={mockOnCreateNew}
                    createNewLabel={(q) => `Create "${q}"`}
                />
            )
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'App' } })

            expect(screen.getByText('Apple')).toBeInTheDocument()
            expect(screen.getByText('Create "App"')).toBeInTheDocument()
        })

        it('calls onCreateNew when clicking create option', () => {
            render(
                <AutocompletePicker
                    {...defaultProps}
                    onCreateNew={mockOnCreateNew}
                    createNewLabel={(q) => `Create "${q}"`}
                />
            )
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'Mango' } })
            fireEvent.click(screen.getByText('Create "Mango"'))

            expect(mockOnCreateNew).toHaveBeenCalledWith('Mango')
        })

        it('calls onCreateNew when selecting create option with keyboard', () => {
            render(
                <AutocompletePicker
                    {...defaultProps}
                    onCreateNew={mockOnCreateNew}
                    createNewLabel={(q) => `Create "${q}"`}
                />
            )
            const input = screen.getByPlaceholderText('Search...')

            fireEvent.change(input, { target: { value: 'Mango' } })
            fireEvent.keyDown(input, { key: 'Enter' })

            expect(mockOnCreateNew).toHaveBeenCalledWith('Mango')
        })

        it('does not show create option when query is empty', () => {
            render(
                <AutocompletePicker
                    {...defaultProps}
                    onCreateNew={mockOnCreateNew}
                    createNewLabel={(q) => `Create "${q}"`}
                />
            )
            const input = screen.getByPlaceholderText('Search...')
            fireEvent.focus(input)

            expect(screen.queryByText(/Create/)).not.toBeInTheDocument()
        })
    })
})
