import type { ReactNode } from 'react'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from './HomePage'
import { renderWithIntl } from '../../test-utils/renderWithIntl'

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}))

// Library ingredients: 20 (smält smör) derives from 10 (smör)
const mockLibraryIngredients = [
    { id: 10, nameSv: 'Smör', nameEn: 'Butter', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Smör', fullNameEn: 'Butter' },
    { id: 20, nameSv: 'Smör', nameEn: 'Butter', qualifierSv: 'smält', qualifierEn: 'melted', derivesFromId: 10, fullNameSv: 'Smält smör', fullNameEn: 'Melted butter' },
    { id: 30, nameSv: 'Mjöl', nameEn: 'Flour', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Vetemjöl', fullNameEn: 'Wheat flour' },
    { id: 40, nameSv: 'Socker', nameEn: 'Sugar', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Strösocker', fullNameEn: 'Granulated sugar' },
    { id: 50, nameSv: 'Ägg', nameEn: 'Egg', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Ägg', fullNameEn: 'Egg' },
    { id: 60, nameSv: 'Mandel', nameEn: 'Almond', qualifierSv: null, qualifierEn: null, derivesFromId: null, fullNameSv: 'Mandelmassa', fullNameEn: 'Almond paste' },
]

jest.mock('../../hooks', () => ({
    useIngredients: () => ({
        ingredients: mockLibraryIngredients,
        loading: false,
        error: null,
        reload: jest.fn(),
        addIngredient: jest.fn(),
        updateIngredient: jest.fn(),
        removeIngredient: jest.fn(),
    }),
}))

// Mock the child components
jest.mock('../../components/PageHead/PageHead', () => ({
    __esModule: true,
    default: () => <div data-testid="page-head">PageHead</div>,
}))

jest.mock('../../components/PageFrame/PageFrame', () => ({
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => (
        <div data-testid="page-frame">{children}</div>
    ),
}))

jest.mock('../../components/HeroSection/HeroSection', () => ({
    __esModule: true,
    default: ({
        searchTab,
        onTabChange,
        searchQuery,
        onSearchChange,
        selectedIngredientIds,
        onIngredientSelectionChange,
    }: {
        searchTab: string
        onTabChange: (tab: string) => void
        searchQuery: string
        onSearchChange: (query: string) => void
        selectedIngredientIds: number[]
        onIngredientSelectionChange: (ids: number[]) => void
    }) => (
        <div data-testid="hero-section">
            <span data-testid="search-tab">{searchTab}</span>
            <input
                data-testid="search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <button
                data-testid="tab-name"
                onClick={() => onTabChange('name')}
            />
            <button
                data-testid="tab-ingredient"
                onClick={() => onTabChange('ingredient')}
            />
            <button
                data-testid="select-ingredients"
                onClick={() => onIngredientSelectionChange([10, 20])}
            />
            <button
                data-testid="select-ingredient-10"
                onClick={() => onIngredientSelectionChange([10])}
            />
            <button
                data-testid="clear-ingredients"
                onClick={() => onIngredientSelectionChange([])}
            />
            <span data-testid="selected-ids">{selectedIngredientIds.join(',')}</span>
        </div>
    ),
}))

jest.mock('../../components/RecipeGrid/RecipeGrid', () => ({
    __esModule: true,
    default: ({
        recipes,
        searchQuery,
        selectedIngredientCount,
    }: {
        recipes: Array<{ recipeId: number; nameSv: string }>
        searchQuery: string
        selectedIngredientCount?: number
    }) => (
        <div data-testid="recipe-grid">
            <span data-testid="search-query">{searchQuery}</span>
            <span data-testid="filtered-count">{recipes.length}</span>
            <span data-testid="ingredient-count">{selectedIngredientCount ?? ''}</span>
            {recipes.map((recipe) => (
                <div key={recipe.recipeId} data-testid={`recipe-${recipe.recipeId}`}>
                    {recipe.nameSv}
                </div>
            ))}
        </div>
    ),
}))

const mockRecipes = [
    { recipeId: 1, nameSv: 'Kanelbullar', nameEn: null, imageUrl: '/images/kanelbullar.jpg', descriptionSv: 'Klassiska kanelbullar', descriptionEn: null, stepsSv: ['Steg 1', 'Steg 2'], stepsEn: [], servings: 12, numberOfUnits: undefined, ingredientIds: [10, 20, 30] },
    { recipeId: 2, nameSv: 'Kardemummabullar', nameEn: null, imageUrl: '/images/kardemumma.jpg', descriptionSv: 'Goda kardemummabullar', descriptionEn: null, stepsSv: ['Steg 1'], stepsEn: [], servings: 10, numberOfUnits: undefined, ingredientIds: [10, 40] },
    { recipeId: 3, nameSv: 'Semlor', nameEn: null, imageUrl: '/images/semlor.jpg', descriptionSv: 'Traditionella semlor', descriptionEn: null, stepsSv: ['Steg 1', 'Steg 2', 'Steg 3'], stepsEn: [], servings: 8, numberOfUnits: undefined, ingredientIds: [20, 50, 60] },
    { recipeId: 4, nameSv: 'Chokladbollar', nameEn: null, imageUrl: '/images/choklad.jpg', descriptionSv: 'Klassiska chokladbollar', descriptionEn: null, stepsSv: ['Steg 1', 'Steg 2'], stepsEn: [], servings: undefined, numberOfUnits: 20, ingredientIds: [10, 20] },
]

describe('HomePage', () => {
    it('renders the page structure', () => {
        renderWithIntl(<HomePage recipes={mockRecipes} />)
        expect(screen.getByTestId('page-head')).toBeInTheDocument()
        expect(screen.getByTestId('page-frame')).toBeInTheDocument()
        expect(screen.getByTestId('hero-section')).toBeInTheDocument()
        expect(screen.getByTestId('recipe-grid')).toBeInTheDocument()
    })

    it('displays all recipes when no search query', () => {
        renderWithIntl(<HomePage recipes={mockRecipes} />)
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        expect(screen.getByTestId('recipe-1')).toHaveTextContent('Kanelbullar')
        expect(screen.getByTestId('recipe-2')).toHaveTextContent('Kardemummabullar')
        expect(screen.getByTestId('recipe-3')).toHaveTextContent('Semlor')
        expect(screen.getByTestId('recipe-4')).toHaveTextContent('Chokladbollar')
    })

    describe('Search filtering', () => {
        it('filters recipes based on search query', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
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
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            // Single character should show all recipes
            fireEvent.change(searchInput, { target: { value: 'k' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')

            // Two characters should filter
            fireEvent.change(searchInput, { target: { value: 'ka' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('2')
        })

        it('is case insensitive', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            fireEvent.change(searchInput, { target: { value: 'SEMLOR' } })

            expect(screen.getByTestId('filtered-count')).toHaveTextContent('1')
            expect(screen.getByTestId('recipe-3')).toHaveTextContent('Semlor')
        })

        it('handles partial matches with fuzzy search', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            // Fuzzy search should match "Kanelbullar" and "Kardemummabullar"
            fireEvent.change(searchInput, { target: { value: 'kanel' } })

            expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
        })

        it('shows no results when no matches found', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            fireEvent.change(searchInput, { target: { value: 'pizza' } })

            expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
        })

        it('clears filter when search is cleared', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            const searchInput = screen.getByTestId('search-input')

            // Filter
            fireEvent.change(searchInput, { target: { value: 'bullar' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')

            // Clear
            fireEvent.change(searchInput, { target: { value: '' } })
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        })
    })

    describe('Ingredient filtering', () => {
        it('shows all recipes when ingredient tab is active with no selection', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            fireEvent.click(screen.getByTestId('tab-ingredient'))
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        })

        it('filters recipes that contain all selected ingredients (AND logic)', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            fireEvent.click(screen.getByTestId('tab-ingredient'))
            fireEvent.click(screen.getByTestId('select-ingredients')) // selects [10, 20]

            // Library: ingredient 20 derives from 10
            // Recipe 1 has [10,20,30] -> has 10 directly, has 20 directly
            // Recipe 2 has [10,40] -> has 10 directly, missing 20 (and no derived)
            // Recipe 3 has [20,50,60] -> has 20 directly, 20 derives from 10 so matches 10 too
            // Recipe 4 has [10,20] -> has both directly
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')
            expect(screen.getByTestId('recipe-1')).toBeInTheDocument()
            expect(screen.queryByTestId('recipe-2')).not.toBeInTheDocument()
            expect(screen.getByTestId('recipe-3')).toBeInTheDocument()
            expect(screen.getByTestId('recipe-4')).toBeInTheDocument()
        })

        it('matches derived ingredients when selecting a parent', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            fireEvent.click(screen.getByTestId('tab-ingredient'))
            fireEvent.click(screen.getByTestId('select-ingredient-10')) // selects [10] (smör)

            // Library: ingredient 20 (smält smör) derives from 10 (smör)
            // Recipe 1 has [10,20,30] -> has 10 directly
            // Recipe 2 has [10,40] -> has 10 directly
            // Recipe 3 has [20,50,60] -> 20 derives from 10, so matches
            // Recipe 4 has [10,20] -> has 10 directly
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        })

        it('passes selectedIngredientCount to RecipeGrid', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            fireEvent.click(screen.getByTestId('tab-ingredient'))
            fireEvent.click(screen.getByTestId('select-ingredients')) // selects [10, 20]

            expect(screen.getByTestId('ingredient-count')).toHaveTextContent('2')
        })

        it('shows all recipes when ingredients are cleared', () => {
            renderWithIntl(<HomePage recipes={mockRecipes} />)
            fireEvent.click(screen.getByTestId('tab-ingredient'))
            fireEvent.click(screen.getByTestId('select-ingredients'))
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('3')

            fireEvent.click(screen.getByTestId('clear-ingredients'))
            expect(screen.getByTestId('filtered-count')).toHaveTextContent('4')
        })
    })

    it('handles empty recipe list', () => {
        renderWithIntl(<HomePage recipes={[]} />)
        expect(screen.getByTestId('filtered-count')).toHaveTextContent('0')
    })
})
