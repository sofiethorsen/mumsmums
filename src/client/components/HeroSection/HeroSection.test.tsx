import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeroSection from './HeroSection'
import { renderWithIntl } from '../../test-utils/renderWithIntl'

jest.mock('../IngredientSearch/IngredientSearch', () => ({
    __esModule: true,
    default: ({ selectedIds }: { selectedIds: number[] }) => (
        <div data-testid="ingredient-search">
            <span data-testid="selected-count">{selectedIds.length}</span>
        </div>
    ),
}))

describe('HeroSection', () => {
    const mockOnSearchChange = jest.fn()
    const mockOnTabChange = jest.fn()
    const mockOnIngredientSelectionChange = jest.fn()
    const defaultProps = {
        searchTab: 'name' as const,
        onTabChange: mockOnTabChange,
        searchQuery: '',
        onSearchChange: mockOnSearchChange,
        selectedIngredientIds: [] as number[],
        onIngredientSelectionChange: mockOnIngredientSelectionChange,
    }

    beforeEach(() => {
        mockOnSearchChange.mockClear()
        mockOnTabChange.mockClear()
        mockOnIngredientSelectionChange.mockClear()
    })

    it('renders the hero section', () => {
        const { container } = renderWithIntl(<HeroSection {...defaultProps} />)
        const section = container.querySelector('section')
        expect(section).toBeInTheDocument()
    })

    it('renders the title', () => {
        renderWithIntl(<HeroSection {...defaultProps} />)
        const title = screen.getByRole('heading', { name: /mumsmums/i })
        expect(title).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
        renderWithIntl(<HeroSection {...defaultProps} />)
        const subtitle = screen.getByText(/recept utan livshistorier/i)
        expect(subtitle).toBeInTheDocument()
    })

    describe('Tabs', () => {
        it('renders both tab buttons', () => {
            renderWithIntl(<HeroSection {...defaultProps} />)
            expect(screen.getByText(/sök på namn/i)).toBeInTheDocument()
            expect(screen.getByText(/sök på ingrediens/i)).toBeInTheDocument()
        })

        it('calls onTabChange when clicking ingredient tab', () => {
            renderWithIntl(<HeroSection {...defaultProps} />)
            fireEvent.click(screen.getByText(/sök på ingrediens/i))
            expect(mockOnTabChange).toHaveBeenCalledWith('ingredient')
        })

        it('calls onTabChange when clicking name tab', () => {
            renderWithIntl(<HeroSection {...defaultProps} searchTab="ingredient" />)
            fireEvent.click(screen.getByText(/sök på namn/i))
            expect(mockOnTabChange).toHaveBeenCalledWith('name')
        })

        it('renders search input on name tab', () => {
            renderWithIntl(<HeroSection {...defaultProps} searchTab="name" />)
            expect(screen.getByPlaceholderText(/sök recept/i)).toBeInTheDocument()
            expect(screen.queryByTestId('ingredient-search')).not.toBeInTheDocument()
        })

        it('renders ingredient search on ingredient tab', () => {
            renderWithIntl(<HeroSection {...defaultProps} searchTab="ingredient" />)
            expect(screen.getByTestId('ingredient-search')).toBeInTheDocument()
            expect(screen.queryByPlaceholderText(/sök recept/i)).not.toBeInTheDocument()
        })
    })

    describe('Search input', () => {
        it('renders the search input', () => {
            renderWithIntl(<HeroSection {...defaultProps} />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)
            expect(searchInput).toBeInTheDocument()
        })

        it('displays the search query value', () => {
            renderWithIntl(<HeroSection {...defaultProps} searchQuery="kanelbullar" />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)
            expect(searchInput).toHaveValue('kanelbullar')
        })

        it('calls onSearchChange when typing', () => {
            renderWithIntl(<HeroSection {...defaultProps} />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)

            fireEvent.change(searchInput, { target: { value: 'bullar' } })

            expect(mockOnSearchChange).toHaveBeenCalledTimes(1)
            expect(mockOnSearchChange).toHaveBeenCalledWith('bullar')
        })

        it('calls onSearchChange with empty string when cleared', () => {
            renderWithIntl(<HeroSection {...defaultProps} searchQuery="test" />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)

            fireEvent.change(searchInput, { target: { value: '' } })

            expect(mockOnSearchChange).toHaveBeenCalledWith('')
        })
    })

    describe('Search icon', () => {
        it('renders the search icon on name tab', () => {
            renderWithIntl(<HeroSection {...defaultProps} />)
            const svg = document.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })
    })
})
