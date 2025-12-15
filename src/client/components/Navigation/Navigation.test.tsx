import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navigation from './Navigation'

// Mock the feature flags module
const mockFeatureFlags = {
    MENU: false,
    SEARCH: false,
    LOGIN: false,
}

jest.mock('../../constants/featureFlags', () => ({
    get FEATURE_FLAGS() {
        return mockFeatureFlags
    },
}))

describe('Navigation', () => {
    beforeEach(() => {
        // Reset all flags to false
        mockFeatureFlags.MENU = false
        mockFeatureFlags.SEARCH = false
        mockFeatureFlags.LOGIN = false
    })

    it('renders the navigation bar', () => {
        render(<Navigation />)
        const nav = screen.getByRole('navigation')
        expect(nav).toBeInTheDocument()
    })

    it('renders the logo that links to home', () => {
        render(<Navigation />)
        const homeLink = screen.getByRole('link', { name: /hem/i })
        expect(homeLink).toBeInTheDocument()
        expect(homeLink).toHaveAttribute('href', '/')
    })

    it('renders the logo icon', () => {
        render(<Navigation />)
        // Icon is inside a link with aria-label, so it should have empty alt (role="presentation")
        const logoIcon = screen.getByRole('presentation')
        expect(logoIcon).toHaveAttribute('src', '/icons/pan-frying.svg')
    })

    describe('with MENU feature flag enabled', () => {
        beforeEach(() => {
            mockFeatureFlags.MENU = true
        })

        it('renders the menu button', () => {
            render(<Navigation />)
            const menuButton = screen.getByRole('button', { name: /meny/i })
            expect(menuButton).toBeInTheDocument()
        })

        it('menu button has accessible label', () => {
            render(<Navigation />)
            const menuButton = screen.getByLabelText('Meny')
            expect(menuButton).toBeInTheDocument()
        })
    })

    describe('with SEARCH feature flag enabled', () => {
        beforeEach(() => {
            mockFeatureFlags.SEARCH = true
        })

        it('renders the search button', () => {
            render(<Navigation />)
            const searchButton = screen.getByRole('button', { name: /sök/i })
            expect(searchButton).toBeInTheDocument()
        })

        it('search button has accessible label', () => {
            render(<Navigation />)
            const searchButton = screen.getByLabelText('Sök')
            expect(searchButton).toBeInTheDocument()
        })
    })

    describe('with LOGIN feature flag enabled', () => {
        beforeEach(() => {
            mockFeatureFlags.LOGIN = true
        })

        it('renders the login button', () => {
            render(<Navigation />)
            const loginButton = screen.getByRole('button', { name: /logga in/i })
            expect(loginButton).toBeInTheDocument()
        })

        it('login button has accessible label', () => {
            render(<Navigation />)
            const loginButton = screen.getByLabelText('Logga in')
            expect(loginButton).toBeInTheDocument()
        })
    })

    describe('with all feature flags enabled', () => {
        beforeEach(() => {
            mockFeatureFlags.MENU = true
            mockFeatureFlags.SEARCH = true
            mockFeatureFlags.LOGIN = true
        })

        it('renders all navigation elements', () => {
            render(<Navigation />)

            expect(screen.getByRole('link', { name: /hem/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /meny/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /sök/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /logga in/i })).toBeInTheDocument()
        })
    })

    describe('with all feature flags disabled', () => {
        it('only renders the logo', () => {
            render(<Navigation />)

            // Logo should be present
            expect(screen.getByRole('link', { name: /hem/i })).toBeInTheDocument()

            // Buttons should not be present
            expect(screen.queryByRole('button', { name: /meny/i })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /sök/i })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /logga in/i })).not.toBeInTheDocument()
        })
    })
})
