import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import RecipeImage from './RecipeImage'

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; sizes?: string }) => {
        // Filter out Next.js-specific props
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { fill, priority, sizes, ...imgProps } = props
        return <img {...imgProps} />
    },
}))

describe('RecipeImage', () => {
    let mockIntersectionObserver: jest.Mock
    let mockObserve: jest.Mock
    let mockUnobserve: jest.Mock
    let mockDisconnect: jest.Mock

    beforeEach(() => {
        mockObserve = jest.fn()
        mockUnobserve = jest.fn()
        mockDisconnect = jest.fn()

        mockIntersectionObserver = jest.fn(function (
            this: IntersectionObserver & { callback: IntersectionObserverCallback },
            callback: IntersectionObserverCallback
        ) {
            this.observe = mockObserve
            this.unobserve = mockUnobserve
            this.disconnect = mockDisconnect
            this.callback = callback
            return this
        })

        window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Basic rendering', () => {
        it('renders with valid imageUrl', () => {
            render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                />
            )

            // Initially shows placeholder
            const images = screen.getAllByAltText('Test Recipe')
            expect(images).toHaveLength(1)
        })

        it('renders placeholder when imageUrl is undefined', () => {
            render(
                <RecipeImage imageUrl={undefined} imageAltText="Test Recipe" />
            )

            const images = screen.getAllByAltText('Test Recipe')
            expect(images).toHaveLength(1)
        })

        it('renders placeholder when imageUrl does not start with /images/', () => {
            render(
                <RecipeImage
                    imageUrl="https://external.com/image.jpg"
                    imageAltText="Test Recipe"
                />
            )

            const images = screen.getAllByAltText('Test Recipe')
            expect(images).toHaveLength(1)
        })
    })

    describe('Image URL handling', () => {
        it('handles URLs without .webp extension', async () => {
            const { container } = render(
                <RecipeImage
                    imageUrl="/images/recipe.jpg"
                    imageAltText="Test Recipe"
                    priority
                />
            )

            await waitFor(() => {
                const img = container.querySelector('img[src="/images/recipe.jpg"]')
                expect(img).toBeInTheDocument()
            })
        })
    })

    describe('Priority prop behavior', () => {
        it('loads image immediately when priority is true', () => {
            render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                    priority
                />
            )

            // IntersectionObserver should not be created when priority is true
            expect(mockIntersectionObserver).not.toHaveBeenCalled()
        })

        it('sets up IntersectionObserver when priority is false', () => {
            render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                    priority={false}
                />
            )

            expect(mockIntersectionObserver).toHaveBeenCalled()
            expect(mockObserve).toHaveBeenCalled()
        })

        it('sets up IntersectionObserver when priority is not provided (defaults to false)', () => {
            render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                />
            )

            expect(mockIntersectionObserver).toHaveBeenCalled()
            expect(mockObserve).toHaveBeenCalled()
        })
    })

    describe('IntersectionObserver behavior', () => {
        it('loads image when element comes into view', async () => {
            const { container } = render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                />
            )

            // Initially shows placeholder
            expect(mockIntersectionObserver).toHaveBeenCalled()

            // Simulate element coming into view
            const observerCallback = mockIntersectionObserver.mock.results[0].value.callback
            await act(async () => {
                observerCallback([{ isIntersecting: true }], mockIntersectionObserver.mock.results[0].value)
            })

            await waitFor(() => {
                const img = container.querySelector('img[src*=".webp"]')
                expect(img).toBeInTheDocument()
            })
        })

        it('does not load image when element is not intersecting', () => {
            const { container } = render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                />
            )

            // Simulate element NOT in view
            const observerCallback = mockIntersectionObserver.mock.results[0].value.callback
            observerCallback([{ isIntersecting: false }], mockIntersectionObserver.mock.results[0].value)

            // Should still show placeholder
            const img = container.querySelector('img[src*=".webp"]')
            expect(img).not.toBeInTheDocument()
        })

        it('disconnects observer when element comes into view', async () => {
            render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                />
            )

            const observerInstance = mockIntersectionObserver.mock.results[0].value
            const observerCallback = observerInstance.callback

            // Simulate element coming into view
            await act(async () => {
                observerCallback([{ isIntersecting: true }], observerInstance)
            })

            await waitFor(() => {
                expect(mockDisconnect).toHaveBeenCalled()
            })
        })

        it('disconnects observer on unmount', () => {
            const { unmount } = render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Test Recipe"
                />
            )

            unmount()

            expect(mockDisconnect).toHaveBeenCalled()
        })
    })

    describe('Alt text', () => {
        it('uses provided imageAltText for accessibility', () => {
            render(
                <RecipeImage
                    imageUrl="/images/recipe.webp"
                    imageAltText="Delicious Chocolate Cake"
                    priority
                />
            )

            expect(screen.getByAltText('Delicious Chocolate Cake')).toBeInTheDocument()
        })
    })
})
