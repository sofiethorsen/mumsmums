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

describe('Navigation', () => {
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
        const homeLink = screen.getByRole('link', { name: /hem/i })
        const homeIcon = homeLink.querySelector('svg')
        expect(homeIcon).toBeInTheDocument()
    })
})
