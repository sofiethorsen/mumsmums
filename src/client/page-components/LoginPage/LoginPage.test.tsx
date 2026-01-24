import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginPage from './LoginPage'

// Mock next/router
const mockPush = jest.fn()
let mockQuery: Record<string, string> = {}

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockPush,
        query: mockQuery,
    }),
}))

// Mock PageFrame to simplify tests
jest.mock('../../components/PageFrame/PageFrame', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock environment
jest.mock('../../constants/environment', () => ({
    BACKEND_BASE_URI: 'http://localhost:8080',
}))

describe('LoginPage', () => {
    beforeEach(() => {
        mockPush.mockClear()
        mockQuery = {}
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('renders the login form', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ authenticated: false }),
        })

        render(<LoginPage />)

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /logga in/i })).toBeInTheDocument()
        })

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/lösenord/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /logga in/i })).toBeInTheDocument()
    })

    it('redirects to home if already authenticated', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ authenticated: true }),
        })

        render(<LoginPage />)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/')
        })
    })

    it('redirects to specified redirect query param if already authenticated', async () => {
        mockQuery.redirect = '/admin'

        ;(global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ authenticated: true }),
        })

        render(<LoginPage />)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/admin')
        })
    })

    it('submits login form with email and password', async () => {
        ;(global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                json: async () => ({ authenticated: false }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            })

        render(<LoginPage />)

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /logga in/i })).toBeInTheDocument()
        })

        const emailInput = screen.getByLabelText(/email/i)
        const passwordInput = screen.getByLabelText(/lösenord/i)
        const submitButton = screen.getByRole('button', { name: /logga in/i })

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:8080/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
                })
            )
        })
    })

})
