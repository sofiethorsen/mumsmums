import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import IngredientRowEditor, { IngredientRowData } from './IngredientRowEditor'
import { LibraryIngredient, LibraryUnit, UnitType } from '../../graphql/generated'

const mockIngredient: IngredientRowData = {
    name: 'Mjöl',
    volume: 'dl',
    quantity: '2',
    recipeId: '',
    ingredientId: '1',
    unitId: '2',
}

const mockLibraryIngredients: LibraryIngredient[] = [
    { id: 1, nameSv: 'Mjöl', fullNameSv: 'Vetemjöl', nameEn: 'Flour', fullNameEn: 'Wheat flour' },
    { id: 2, nameSv: 'Socker', fullNameSv: 'Strösocker', nameEn: 'Sugar', fullNameEn: 'Granulated sugar' },
]

const mockLibraryUnits: LibraryUnit[] = [
    { id: 1, nameSv: 'Matsked', shortNameSv: 'msk', nameEn: 'Tablespoon', shortNameEn: 'tbsp', type: UnitType.Volume },
    { id: 2, nameSv: 'Deciliter', shortNameSv: 'dl', nameEn: 'Deciliter', shortNameEn: 'dl', type: UnitType.Volume },
]

describe('IngredientRowEditor', () => {
    const mockOnChange = jest.fn()
    const mockOnCreateNew = jest.fn()
    const mockOnRemove = jest.fn()

    const defaultProps = {
        ingredient: mockIngredient,
        libraryIngredients: mockLibraryIngredients,
        libraryUnits: mockLibraryUnits,
        canRemove: true,
        onChange: mockOnChange,
        onCreateNew: mockOnCreateNew,
        onRemove: mockOnRemove,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders quantity input with correct value', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        const quantityInput = screen.getByPlaceholderText('Mängd')
        expect(quantityInput).toHaveValue(2)
    })

    it('renders unit select with options', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        expect(screen.getByText('Välj enhet...')).toBeInTheDocument()
        expect(screen.getByText('msk (Matsked)')).toBeInTheDocument()
        expect(screen.getByText('dl (Deciliter)')).toBeInTheDocument()
    })

    it('renders recipe ID input', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        const recipeIdInput = screen.getByPlaceholderText('Recept-ID')
        expect(recipeIdInput).toBeInTheDocument()
    })

    it('calls onChange with updated quantity', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        const quantityInput = screen.getByPlaceholderText('Mängd')
        fireEvent.change(quantityInput, { target: { value: '3.5' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockIngredient,
            quantity: '3.5',
        })
    })

    it('calls onChange with updated recipeId', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        const recipeIdInput = screen.getByPlaceholderText('Recept-ID')
        fireEvent.change(recipeIdInput, { target: { value: '123' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockIngredient,
            recipeId: '123',
        })
    })

    it('calls onChange with updated unit and volume when unit is selected', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        const unitSelect = screen.getByRole('combobox')
        fireEvent.change(unitSelect, { target: { value: '1' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockIngredient,
            unitId: '1',
            volume: 'msk',
        })
    })

    it('clears unit and volume when empty unit is selected', () => {
        render(<IngredientRowEditor {...defaultProps} />)

        const unitSelect = screen.getByRole('combobox')
        fireEvent.change(unitSelect, { target: { value: '' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockIngredient,
            unitId: '',
            volume: '',
        })
    })

    it('shows remove button when canRemove is true', () => {
        const { container } = render(<IngredientRowEditor {...defaultProps} canRemove={true} />)

        const removeButton = container.querySelector('.removeButton')
        expect(removeButton).toBeInTheDocument()
    })

    it('does not show remove button when canRemove is false', () => {
        const { container } = render(<IngredientRowEditor {...defaultProps} canRemove={false} />)

        const removeButton = container.querySelector('.removeButton')
        expect(removeButton).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', () => {
        const { container } = render(<IngredientRowEditor {...defaultProps} canRemove={true} />)

        const removeButton = container.querySelector('.removeButton')
        fireEvent.click(removeButton!)

        expect(mockOnRemove).toHaveBeenCalled()
    })

    it('renders unit without short name correctly', () => {
        const unitsWithoutShortName = [
            { id: 3, nameSv: 'Styck', shortNameSv: null as string | null, nameEn: 'Piece', shortNameEn: null as string | null, type: UnitType.Count },
        ] as LibraryUnit[]

        render(<IngredientRowEditor {...defaultProps} libraryUnits={unitsWithoutShortName} />)

        expect(screen.getByText('Styck')).toBeInTheDocument()
    })

    it('sets empty volume when unit has no short name', () => {
        const unitsWithoutShortName = [
            { id: 3, nameSv: 'Styck', shortNameSv: null as string | null, nameEn: 'Piece', shortNameEn: null as string | null, type: UnitType.Count },
        ] as LibraryUnit[]

        render(<IngredientRowEditor {...defaultProps} libraryUnits={unitsWithoutShortName} />)

        const unitSelect = screen.getByRole('combobox')
        fireEvent.change(unitSelect, { target: { value: '3' } })

        expect(mockOnChange).toHaveBeenCalledWith({
            ...mockIngredient,
            unitId: '3',
            volume: '',
        })
    })
})
