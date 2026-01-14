import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from './HomePage'

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}))

// Mock the child components
jest.mock('../../components/PageHead/PageHead', () => ({
    __esModule: true,
    default: () => <div data-testid="page-head">PageHead</div>,
}))

jest.mock('../../components/PageFrame/PageFrame', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="page-frame">{children}</div>
    ),
}))

jest.mock('../../components/HeroSection/HeroSection', () => ({
    __esModule: true,
    default: ({
        searchQuery,
        onSearchChange,
        recipeCount,
    }: {
        searchQuery: string
        onSearchChange: (query: string) => void
        recipeCount: number
    }) => (
        <div data-testid="hero-section">
            <input
                data-testid="search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <span data-testid="recipe-count">{recipeCount}</span>
        </div>
    ),
}))

jest.mock('../../components/RecipeGrid/RecipeGrid', () => ({
    __esModule: true,
    default: ({
        recipes,
        searchQuery,
    }: {
        recipes: Array<{ recipeId: number; name: string }>
        searchQuery: string
    }) => (
        <div data-testid="recipe-grid">
            <span data-testid="search-query">{searchQuery}</span>
            <span data-testid="filtered-count">{recipes.length}</span>
            {recipes.map((recipe) => (
                <div key={recipe.recipeId} data-testid={`recipe-${recipe.recipeId}`}>
                    {recipe.name}
                </div>
            ))}
        </div>
    ),
}))

const mockRecipes = [
    { recipeId: 1, name: 'Kanelbullar', imageUrl: '/images/kanelbullar.jpg' },
    { recipeId: 2, name: 'Kardemummabullar', imageUrl: '/images/kardemumma.jpg' },
    { recipeId: 3, name: 'Semlor', imageUrl: '/images/semlor.jpg' },
    { recipeId: 4, name: 'Chokladbollar', imageUrl: '/images/choklad.jpg' },
]

describe('HomePage', () => {
    it('renders the page structure', () => {
        render(<HomePage recipes={mockRecipes} />)
        expect(screen.getByTestId('page-head')).toBeInTheDocument()
        expect(screen.getByTestId('page-frame')).toBeInTheDocument()
        expect(screen.getByTestId('hero-section')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-grid')).toBeInTheDocument()
    })

    it('displays all recipes when no search query', () => {
        render(<HomePage recipes={mockRecipes} />)
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        expect(screen.getByTestId('recipe-1')).toHaveTextContent('Kanelbullar')
        expect(screen.getByTestId('recipe-2')).toHaveTextContent('Kardemummabullar')
        expect(screen.getByTestId('recipe-3')).toHaveTextContent('Semlor')
        expect(screen.getByTestId('recipe-4')).toHaveTextContent('Chokladbollar')
    })

    it('displays the total recipe count in hero', () => {
        render(<HomePage recipes={mockRecipes} />)
        expect(screen.getByTestId('recipe-count')).toHaveTextContent('4')
    })

    describe('Search filtering', () => {
        it('filters recipes based on search query', () => {
            render(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            fireEvent.change(searchInput, { target: { value: 'bullar' } })

            // Should match Kanelbullar, Kardemummabullar, and Chokladbollar
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')
            expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
            expect(screen.getByTestId('recipe-2')).toBeInTheDocument()
            expect(screen.queryByTestId('recipe-3')).not.toBeInTheDocument()
            expect(screen.getByTestId('recipe-4')).toBeInTheDocument()
        })

        it('requires at least 2 characters to filter', () => {
            render(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            // Single character should show all recipes
            fireEvent.change(searchInput, { target: { value: 'k' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')

            // Two characters should filter
            fireEvent.change(searchInput, { target: { value: 'ka' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
        })

        it('is case insensitive', () => {
            render(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            fireEvent.change(searchInput, { target: { value: 'SEMLOR' } })

            expect(screen.getByTestId('filtered-count')).toHaveTextContent('1')
            expect(screen.getByTestId('recipe-3')).toHaveTextContent('Semlor')
        })

        it('handles partial matches with fuzzy search', () => {
            render(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            // Fuzzy search should match "Kanelbullar" and "Kardemummabullar"
            fireEvent.change(searchInput, { target: { value: 'kanel' } })

            expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
        })

        it('shows no results when no matches found', () => {
            render(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            fireEvent.change(searchInput, { target: { value: 'pizza' } })

            expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
        })

        it('clears filter when search is cleared', () => {
            render(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            // Filter
            fireEvent.change(searchInput, { target: { value: 'bullar' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')

            // Clear
            fireEvent.change(searchInput, { target: { value: '' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        })
    })

    it('handles empty recipe list', () => {
        render(<HomePage recipes={[]} />)
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
        expect(screen.getByTestId('recipe-count')).toHaveTextContent('0')
    })
})
