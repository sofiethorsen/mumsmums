import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeroSection from './HeroSection'

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
        const { container } = render(<HeroSection {...defaultProps} />)
        const section = container.querySelector('section')
        expect(section).toBeInTheDocument()
    })

    it('renders the title', () => {
        render(<HeroSection {...defaultProps} />)
        const title = screen.getByRole('heading', { name: /mumsmums/i })
        expect(title).toBeInTheDocument()
    })

    it('renders the subtitle', () => {
        render(<HeroSection {...defaultProps} />)
        const subtitle = screen.getByText(/recept utan livshistorier/i)
        expect(subtitle).toBeInTheDocument()
    })

    describe('Search input', () => {
        it('renders the search input', () => {
            render(<HeroSection {...defaultProps} />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)
            expect(searchInput).toBeInTheDocument()
        })

        it('displays the search query value', () => {
            render(<HeroSection {...defaultProps} searchQuery="kanelbullar" />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)
            expect(searchInput).toHaveValue('kanelbullar')
        })

        it('calls onSearchChange when typing', () => {
            render(<HeroSection {...defaultProps} />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)

            fireEvent.change(searchInput, { target: { value: 'bullar' } })

            expect(mockOnSearchChange).toHaveBeenCalledTimes(1)
            expect(mockOnSearchChange).toHaveBeenCalledWith('bullar')
        })

        it('calls onSearchChange with empty string when cleared', () => {
            render(<HeroSection {...defaultProps} searchQuery="test" />)
            const searchInput = screen.getByPlaceholderText(/sök recept/i)

            fireEvent.change(searchInput, { target: { value: '' } })

            expect(mockOnSearchChange).toHaveBeenCalledWith('')
        })
    })

    describe('Search icon', () => {
        it('renders the search icon', () => {
            render(<HeroSection {...defaultProps} />)
            // SearchIcon renders an SVG with a circle (magnifying glass)
            const svg = document.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })
    })
})
