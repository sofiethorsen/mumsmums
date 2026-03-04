import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import IngredientSearch from './IngredientSearch'
import { renderWithIntl } from '../../test-utils/renderWithIntl'

const mockIngredients = [
    { id: 1, nameSv: 'Mjöl', nameEn: 'Flour', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Vetemjöl', fullNameEn: 'Wheat flour' },
    { id: 2, nameSv: 'Socker', nameEn: 'Sugar', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Strösocker', fullNameEn: 'Granulated sugar' },
    { id: 3, nameSv: 'Smör', nameEn: 'Butter', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Smör', fullNameEn: 'Butter' },
]

jest.mock('../../hooks', () => ({
    useIngredients: () => ({
        ingredients: mockIngredients,
        loading: false,
        error: null,
        reload: jest.fn(),
        addIngredient: jest.fn(),
        updateIngredient: jest.fn(),
        removeIngredient: jest.fn(),
    }),
}))

describe('IngredientSearch', () => {
    const mockOnSelectionChange = jest.fn()

    beforeEach(() => {
        mockOnSelectionChange.mockClear()
    })

    it('renders the autocomplete picker', () => {
        renderWithIntl(
            <IngredientSearch selectedIds={[]} onSelectionChange={mockOnSelectionChange} />
        )
        const input = screen.getByPlaceholderText(/sök efter ingrediens/i)
        expect(input).toBeInTheDocument()
    })

    it('calls onSelectionChange when an ingredient is selected', () => {
        renderWithIntl(
            <IngredientSearch selectedIds={[]} onSelectionChange={mockOnSelectionChange} />
        )
        const input = screen.getByPlaceholderText(/sök efter ingrediens/i)

        fireEvent.change(input, { target: { value: 'Vete' } })
        fireEvent.focus(input)

        const option = screen.getByText('Vetemjöl')
        fireEvent.click(option)

        expect(mockOnSelectionChange).toHaveBeenCalledWith([1])
    })

    it('renders chips for selected ingredients', () => {
        renderWithIntl(
            <IngredientSearch selectedIds={[1, 3]} onSelectionChange={mockOnSelectionChange} />
        )
        expect(screen.getByText('Vetemjöl')).toBeInTheDocument()
        expect(screen.getByText('Smör')).toBeInTheDocument()
    })

    it('removes a chip when the remove button is clicked', () => {
        renderWithIntl(
            <IngredientSearch selectedIds={[1, 2]} onSelectionChange={mockOnSelectionChange} />
        )
        const removeButtons = screen.getAllByRole('button', { name: /ta bort/i })
        fireEvent.click(removeButtons[0])

        expect(mockOnSelectionChange).toHaveBeenCalledWith([2])
    })

    it('filters out already-selected ingredients from options', () => {
        renderWithIntl(
            <IngredientSearch selectedIds={[1]} onSelectionChange={mockOnSelectionChange} />
        )
        const input = screen.getByPlaceholderText(/sök efter ingrediens/i)

        fireEvent.change(input, { target: { value: 'Vete' } })
        fireEvent.focus(input)

        // Vetemjöl appears in chip, but should not appear in the dropdown options
        const listItems = screen.queryAllByRole('listitem')
        const dropdownTexts = listItems.map((li) => li.textContent)
        expect(dropdownTexts).not.toContain('Vetemjöl')
    })
})
