import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeroSection from './HeroSection'
import { renderWithIntl } from '../../test-utils/renderWithIntl'

describe('HeroSection', () => {
    const mockOnSearchChange = jest.fn()
    const defaultProps = {
        searchQuery: '',
        onSearchChange: mockOnSearchChange,
    }

    beforeEach(() => {
        mockOnSearchChange.mockClear()
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
        it('renders the search icon', () => {
            renderWithIntl(<HeroSection {...defaultProps} />)
            // SearchIcon renders an SVG with a circle (magnifying glass)
            const svg = document.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })
    })
})
