import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UsedInSection from './UsedInSection'
import type { RecipeReference } from '../../graphql/generated'

// Mock Next.js Link component
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; sizes?: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fill, priority, sizes, ...imgProps } = props
        return <img {...imgProps} />
    },
}))

const createMockRecipes = (count: number): RecipeReference[] => {
    return Array.from({ length: count }, (_, i) => ({
        recipeId: i + 1,
        name: `Recipe ${i + 1}`,
        imageUrl: `/images/recipe-${i + 1}.webp`,
    }))
}

describe('UsedInSection', () => {
    let mockIntersectionObserver: jest.Mock

    beforeEach(() => {
        mockIntersectionObserver = jest.fn(function (
            this: IntersectionObserver & { callback: IntersectionObserverCallback },
            callback: IntersectionObserverCallback
        ) {
            this.observe = jest.fn()
            this.unobserve = jest.fn()
            this.disconnect = jest.fn()
            this.callback = callback
            return this
        })
        window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the title "Ingår i"', () => {
        const recipes = createMockRecipes(2)
        render(<UsedInSection recipes={recipes} />)

        expect(screen.getByText('Ingår i')).toBeInTheDocument()
    })

    it('renders all recipe cards', () => {
        const recipes = createMockRecipes(3)
        render(<UsedInSection recipes={recipes} />)

        expect(screen.getByText('Recipe 1')).toBeInTheDocument()
        expect(screen.getByText('Recipe 2')).toBeInTheDocument()
        expect(screen.getByText('Recipe 3')).toBeInTheDocument()
    })

    it('renders links to recipe pages', () => {
        const recipes = createMockRecipes(2)
        render(<UsedInSection recipes={recipes} />)

        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(2)
        expect(links[0]).toHaveAttribute('href', '/recipe/1')
        expect(links[1]).toHaveAttribute('href', '/recipe/2')
    })

    it('returns null when recipes array is empty', () => {
        const { container } = render(<UsedInSection recipes={[]} />)
        expect(container.firstChild).toBeNull()
    })

    it('returns null when recipes is undefined', () => {
        const { container } = render(<UsedInSection recipes={undefined as unknown as RecipeReference[]} />)
        expect(container.firstChild).toBeNull()
    })

    it('handles recipes without images', () => {
        const recipes: RecipeReference[] = [
            { recipeId: 1, name: 'No Image Recipe', imageUrl: undefined },
        ]
        render(<UsedInSection recipes={recipes} />)

        expect(screen.getByText('No Image Recipe')).toBeInTheDocument()
    })
})
