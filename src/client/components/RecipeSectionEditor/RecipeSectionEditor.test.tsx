import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecipeSectionEditor, { RecipeSectionData } from './RecipeSectionEditor'
import { LibraryIngredient, LibraryUnit, UnitType } from '../../graphql/generated'

const mockSection: RecipeSectionData = {
    name: 'För degen',
    ingredients: [
        {
            name: 'Vetemjöl',
            volume: 'dl',
            quantity: '3',
            recipeId: '',
            ingredientId: '1',
            unitId: '2',
        },
    ],
}

const mockLibraryIngredients: LibraryIngredient[] = [
    { id: 1, nameSv: 'Mjöl', fullNameSv: 'Vetemjöl', nameEn: 'Flour', fullNameEn: 'Wheat flour' },
]

const mockLibraryUnits: LibraryUnit[] = [
    { id: 2, nameSv: 'Deciliter', shortNameSv: 'dl', nameEn: 'Deciliter', shortNameEn: 'dl', type: UnitType.Volume },
]

describe('RecipeSectionEditor', () => {
    const mockOnChange = jest.fn()
    const mockOnCreateNewIngredient = jest.fn()
    const mockOnRemove = jest.fn()

    const defaultProps = {
        section: mockSection,
        libraryIngredients: mockLibraryIngredients,
        libraryUnits: mockLibraryUnits,
        canRemove: true,
        onChange: mockOnChange,
        onCreateNewIngredient: mockOnCreateNewIngredient,
        onRemove: mockOnRemove,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders section name input with correct value', () => {
        render(<RecipeSectionEditor {...defaultProps} />)

        const nameInput = screen.getByPlaceholderText('Sektionsnamn (frivilligt)')
        expect(nameInput).toHaveValue('För degen')
    })

    it('renders ingredient rows', () => {
        render(<RecipeSectionEditor {...defaultProps} />)

        expect(screen.getByPlaceholderText('Mängd')).toHaveValue(3)
    })

    it('calls onChange with updated name when section name changes', () => {
        render(<RecipeSectionEditor {...defaultProps} />)

        const nameInput = screen.getByPlaceholderText('Sektionsnamn (frivilligt)')
        fireEvent.change(nameInput, { target: { value: 'För fyllningen' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockSection,
            name: 'För fyllningen',
        })
    })

    it('calls onChange when adding ingredient', () => {
        render(<RecipeSectionEditor {...defaultProps} />)

        fireEvent.click(screen.getByText('Lägg till ingrediens'))

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockSection,
            ingredients: [
                ...mockSection.ingredients,
                {
                    name: '',
                    volume: '',
                    quantity: '',
                    recipeId: '',
                    ingredientId: '',
                    unitId: '',
                },
            ],
        })
    })

    it('calls onChange when ingredient is updated', () => {
        render(<RecipeSectionEditor {...defaultProps} />)

        const quantityInput = screen.getByPlaceholderText('Mängd')
        fireEvent.change(quantityInput, { target: { value: '5' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockSection,
            ingredients: [{
                ...mockSection.ingredients[0],
                quantity: '5',
            }],
        })
    })

    it('shows remove button when canRemove is true', () => {
        render(<RecipeSectionEditor {...defaultProps} canRemove={true} />)

        expect(screen.getByText('Ta bort sektion')).toBeInTheDocument()
    })

    it('does not show remove button when canRemove is false', () => {
        render(<RecipeSectionEditor {...defaultProps} canRemove={false} />)

        expect(screen.queryByText('Ta bort sektion')).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', () => {
        render(<RecipeSectionEditor {...defaultProps} canRemove={true} />)

        fireEvent.click(screen.getByText('Ta bort sektion'))

        expect(mockOnRemove).toHaveBeenCalled()
    })

    it('does not show ingredient remove button when only one ingredient', () => {
        const { container } = render(<RecipeSectionEditor {...defaultProps} />)

        // The ingredient remove button has class removeButton
        const removeButtons = container.querySelectorAll('.removeButton')
        // Should only have the section remove button, not ingredient remove
        expect(removeButtons).toHaveLength(1)
    })

    it('shows ingredient remove buttons when multiple ingredients', () => {
        const sectionWithMultipleIngredients: RecipeSectionData = {
            ...mockSection,
            ingredients: [
                mockSection.ingredients[0],
                { ...mockSection.ingredients[0], ingredientId: '2' },
            ],
        }

        const { container } = render(
            <RecipeSectionEditor {...defaultProps} section={sectionWithMultipleIngredients} />
        )

        // Should have section remove button + 2 ingredient remove buttons
        const removeButtons = container.querySelectorAll('.removeButton')
        expect(removeButtons).toHaveLength(3)
    })

    it('calls onChange when removing an ingredient', () => {
        const sectionWithMultipleIngredients: RecipeSectionData = {
            ...mockSection,
            ingredients: [
                mockSection.ingredients[0],
                { ...mockSection.ingredients[0], ingredientId: '2', name: 'Second' },
            ],
        }

        const { container } = render(
            <RecipeSectionEditor {...defaultProps} section={sectionWithMultipleIngredients} />
        )

        // Click the first ingredient's remove button (index 1, since index 0 is section remove)
        const removeButtons = container.querySelectorAll('.removeButton')
        fireEvent.click(removeButtons[1])

        expect(mockOnChange).toHaveBeenCalledWith({
            ...sectionWithMultipleIngredients,
            ingredients: [sectionWithMultipleIngredients.ingredients[1]],
        })
    })
})
