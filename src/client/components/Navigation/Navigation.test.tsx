import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navigation from './Navigation'
import { renderWithIntl } from '../../test-utils/renderWithIntl'

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        asPath: '/',
    }),
}))

describe('Navigation', () => {
    it('renders the navigation bar', () => {
        renderWithIntl(<Navigation />)
        const nav = screen.getByRole('navigation')
        expect(nav).toBeInTheDocument()
    })

    it('renders the logo that links to home', () => {
        renderWithIntl(<Navigation />)
        const homeLink = screen.getByRole('link', { name: /hem/i })
        expect(homeLink).toBeInTheDocument()
        expect(homeLink).toHaveAttribute('href', '/')
    })

    it('renders the home icon', () => {
        renderWithIntl(<Navigation />)
        const homeLink = screen.getByRole('link', { name: /hem/i })
        const homeIcon = homeLink.querySelector('svg')
        expect(homeIcon).toBeInTheDocument()
    })

    it('renders the language switcher', () => {
        renderWithIntl(<Navigation />)
        const switcher = screen.getByRole('link', { name: /switch to english/i })
        expect(switcher).toBeInTheDocument()
        expect(switcher).toHaveTextContent('SV')
    })
})
