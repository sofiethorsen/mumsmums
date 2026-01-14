import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navigation from './Navigation'

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}))


// Mock the feature flags module
const mockFeatureFlags = {
    MENU: false,
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

    it('renders the home icon', () => {
        render(<Navigation />)
        const homeIcon = document.querySelector('img[src="/icons/home.svg"]')
        expect(homeIcon).toBeInTheDocument()
        expect(homeIcon).toHaveAttribute('alt', '')
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
            mockFeatureFlags.LOGIN = true
        })

        it('renders all navigation elements', () => {
            render(<Navigation />)

            expect(screen.getByRole('link', { name: /hem/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /meny/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /logga in/i })).toBeInTheDocument()
        })
    })

    describe('with all feature flags disabled', () => {
        it('renders only the logo (always visible)', () => {
            render(<Navigation />)

            // Logo should be present
            expect(screen.getByRole('link', { name: /hem/i })).toBeInTheDocument()

            // Feature-flagged buttons should not be present
            expect(screen.queryByRole('button', { name: /meny/i })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: /logga in/i })).not.toBeInTheDocument()
        })
    })
})
